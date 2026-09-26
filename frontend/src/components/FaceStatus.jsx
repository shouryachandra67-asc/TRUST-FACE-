import React from 'react';
import { UserCheck, UserX, Users, AlertCircle } from 'lucide-react';

export default function FaceStatus({ count, statusMessage }) {
  if (count === undefined && !statusMessage) return null;

  if (count === 1) {
    return (
      <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm font-medium animate-fadeIn">
        <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold">Face detected ✓</span>
          <span className="text-xs text-emerald-400/80 ml-2 font-mono">Single subject verified</span>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-sm">
        <UserX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-rose-200 uppercase tracking-wide text-xs font-mono">
            NO FACE DETECTED
          </div>
          <p className="text-xs text-rose-300/90 leading-relaxed">
            Please upload an image containing a clear, front-facing human face.
          </p>
        </div>
      </div>
    );
  }

  if (count > 1) {
    return (
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-sm">
        <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-200 uppercase tracking-wide text-xs font-mono">
            MULTIPLE FACES DETECTED ({count})
          </div>
          <p className="text-xs text-amber-300/90 leading-relaxed">
            Please upload an image containing only one face. Multi-subject arbitration is prohibited to prevent forensic ambiguity.
          </p>
        </div>
      </div>
    );
  }

  if (statusMessage) {
    return (
      <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>{statusMessage}</span>
      </div>
    );
  }

  return null;
}
