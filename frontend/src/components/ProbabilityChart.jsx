import React from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';

export default function ProbabilityChart({ scores = {} }) {
  const realScore = typeof scores.real === 'number' ? Math.round(scores.real * 100) : 0;
  const manipScore = typeof scores.manipulation === 'number' ? Math.round(scores.manipulation * 100) : 0;
  const uncertainScore = typeof scores.uncertain === 'number' ? Math.round(scores.uncertain * 100) : 0;

  const categories = [
    { label: 'Real / Genuine', percent: realScore, color: 'from-emerald-600 to-teal-500', barBg: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    { label: 'Potential Manipulation / AI', percent: manipScore, color: 'from-rose-600 to-red-500', barBg: 'bg-rose-500/20', textColor: 'text-rose-400' },
    { label: 'Uncertain / Ambiguous', percent: uncertainScore, color: 'from-slate-500 to-slate-400', barBg: 'bg-slate-500/20', textColor: 'text-slate-400' },
  ];

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Model Confidence Distribution
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400" title="Values represent calibrated softmax output logits mapped to confidence intervals.">
          <span>Softmax Calibrated</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      <div className="space-y-3.5">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">{cat.label}</span>
              <span className={`font-mono font-bold ${cat.textColor}`}>
                {cat.percent}%
              </span>
            </div>

            <div className={`w-full h-2.5 rounded-full ${cat.barBg} overflow-hidden p-0.5`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(cat.percent, 1)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Temperature Scale: T=1.0</span>
        <span>Rejection Floor: &lt; 60%</span>
      </div>
    </div>
  );
}
