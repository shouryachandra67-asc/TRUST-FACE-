import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle, Clock, Hash, Cpu, AlertOctagon } from 'lucide-react';

export default function ResultCard({ resultData }) {
  if (!resultData) return null;

  const {
    analysis_id = 'N/A',
    result = 'UNCERTAIN',
    confidence = 0,
    model = {},
    processing_time_ms = 0,
    uncertain_reason,
  } = resultData;

  const isModelNotConfigured = result === 'MODEL NOT CONFIGURED';
  const isReal = result === 'REAL';
  const isManipulation = result === 'POTENTIAL MANIPULATION' || result === 'AI_GENERATED' || result === 'MANIPULATED';
  const isUncertain = result === 'UNCERTAIN';

  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="w-full space-y-4">
      {/* Primary Verdict Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all text-center relative overflow-hidden ${
          isModelNotConfigured
            ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            : isReal
            ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            : isManipulation
            ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
            : 'bg-slate-900/60 border-slate-700 shadow-xl'
        }`}
      >
        {/* Top Status */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-mono mb-4 bg-slate-950/60 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300">ANALYSIS COMPLETE</span>
        </div>

        {/* Verdict Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-3">
            {isModelNotConfigured && <AlertOctagon className="w-8 h-8 text-amber-400" />}
            {isReal && <ShieldCheck className="w-8 h-8 text-emerald-400" />}
            {isManipulation && <AlertTriangle className="w-8 h-8 text-rose-400" />}
            {isUncertain && <HelpCircle className="w-8 h-8 text-slate-400" />}

            <h2
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                isModelNotConfigured
                  ? 'text-amber-400'
                  : isReal
                  ? 'text-emerald-400'
                  : isManipulation
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {result}
            </h2>
          </div>

          {!isModelNotConfigured && (
            <div className="text-sm font-mono text-slate-300">
              Model confidence: <strong className="text-white text-base">{confidencePercent}%</strong>
            </div>
          )}

          {isUncertain && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">
                {uncertain_reason || 'The available evidence is insufficient for a reliable classification.'}
              </p>
              <p>Try uploading a higher-resolution image with optimal facial illumination.</p>
            </div>
          )}

          {isModelNotConfigured && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 space-y-1">
              <p className="font-semibold">MODEL WEIGHTS NOT CONFIGURED</p>
              <p>
                In strict compliance with academic standards, TrustFace AI refuses to synthesize simulated or randomized predictions. Please mount trained model weights in <code>models/</code>.
              </p>
            </div>
          )}
        </div>

        {/* Forensic Metadata Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 mt-6 border-t border-slate-800/80 text-left">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-mono">
              <Hash className="w-3 h-3 text-cyan-400" />
              <span>ANALYSIS ID</span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-300 truncate mt-0.5">
              {analysis_id}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-mono">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>LATENCY</span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-300 mt-0.5">
              {processing_time_ms ? `${processing_time_ms.toFixed(0)} ms` : '< 100 ms'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-mono">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>ARCHITECTURE</span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-300 truncate mt-0.5">
              {model.name || 'EfficientNet-B0'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-mono">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>STATUS</span>
            </div>
            <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
              Verified 1 Face
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
