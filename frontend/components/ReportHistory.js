'use client';

import { useState, useEffect } from 'react';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/history');
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  if (reports.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Recent Checks</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${
                report.verdict === 'SAFE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                report.verdict === 'SUSPICIOUS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {report.verdict}
              </span>
              <span className="text-[10px] font-bold text-slate-300">{report.risk_score}% Risk</span>
            </div>
            
            <p className="text-sm font-bold text-slate-800 truncate mb-2 group-hover:text-indigo-600 transition-colors">{report.url}</p>
            
            <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
              "{report.ai_summary}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}