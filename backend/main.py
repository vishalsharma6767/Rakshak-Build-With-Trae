import os
print("Backend is starting...")
print(f"Current Working Directory: {os.getcwd()}")
print("Importing dependencies...")
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import google.generativeai as genai
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

# --- Supabase Configuration ---
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
if not url or not key:
    print("Warning: Supabase URL or Key is missing from .env")
else:
    print("Supabase config loaded.")
supabase: Client = create_client(url, key)

# --- Gemini API Configuration ---
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY is missing from .env")
else:
    print("Gemini API key loaded.")
genai.configure(api_key=api_key)

def get_available_model():
    """
    Dynamically finds a model that supports 'generateContent'.
    """
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"Using model: {m.name}")
                return genai.GenerativeModel(m.name)
        # Fallback to a common one if list fails or is empty
        return genai.GenerativeModel('gemini-1.5-flash-latest')
    except Exception as e:
        print(f"Error listing models: {e}")
        return genai.GenerativeModel('gemini-1.5-flash-latest')

gemini_model = get_available_model()

# --- AI Logic ---
async def analyze_with_gemini(url: str, sandbox_insights: Dict[str, Any]) -> Dict[str, Any]:
    print(f"Analyzing with Gemini: {url}")
    try:
        prompt = f"""
        You are a world-class AI cybersecurity expert. Your goal is to help a regular person understand if a link is dangerous.
        
        Analyze this URL and its sandbox simulation logs:
        URL: {url}
        Logs: {json.dumps(sandbox_insights)}

        ### IMPORTANT: RETURN ONLY VALID JSON ###
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
        
        safety_settings = [{"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}]
        
        response = await gemini_model.generate_content_async(prompt, safety_settings=safety_settings)
        
        if not response or not response.text:
            raise Exception("Empty AI response")

        content = response.text.strip()
        
        # Robust JSON extraction
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx != -1 and end_idx != -1:
            content = content[start_idx:end_idx + 1]
        
        return json.loads(content)
    except Exception as e:
        print(f"Detailed Gemini Error: {str(e)}")
        return {
            "risk_score": 50,
            "verdict": "SUSPICIOUS",
            "ai_summary": "We couldn't fully analyze this link, so please be careful.",
            "top_3_verdicts": ["Unknown Link", "Potential Phishing", "Safe Page"],
            "link_behavior": "The AI encountered an error while analyzing this link's behavior.",
            "sandbox_summary": "The simulation finished but the AI couldn't summarize the results.",
            "technical_insight": f"System error during Gemini processing: {str(e)}",
            "timeline": [{"title": "Error", "description": "AI analysis was interrupted.", "timestamp": "0ms"}]
        }

# --- Sandbox Service Integration ---
SANDBOX_URL = "http://localhost:3002/simulate"
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
@app.post("/analyze-url", response_model=AnalysisReport)
async def analyze_url(url_data: URLToAnalyze):
    print(f"Received request to analyze: {url_data.url}")
    sandbox_insights = await get_sandbox_insights(url_data.url)
    ai_result = await analyze_with_gemini(url_data.url, sandbox_insights)
    
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
    try:
        data = supabase.table('reports').select("*").order('created_at', desc=True).limit(10).execute()
        return data.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    print("Starting Uvicorn server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)