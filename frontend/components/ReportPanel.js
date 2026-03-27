'use client';

import { useState } from 'react';

export default function ReportPanel({ report }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Safety Analysis' },
    { id: 'sandbox', label: 'Behavioral Sandbox' },
    { id: 'technical', label: 'Technical Forensic' },
  ];

  return (
    <div className="relative group h-full">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-xl opacity-50"></div>
      
      <div className="relative bg-[#12121a]/80 border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex bg-white/5 border-b border-white/5 p-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-[1.5rem] relative overflow-hidden group/btn ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 animate-pulse"></div>
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-12 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Intelligence Brief */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Intelligence Brief</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 overflow-hidden group/brief">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/brief:opacity-30 transition-opacity">
                    <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/></svg>
                  </div>
                  <p className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                    {report.ai_summary || "Neural engine processing safety parameters..."}
                  </p>
                </div>
              </div>

              {/* Classification Matrix */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Classification Matrix</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {report.top_3_verdicts?.map((v, i) => (
                    <div key={i} className="relative group/card">
                      <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition duration-500"></div>
                      <div className="relative px-8 py-6 bg-[#1a1a24] border border-white/5 rounded-2xl flex items-center gap-5 shadow-xl transition-transform duration-300 group-hover/card:-translate-y-1">
                        <span className="text-2xl font-black text-indigo-500/30 group-hover/card:text-indigo-400 transition-colors italic">0{i+1}</span>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Insight */}
              <div className="space-y-8 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Behavioral Insight</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="bg-[#1a1a24] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group/insight shadow-2xl">
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/insight:opacity-100 transition-opacity duration-700"></div>
                  <p className="text-xl text-slate-300 leading-relaxed font-medium italic relative z-10">
                    "{report.link_behavior || "Monitoring behavioral nodes for anomalies..."}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Simulation Summary</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="bg-[#1a1a24] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <p className="text-xl text-slate-300 leading-relaxed font-medium">
                    {report.sandbox_summary}
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Execution Chronology</h4>
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-6 before:w-px before:bg-white/5">
                  {report.timeline?.map((event, idx) => (
                    <div key={idx} className="relative pl-16 group/ev">
                      <div className="absolute left-[19px] top-3 w-3 h-3 bg-[#12121a] border-2 border-slate-700 rounded-full group-hover/ev:border-indigo-500 group-hover/ev:scale-125 transition-all duration-500 z-10"></div>
                      <div className="bg-[#1a1a24] border border-white/5 p-8 rounded-[2rem] shadow-xl group-hover/ev:border-white/10 transition-all duration-500 group-hover/ev:bg-[#1e1e2e]">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-black text-white uppercase tracking-widest">{event.title}</h5>
                          <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">{event.timestamp}</span>
                        </div>
                        <p className="text-base text-slate-400 font-medium leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Forensic Matrix</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="bg-black/60 p-12 rounded-[3rem] font-mono text-sm text-indigo-300 leading-relaxed border border-white/5 shadow-inner overflow-x-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap">{report.technical_insight}</pre>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Intercepted Telemetry</h4>
                <div className="max-h-[40rem] overflow-y-auto bg-black/40 rounded-[3rem] border border-white/5 p-8 space-y-4 custom-scrollbar">
                  {report.sandbox_insights.networkCalls?.map((call, idx) => (
                    <div key={idx} className="flex gap-8 p-6 bg-[#1a1a24] border border-white/5 rounded-2xl hover:bg-[#1e1e2e] transition-all group/call items-center shadow-lg">
                      <span className="text-indigo-400 font-black text-[11px] w-20 px-4 py-2 bg-indigo-500/10 rounded-xl text-center border border-indigo-500/20">
                        {call.status}
                      </span>
                      <span className="text-slate-500 font-black uppercase text-[11px] w-16">{call.method}</span>
                      <span className="truncate flex-1 text-sm font-bold text-slate-400 group-hover/call:text-white transition-colors lowercase tracking-tighter">
                        {call.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}