'use client';

import { useState } from 'react';

export default function URLInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-4 p-2 bg-slate-50 border border-slate-200 rounded-[2rem] shadow-inner focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500 transition-all">
        <div className="flex-1 relative flex items-center pl-6">
          <div className="text-indigo-500 mr-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter or paste any link to verify safety..."
            disabled={loading}
            className="w-full py-4 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-lg font-semibold"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`px-12 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
            loading || !url.trim() 
              ? 'bg-slate-300 shadow-none cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-200'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing</span>
            </div>
          ) : (
            <>
              <span>Verify Link</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
      <div className="mt-6 flex justify-between px-8">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sandbox: Secure</span>
          <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI: Flash-2.0</span>
        </div>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Verified Threat Intelligence</span>
      </div>
    </form>
  );
}