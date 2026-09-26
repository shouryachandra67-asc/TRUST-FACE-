import React, { useState } from 'react';
import { Eye, Info, Layers, ZoomIn } from 'lucide-react';

export default function HeatmapViewer({ originalImage, faceCropImage, heatmapImage }) {
  const [activeTab, setActiveTab] = useState('heatmap'); // 'original', 'crop', 'heatmap'

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
      {/* Header and Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Explainable AI (Grad-CAM)
          </h4>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'original'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'crop'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Face Crop
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Heatmap
          </button>
        </div>
      </div>

      {/* Visual Canvas Viewer */}
      <div className="relative min-h-[300px] flex items-center justify-center rounded-xl bg-slate-950/90 border border-slate-800/90 overflow-hidden p-4">
        {activeTab === 'original' && (
          <img
            src={originalImage}
            alt="Original Uploaded Source"
            className="max-h-80 max-w-full object-contain rounded-lg shadow-md animate-fadeIn"
          />
        )}

        {activeTab === 'crop' && (
          <div className="text-center space-y-2 animate-fadeIn">
            {faceCropImage ? (
              <img
                src={faceCropImage}
                alt="Isolated Face Bounding Box"
                className="max-h-72 w-auto object-contain rounded-lg border border-cyan-500/30 shadow-lg mx-auto"
              />
            ) : (
              <p className="text-xs text-slate-500 font-mono">Face crop rendering in progress...</p>
            )}
            <span className="text-[11px] font-mono text-slate-400 block">
              224x224 RGB Affine Bounding Box
            </span>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="text-center space-y-2 animate-fadeIn">
            {heatmapImage ? (
              <div className="relative inline-block rounded-lg overflow-hidden border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <img
                  src={heatmapImage}
                  alt="Grad-CAM Visual Attention Heatmap"
                  className="max-h-72 w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                Grad-CAM activation computation pending or unavailable for current model.
              </div>
            )}
            <span className="text-[11px] font-mono text-cyan-400 block">
              Gradient-Weighted Class Activation Map (Final Conv Layer)
            </span>
          </div>
        )}
      </div>

      {/* Required Disclaimer */}
      <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Explainability Notice:</strong> The highlighted areas indicate regions that influenced the model's prediction. They should not be interpreted as definitive proof that those specific pixels were manipulated.
        </p>
      </div>
    </div>
  );
}
