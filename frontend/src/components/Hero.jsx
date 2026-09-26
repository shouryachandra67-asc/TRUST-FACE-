import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Upload, Camera, Eye, Cpu, Lock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const steps = [
    { num: '01', title: 'Upload / Ingest', desc: 'Secure ephemeral intake with MIME verification' },
    { num: '02', title: 'Detect Face', desc: 'Strict single-face validation constraint' },
    { num: '03', title: 'Analyze', desc: 'Convolutional neural backbone micro-texture inspection' },
    { num: '04', title: 'Explain', desc: 'Grad-CAM visual attention activation maps' },
    { num: '05', title: 'Verify', desc: 'Authoritative confidence-calibrated forensic verdict' },
  ];

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-indigo-600/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal Authenticity & Identity Forensic Engine</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            TRUSTFACE <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-xl sm:text-2xl font-medium tracking-wide text-cyan-400/90 font-mono">
            Verify. Detect. Trust.
          </p>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            AI-powered digital media authenticity analysis. Inspect facial imagery for synthetic generation,
            face-swapping manipulation, and biometric artifacts with transparent Grad-CAM explainability.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/analyze"
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-base shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all border border-cyan-400/30 group"
          >
            <Upload className="w-5 h-5 text-cyan-200 group-hover:-translate-y-0.5 transition-transform" />
            <span>Upload Image</span>
          </Link>

          <Link
            to="/camera"
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl glass-panel hover:bg-slate-800/60 text-slate-200 hover:text-white font-medium text-base transition-all border border-slate-700/80 group"
          >
            <Camera className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
            <span>Use Live Camera</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
          {[
            { icon: Shield, title: 'AI Deepfake Detection' },
            { icon: Eye, title: 'Face Bounding Analysis' },
            { icon: Cpu, title: 'Explainable AI (Grad-CAM)' },
            { icon: Lock, title: 'Privacy-Focused Processing' },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-left"
              >
                <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-medium text-slate-300">{feat.title}</span>
              </div>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div className="pt-16 text-left">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">Forensic Pipeline Architecture</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">Multi-stage pipeline adhering to zero-trust verification principles</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative p-4 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{step.num}</span>
                    {idx < steps.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
