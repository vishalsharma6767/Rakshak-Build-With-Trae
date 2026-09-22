import os
print("Backend is starting...")
print(f"Current Working Directory: {os.getcwd()}")
print("Importing dependencies...")
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv
import json

print("Dependencies imported.")
load_dotenv()
print("Environment variables loaded.")

app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Supabase Configuration (optional, fully functional locally without it) ---
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client | None = None
if not url or not key or url.startswith("your_"):
    print("Warning: Supabase not configured. Reports will not be saved or shown in history.")
else:
    try:
        supabase = create_client(url, key)
        print("Supabase config loaded.")
    except Exception as e:
        print(f"Warning: Invalid Supabase config: {e}")

# --- OpenRouter API Configuration ---
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
api_key = os.environ.get("OPENROUTER_API_KEY")
if not api_key:
    print("Warning: OPENROUTER_API_KEY is missing from .env")
else:
    print("OpenRouter API key loaded.")

# Free models rotate on/off the free tier often, so we try a fallback chain.
# Override the first entry with OPENROUTER_MODEL in .env if you want.
_openrouter_models = [
    os.environ.get("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free"),
    "nvidia/nemotron-3-super-120b-a12b:free",
    "google/gemma-4-26b-a4b-it:free",
    "openrouter/free",
]
OPENROUTER_MODELS = list(dict.fromkeys(_openrouter_models))  # dedupe, keep order
print(f"OpenRouter models: {OPENROUTER_MODELS}")

def extract_json(content: str) -> Dict[str, Any]:
    content = content.strip()
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()
    start_idx = content.find('{')
    end_idx = content.rfind('}')
    if start_idx != -1 and end_idx != -1:
        content = content[start_idx:end_idx + 1]
    return json.loads(content)

def compact_sandbox_insights(sandbox_insights: Dict[str, Any]) -> Dict[str, Any]:
    """
    Builds a small AI-friendly summary of the sandbox logs.
    Raw pageHTML/screenshot are huge, slow the model down, and can blow the
    context window (400 errors). We keep only the behavioral signals.
    """
    summary: Dict[str, Any] = {}
    for key in [
        "initialUrl", "finalUrl", "redirectChain", "networkCalls",
        "consoleMessages", "dialogs", "formSubmissions", "iframes", "scripts",
    ]:
        value = sandbox_insights.get(key)
        if isinstance(value, list):
            summary[key] = value[:50]
        elif value:
            summary[key] = value
    return summary

