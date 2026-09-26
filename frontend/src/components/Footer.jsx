import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-slate-100 font-bold">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="tracking-wide">TRUSTFACE AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-layered digital media forensics and biometric integrity assessment platform.
            Grounded in convolutional architectures, mathematical calibration, and visual explainability.
          </p>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400/80">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Biometric Persistent Storage</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/analyze" className="hover:text-cyan-400 transition-colors">Facial Media Forensics</Link></li>
            <li><Link to="/camera" className="hover:text-cyan-400 transition-colors">Live Ingestion Analysis</Link></li>
            <li><span className="text-slate-600">Video Stream Sampling (Roadmap)</span></li>
            <li><span className="text-slate-600">Audio Synthetic Spoof (Roadmap)</span></li>
            <li><span className="text-slate-600">Document Anti-Tamper (Roadmap)</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Academic Rigor</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">Computer Vision Pipeline</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">Evaluation & Confusion Matrix</Link></li>
            <li><a href="https://pytorch.org" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">PyTorch Backbone (EfficientNet)</a></li>
            <li><span className="text-slate-400">Grad-CAM Feature Maps</span></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Integrity Guarantee</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            TrustFace AI enforces strict mathematical model execution. No random functions or fabricated percentages are permitted.
          </p>
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Server-authoritative verdicts with probabilistic confidence bounds.</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 TrustFace AI. Academic & Engineering Research Project.</p>
        <p className="font-mono mt-2 sm:mt-0">v1.0.0 • Python 3.11+ / PyTorch / React</p>
      </div>
    </footer>
  );
}
