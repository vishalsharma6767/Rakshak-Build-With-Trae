'use client';

export default function RiskScoreMeter({ score, verdict, reasons }) {
  const getScoreColor = (s) => {
    if (s < 30) return '#10b981'; // emerald-500
    if (s < 70) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getVerdictBg = (v) => {
    if (v === 'SAFE') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (v === 'SUSPICIOUS') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const color = getScoreColor(score);

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative bg-[#12121a]/80 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl h-full flex flex-col overflow-hidden">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Threat Quantification</h3>
          </div>
          <p className="text-sm text-slate-400 font-medium">Real-time risk telemetry</p>
        </div>

        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative w-72 h-72 flex items-center justify-center mb-16">
            {/* HUD Elements */}
            <div className="absolute inset-0 border border-white/5 rounded-full scale-110 animate-pulse"></div>
            <div className="absolute inset-0 border border-indigo-500/10 rounded-full scale-125"></div>
            
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="24"
                fill="transparent"
              />
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke={color}
                strokeWidth="24"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - score / 100)}
                strokeLinecap="round"
                className="transition-all duration-[2000ms] ease-out"
                style={{ filter: `drop-shadow(0 0 15px ${color}66)` }}
              />
            </svg>
            
            <div className="text-center z-10">
              <div className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {score}<span className="text-2xl opacity-20 ml-1">%</span>
              </div>
              <div className="text-[10px] uppercase font-black tracking-[0.5em] text-slate-500 mt-4">Risk Factor</div>
            </div>
          </div>

          <div className={`w-full py-6 rounded-2xl border-2 text-center font-black text-2xl mb-12 tracking-[0.2em] shadow-2xl transition-all duration-500 ${getVerdictBg(verdict)}`}>
            {verdict}
          </div>

          <div className="w-full space-y-8">
            <div className="flex items-center gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">Primary Drivers</h4>
              <div className="h-px w-full bg-white/5"></div>
            </div>
            <div className="space-y-4">
              {reasons?.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 group/item hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: color }}></div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover/item:text-white transition-colors">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}