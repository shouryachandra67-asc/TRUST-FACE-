import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, BookOpen, Scale, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic & Ethics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          About TrustFace AI
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          An applied research initiative in computer vision, deep learning forensics, and cybersecurity.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Award className="w-6 h-6" />
          <h2 className="text-lg font-bold text-slate-100 font-mono">Academic Research Objective</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The proliferation of hyper-realistic generative artificial intelligence (Diffusion models, GANs, auto-encoder face swappers) threatens digital identity verification and authentication protocols. TrustFace AI was designed as a production-grade academic framework to empirically demonstrate explainable neural forensic analysis for single-subject facial imagery.
        </p>
      </div>

      {/* Ethical Safeguards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Lock className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Zero-Biometric Retention</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unlike commercial platforms that harvest uploaded media, TrustFace AI operates on strict zero-retention principles. All images and frames exist in temporary RAM during execution and are discarded immediately upon response dispatch.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Scale className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Strict Anti-Pseudo AI Policy</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform categorically forbids hard-coded dummy results or random functions. When neural weights are missing or uncalibrated, the system explicitly logs <code>MODEL NOT CONFIGURED</code> to preserve academic integrity.
          </p>
        </div>
      </div>

      {/* Limitations Notice */}
      <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
        <div className="flex items-center space-x-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-bold font-mono">Known Scientific Limitations</h3>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          TrustFace AI provides a probabilistic assessment. No machine learning system can guarantee 100% accuracy across every conceivable compression artifact, hostile adversarial noise perturbation, or novel generative architecture. The platform should be utilized as an advisory analytical tool rather than absolute legal evidence.
        </p>
      </div>
    </div>
  );
}