# --- AI Logic ---
async def analyze_with_ai(url: str, sandbox_insights: Dict[str, Any]) -> Dict[str, Any]:
    print(f"Analyzing with OpenRouter: {url}")
    if not api_key:
        return _fallback_report("OPENROUTER_API_KEY is missing from backend/.env")

    prompt = f"""
    You are a world-class AI cybersecurity expert. Your goal is to help a regular person understand if a link is dangerous.

    Analyze this URL and its sandbox simulation logs:
    URL: {url}
    Logs: {json.dumps(compact_sandbox_insights(sandbox_insights))}

    ### IMPORTANT: RETURN ONLY VALID JSON ###
    No markdown, no commentary before or after the JSON object.
    Required Keys:
    1. "risk_score": (0-100)
    2. "verdict": ("SAFE", "SUSPICIOUS", or "MALICIOUS")
    3. "ai_summary": (A clear, friendly one-sentence warning or safety confirmation)
    4. "top_3_verdicts": (3 distinct possibilities of what this link is, e.g., ["Official Login Page", "Fake Bank Site", "Data Harvesting Script"])
    5. "link_behavior": (A detailed, non-technical explanation of what happens when you click, what data they ask for, and how they try to trick you)
    6. "sandbox_summary": (A simple description of what the sandbox observed)
    7. "technical_insight": (Expert-level details for forensic analysis)
    8. "timeline": (List of objects with title, description, timestamp)
    """

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-Title": "Rakshak",
    }
    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a cybersecurity analyst. You always respond with a single valid JSON object and nothing else.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    last_error = None
    async with httpx.AsyncClient(timeout=90.0) as client:
        for model in OPENROUTER_MODELS:
            try:
                print(f"Trying model: {model}")
                response = await client.post(
                    OPENROUTER_API_URL,
                    headers=headers,
                    json={**payload, "model": model},
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                if not content:
                    raise Exception("Empty AI response")
                result = extract_json(content)
                print(f"Success with model: {model}")
                return result
            except Exception as e:
                last_error = e
                print(f"Model {model} failed: {e}")

    return _fallback_report(str(last_error))

def _fallback_report(error: str) -> Dict[str, Any]:
    return {
        "risk_score": 50,
        "verdict": "SUSPICIOUS",
        "ai_summary": "We couldn't fully analyze this link, so please be careful.",
        "top_3_verdicts": ["Unknown Link", "Potential Phishing", "Safe Page"],
        "link_behavior": "The AI encountered an error while analyzing this link's behavior.",
        "sandbox_summary": "The simulation finished but the AI couldn't summarize the results.",
        "technical_insight": f"System error during AI processing: {error}",
        "timeline": [{"title": "Error", "description": "AI analysis was interrupted.", "timestamp": "0ms"}],
    }

# --- Sandbox Service Integration ---
SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://127.0.0.1:3002/simulate")
async def get_sandbox_insights(url: str) -> Dict[str, Any]:
    print(f"Fetching sandbox insights for: {url}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SANDBOX_URL, json={"url": url}, timeout=35.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Error calling sandbox service: {e}")
        return {}

# --- Database Operations ---
async def save_report(report: Dict[str, Any]):
    if supabase is None:
        print("Skipping save: Supabase not configured.")
        return None
    print("Saving report to Supabase...")
    try:
        data = supabase.table('reports').insert(report).execute()
        return data.data
    except Exception as e:
        print(f"Error saving report to database: {e}")
        return None

# --- Pydantic Models ---
class URLToAnalyze(BaseModel):
    url: str

class SandboxEvent(BaseModel):
    title: str
    description: str
    timestamp: str

class AnalysisReport(BaseModel):
    id: str
    url: str
    risk_score: int
    verdict: str
    ai_summary: str
    top_3_verdicts: List[str]
    link_behavior: str
    sandbox_summary: str
    technical_insight: str
    timeline: List[SandboxEvent]
    sandbox_insights: Dict[str, Any]

# --- API Endpoints ---
@app.get("/")
async def root():
    return {"status": "ok", "service": "rakshak-backend"}

@app.post("/analyze-url", response_model=AnalysisReport)
async def analyze_url(url_data: URLToAnalyze):
    print(f"Received request to analyze: {url_data.url}")
    sandbox_insights = await get_sandbox_insights(url_data.url)
    ai_result = await analyze_with_ai(url_data.url, sandbox_insights)
    
    report_data = {
        "url": url_data.url,
        "risk_score": ai_result.get("risk_score", 50),
        "verdict": ai_result.get("verdict", "SUSPICIOUS"),
        "ai_summary": ai_result.get("ai_summary", ""),
        "top_3_verdicts": ai_result.get("top_3_verdicts", []),
        "link_behavior": ai_result.get("link_behavior", ""),
        "sandbox_summary": ai_result.get("sandbox_summary", ""),
        "technical_insight": ai_result.get("technical_insight", ""),
        "timeline": ai_result.get("timeline", []),
        "sandbox_insights": sandbox_insights
    }

    saved_report = await save_report(report_data)
    
    report_id = saved_report[0]["id"] if saved_report else "temp-id"
    return {**report_data, "id": report_id}

@app.get("/history", response_model=List[AnalysisReport])
async def get_history():
    print("Fetching scan history...")
    if supabase is None:
        print("Skipping history: Supabase not configured.")
        return []
    try:
        data = supabase.table('reports').select("*").order('created_at', desc=True).limit(10).execute()
        return data.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    print("Starting Uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))