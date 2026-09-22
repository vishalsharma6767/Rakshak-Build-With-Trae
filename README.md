# RAKSHAK: AI-Powered Tool

**Rakshak** (meaning 'Protector') is an advanced cybersecurity intelligence platform designed to detect, analyze, and explain phishing threats in real-time. Built for the next generation of web security, it combines **Behavioral Sandbox Simulation** with **Generative AI (OpenRouter free models)** to provide a human-readable safety report for any URL.

---

##  The Problem
Phishing attacks are becoming increasingly sophisticated, often bypassing static filters. Most users are left guessing if a link is safe, and existing tools provide technical data that is incomprehensible to the average person.

##  The Solution: Rakshak
Rakshak bridges the gap between expert forensics and user safety.
1. **Dynamic Isolation**: Instead of just checking a database, Rakshak opens the link in a secure, isolated cloud sandbox.
2. **Behavioral Tracking**: It monitors network calls, script executions, and form requests to see what the link *actually does*.
3. **AI Intelligence**: An OpenRouter free model analyzes the raw sandbox logs to provide a clear, one-sentence safety brief, a detailed behavior report, and technical forensic data for experts.

---

##  Key Features
- **Neural Scan**: Instant risk quantification (0-100%) with high-fidelity HUD visualization.
- **Multi-View Intelligence**: Seamless transition from scan input to full intelligence reports.
- **Simulation Timeline**: A chronological map of exactly what happened inside the sandbox.
- **Forensic Matrix**: Deep-dive traffic logs and DOM snapshots for security researchers.
- **Professional Dashboard**: A high-vibrancy, "Cyber-Premium" UI designed for clarity and impact.

---

##  Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion (Glassmorphism UI)
- **Backend API**: FastAPI (Python), Uvicorn
- **Intelligence**: OpenRouter free models (default: `nvidia/nemotron-3-ultra-550b-a55b:free`, with automatic fallbacks)
- **Sandbox Engine**: Node.js, Puppeteer (Headless Browser Isolation)
- **Database**: Supabase (PostgreSQL)

---

## Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- OpenRouter API Key (free, no credit card: https://openrouter.ai/keys)
- Supabase Account

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_anon_key"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="nvidia/nemotron-3-ultra-550b-a55b:free"
```

### 3. Database Setup
Run the following SQL in your Supabase SQL Editor:
```sql
create table reports (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  risk_score int not null,
  verdict text not null,
  ai_summary text,
  link_behavior text,
  sandbox_summary text,
  technical_insight text,
  top_3_verdicts text[],
  timeline jsonb,
  sandbox_insights jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4. Launch Services
**Sandbox Service:**
```bash
cd sandbox && npm install && node index.js
```
**Backend API:**
```bash
cd backend && pip install -r requirements.txt && python main.py
```
**Frontend Dashboard:**
```bash
cd frontend && npm install && npm run dev
```

---

## Deployment (Railway)

The repo is deployment-ready via `railway.json` (3 Docker services: `sandbox`, `backend`, `frontend`).

**Option A — GitHub → Railway (recommended):**
1. Create a repo on GitHub and push this folder.
2. In Railway: **New Project → Deploy from GitHub repo** → it reads `railway.json` and creates the 3 services automatically. (Your `.env`/OpenRouter key are gitignored, so push is safe.)
3. Set environment variables per service:
   - `backend`:** `OPENROUTER_API_KEY` = your key (`SK-or-...`)
   - `backend`:** `SANDBOX_URL` = `http://${{ sandbox.RAILWAY_PRIVATE_DOMAIN }}` (private networking)
   - `frontend`: `NEXT_PUBLIC_BACKEND_URL` = `https://${{ backend.RAILWAY_PUBLIC_DOMAIN }}`
4. In Networking:
   - `backend` → enable **TCP** public exposure on port 8000 (gives the public domain)
   - `sandbox` → keep private only
   - `frontend` → enable **HTTP/HTTPS** on port 3000 (visit this URL)
5. Redeploy once — the first deploy may fail on health check until `SANDBOX_URL` is set.

**Option B — Railway CLI (skip GitHub):**
```bash
npm install -g @railway/cli
railway login
railway init --name rakshak
cd backend  && railway up --service backend
cd ../sandbox && railway up --service sandbox
cd ../frontend && railway up --service frontend
```
Set the same env vars in the Railway dashboard, expose the same ports.

Notes: free plans get ~$5 credit and low memory — the sandbox (Chrome) is the heaviest, and Backend/Supabase saves history only if `SUPABASE_URL`/`SUPABASE_KEY` are configured.

---

## Future Scope
- **Browser Extension**: Real-time protection while browsing.
- **Threat Sharing**: Community-driven database of analyzed malicious links.
- **API for Businesses**: Allow companies to integrate Rakshak into their email filters.

---
&copy; 2026 RAKSHAK PROTOCOL // SECURING THE DIGITAL FRONTIER
