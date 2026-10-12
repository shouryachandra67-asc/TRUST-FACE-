import React from 'react';
import { Shield, Lock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-[#060a12] text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="tracking-wider text-base">VERITYAI PLATFORM</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Autonomous multi-vector identity verification, deepfake detection, liveness presentation-attack defense, 
            and document forensic analysis platform.
          </p>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400/90">
            <Lock className="w-3.5 h-3.5" />
            <span>DPDP India 2023 & GDPR Privacy Compliant</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">Verification Modules</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/verify" className="hover:text-cyan-400 transition-colors">Biometric Identity Wizard</Link></li>
            <li><Link to="/deepfake" className="hover:text-cyan-400 transition-colors">Deepfake Media Forensics</Link></li>
            <li><Link to="/liveness" className="hover:text-cyan-400 transition-colors">Active Liveness & PAD</Link></li>
            <li><Link to="/documents" className="hover:text-cyan-400 transition-colors">Document ELA Forensics</Link></li>
            <li><Link to="/results" className="hover:text-cyan-400 transition-colors">Decision Engine Simulator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">Governance & Rigor</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/model-eval" className="hover:text-cyan-400 transition-colors">Holdout Empirical Benchmarks</Link></li>
            <li><Link to="/history" className="hover:text-cyan-400 transition-colors">Verification Audit Trail</Link></li>
            <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy & Retention Settings</Link></li>
            <li><Link to="/admin" className="hover:text-cyan-400 transition-colors">Policy Threshold Engine</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">Integrity Guarantee</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            VerityAI enforces server-authoritative verdicts. Never claims a biometric match without 512D embedding similarity or presentation-attack pass.
          </p>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Independent multi-vector risk evaluation without misleading universal fraud probabilities.</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
        <p>© 2026 VerityAI Platform. Enterprise AI Security & Identity Intelligence.</p>
        <p className="mt-2 sm:mt-0">v2.0.0 • Python 3.13 / PyTorch / React 18 / OpenCV</p>
      </div>
    </footer>
  );
}
