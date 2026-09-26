import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Results() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Forensic Inspection Reports
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Verified dossiers generated through the TrustFace AI inference pipeline.
        </p>
      </div>

      <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto" />
        <h3 className="text-base font-semibold text-slate-200">No Historical Scan Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Due to TrustFace AI's zero-biometric retention policy, image pixels are never stored to permanent databases. To generate a real-time inspection dossier, upload an image or activate the camera module.
        </p>
        <div className="pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-md"
          >
            <span>Proceed to Image Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
