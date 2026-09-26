import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

export default function AnalysisProgress({ currentStep = 'IDLE', uploadProgress = 0 }) {
  // Ordered pipeline steps
  const steps = [
    { key: 'UPLOADING', label: 'Uploading image', desc: uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : '' },
    { key: 'VALIDATING', label: 'Validating image headers & format', desc: '' },
    { key: 'DETECTING_FACE', label: 'Detecting face & enforcing single-subject constraint', desc: '' },
    { key: 'PREPROCESSING', label: 'Cropping ROI & normalizing tensor (224x224)', desc: '' },
    { key: 'ANALYZING', label: 'Running convolutional neural model inference', desc: '' },
    { key: 'GENERATING_EXPLANATION', label: 'Computing Grad-CAM gradient attention map', desc: '' },
    { key: 'PREPARING_REPORT', label: 'Calibrating confidence & preparing forensic report', desc: '' },
  ];

  const stepOrder = [
    'UPLOADING',
    'VALIDATING',
    'DETECTING_FACE',
    'PREPROCESSING',
    'ANALYZING',
    'GENERATING_EXPLANATION',
    'PREPARING_REPORT',
    'COMPLETED',
  ];

  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl glass-panel-glow border border-cyan-500/30 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">
            FORENSIC INFERENCE IN PROGRESS
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">
          Step {Math.min(currentIndex + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {steps.map((s, idx) => {
          const isDone = currentIndex > idx || currentStep === 'COMPLETED';
          const isRunning = currentIndex === idx;
          const isPending = currentIndex < idx;

          return (
            <div
              key={s.key}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                isRunning
                  ? 'bg-cyan-950/40 border border-cyan-500/30'
                  : 'bg-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : isRunning ? (
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full text-slate-600 flex items-center justify-center">
                    <Circle className="w-3.5 h-3.5" />
                  </div>
                )}

                <span
                  className={`text-xs ${
                    isDone
                      ? 'text-slate-300'
                      : isRunning
                      ? 'text-cyan-300 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {s.desc && (
                <span className="text-[11px] font-mono text-cyan-400 font-medium">
                  {s.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
