# 🛡️ RAKSHAK: AI-Powered Behavioral Cyber-Shield

**Rakshak** (meaning 'Protector') is an advanced cybersecurity intelligence platform designed to detect, analyze, and explain phishing threats in real-time. Built for the next generation of web security, it combines **Behavioral Sandbox Simulation** with **Generative AI (Gemini 2.0)** to provide a human-readable safety report for any URL.

---

## 🚀 The Problem
Phishing attacks are becoming increasingly sophisticated, often bypassing static filters. Most users are left guessing if a link is safe, and existing tools provide technical data that is incomprehensible to the average person.

## 🛡️ The Solution: Rakshak
Rakshak bridges the gap between expert forensics and user safety.
1. **Dynamic Isolation**: Instead of just checking a database, Rakshak opens the link in a secure, isolated cloud sandbox.
2. **Behavioral Tracking**: It monitors network calls, script executions, and form requests to see what the link *actually does*.
3. **AI Intelligence**: Gemini 2.0 analyzes the raw sandbox logs to provide a clear, one-sentence safety brief, a detailed behavior report, and technical forensic data for experts.

---

## ✨ Key Features
- **Neural Scan**: Instant risk quantification (0-100%) with high-fidelity HUD visualization.
- **Multi-View Intelligence**: Seamless transition from scan input to full intelligence reports.
- **Simulation Timeline**: A chronological map of exactly what happened inside the sandbox.
- **Forensic Matrix**: Deep-dive traffic logs and DOM snapshots for security researchers.
- **Professional Dashboard**: A high-vibrancy, "Cyber-Premium" UI designed for clarity and impact.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion (Glassmorphism UI)
- **Backend API**: FastAPI (Python), Uvicorn
- **Intelligence**: Google Gemini 2.0 Flash (Dynamic Model Detection)
- **Sandbox Engine**: Node.js, Puppeteer (Headless Browser Isolation)
- **Database**: Supabase (PostgreSQL)

---

## 📥 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Google AI Studio API Key
- Supabase Account

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_anon_key"
GEMINI_API_KEY="your_google_ai_studio_key"
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

## 🔮 Future Scope
- **Browser Extension**: Real-time protection while browsing.
- **Threat Sharing**: Community-driven database of analyzed malicious links.
- **API for Businesses**: Allow companies to integrate Rakshak into their email filters.

---
&copy; 2026 RAKSHAK PROTOCOL // SECURING THE DIGITAL FRONTIER
