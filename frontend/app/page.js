'use client';

import { useState, useEffect } from 'react';
import URLInput from '@/components/URLInput';
import RiskScoreMeter from '@/components/RiskScoreMeter';
import ReportPanel from '@/components/ReportPanel';
import ReportHistory from '@/components/ReportHistory';

export default function Home() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('input'); // 'input', 'loading', 'result'

  const handleAnalyze = async (url) => {
    setView('loading');
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Analysis Engine Offline: Please verify connection.');
      }
      const data = await response.json();
      setReport(data);
      setView('result');
    } catch (err) {
      console.error("Error analyzing URL:", err);
      setError(err.message);
      setView('input');
    }
    setLoading(false);
  };

  const handleBackToInput = () => {
    setView('input');
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={handleBackToInput}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-14 h-14 bg-[#12121a] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-400 font-black text-3xl">R</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-none">RAKSHAK</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1.5 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">Advanced AI Shield</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-12">
            {view === 'result' && (
              <button 
                onClick={handleBackToInput}
                className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                New Scan
              </button>
            )}
            <div className="h-8 w-px bg-white/5"></div>
            <button className="relative group px-8 py-3 overflow-hidden rounded-full transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:scale-110 transition-transform duration-500"></div>
              <span className="relative text-[10px] font-black uppercase tracking-widest text-white">Get Pro Access</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 relative">
        
        {/* INPUT VIEW */}
        {view === 'input' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center mb-24 relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-bounce">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">v2.0 Neural Engine Active</span>
              </div>
              <h2 className="text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                Verify Before You <br/>It <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">Starts.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
                The world's first behavioral AI that opens suspicious links in a safe, isolated cloud environment to protect your digital identity.
              </p>
              
              <div className="max-w-4xl mx-auto p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                <div className="bg-[#0a0a0f] rounded-[2rem] p-8 border border-white/5">
                  <URLInput onAnalyze={handleAnalyze} loading={loading} />
                </div>
              </div>

              {error && (
                <div className="mt-10 inline-flex items-center gap-4 text-rose-400 text-sm font-black bg-rose-500/10 px-8 py-5 rounded-2xl border border-rose-500/20 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-xl">⚠️</div>
                  <div className="text-left">
                    <p className="uppercase tracking-widest text-[10px] text-rose-500 mb-0.5">System Warning</p>
                    {error}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-32 border-t border-white/5 pt-20">
              <ReportHistory />
            </div>
          </div>
        )}

        {/* LOADING VIEW */}
        {view === 'loading' && (
          <div className="py-48 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative w-40 h-40 mb-16">
              <div className="absolute inset-0 border-[16px] border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-[16px] border-indigo-500 rounded-full border-t-transparent animate-spin shadow-[0_0_50px_rgba(99,102,241,0.4)]"></div>
              <div className="absolute inset-8 border-[8px] border-purple-500/30 rounded-full border-b-transparent animate-spin-slow shadow-[0_0_30px_rgba(168,85,247,0.2)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-center space-y-6">
              <h3 className="text-4xl font-black text-white uppercase tracking-[0.5em] drop-shadow-2xl">Initializing Sandbox</h3>
              <p className="text-indigo-400 font-black text-sm uppercase tracking-[0.3em] animate-pulse">Neural engine is isolating data packets...</p>
            </div>
          </div>
        )}

        {/* RESULT VIEW */}
        {view === 'result' && report && (
          <div className="animate-in fade-in slide-in-from-right-12 duration-1000">
            <div className="flex items-center justify-between mb-12">
              <button 
                onClick={handleBackToInput}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Return to Command Center
              </button>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Scan Reference:</span>
                <span className="text-xs font-mono text-indigo-400">#{report.id.slice(0,8).toUpperCase()}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-12 items-start">
              <div className="col-span-12 lg:col-span-4 sticky top-32">
                <RiskScoreMeter score={report.risk_score} verdict={report.verdict} reasons={report.top_3_verdicts} />
              </div>
              <div className="col-span-12 lg:col-span-8">
                <ReportPanel report={report} />
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-[#050507] border-t border-white/5 py-24 mt-40 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
          <div className="col-span-2 space-y-10">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center font-black text-2xl shadow-2xl">R</div>
              <span className="text-3xl font-black tracking-tighter">RAKSHAK</span>
            </div>
            <p className="max-w-md text-lg text-slate-500 leading-relaxed font-medium italic">
              "Redefining cyber-resilience through behavioral AI and cloud isolation."
            </p>
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Status</span>
                <span className="text-xs font-bold text-green-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nodes</span>
                <span className="text-xs font-bold text-indigo-400">GLOBAL_CLUSTER_04</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 opacity-50">Security Suite</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <li className="hover:text-indigo-400 cursor-pointer transition-all hover:translate-x-2">Threat Vault</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-all hover:translate-x-2">Sandbox API</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-all hover:translate-x-2">Enterprise SDK</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 opacity-50">Intelligence</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <li className="hover:text-indigo-400 cursor-pointer transition-all hover:translate-x-2">Safety Buffer</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-all hover:translate-x-2">Cyber Ethics</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-all hover:translate-x-2">Neural Docs</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-32 pt-10 border-t border-white/5 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-700">© 2026 RAKSHAK PROTOCOL // THE ULTIMATE DEFENSE</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0f;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e1e2e;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2e2e3e;
        }
      `}</style>
    </div>
  );
}