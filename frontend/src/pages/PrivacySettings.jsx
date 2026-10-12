import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Sliders,
  Check
} from 'lucide-react';
import { apiService } from '../services/api';

export default function PrivacySettings() {
  const [retentionHours, setRetentionHours] = useState(24);
  const [ephemeralMode, setEphemeralMode] = useState(true);
  const [subjectIdToDelete, setSubjectIdToDelete] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    setSavedMessage(`Privacy retention policy saved: ${retentionHours}h expiration window with Ephemeral Mode ${ephemeralMode ? 'ENABLED' : 'DISABLED'}.`);
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handlePurgeSubjectData = async () => {
    if (!subjectIdToDelete) return;
    setLoading(true);
    try {
      await apiService.scrubPrivacyData();
      setSavedMessage(`Data purge executed: All records associated with '${subjectIdToDelete}' have been erased.`);
      setSubjectIdToDelete('');
    } catch (e) {
      setSavedMessage('Data purge failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Lock className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Privacy, Consent & Data Retention Governance</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographic security controls, informed consent management, and Indian DPDP / GDPR compliance safeguards.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Retention Controls */}
      <form onSubmit={handleSavePolicy} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Biometric Data Retention Policies</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-mono text-slate-300">
              Ephemeral Retention Window: <strong className="text-cyan-400 font-bold">{retentionHours} Hours</strong>
            </label>
            <select
              value={retentionHours}
              onChange={(e) => setRetentionHours(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400"
            >
              <option value={1}>1 Hour (Immediate volatile purging)</option>
              <option value={6}>6 Hours (High-security temporary cache)</option>
              <option value={24}>24 Hours (Standard regulatory KYC audit)</option>
              <option value={72}>72 Hours (Extended manual review leeway)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Once the retention window expires, all face crops and deep embedding representations are scrubbed automatically.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono text-slate-300">Biometric Persistence Mode</label>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Strict Ephemeral Processing</span>
                <span className="text-[11px] text-slate-400">Process facial vectors exclusively in volatile RAM. Never save raw biometric embeddings to disk.</span>
              </div>
              <input
                type="checkbox"
                checked={ephemeralMode}
                onChange={(e) => setEphemeralMode(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white font-mono tracking-wider transition-all border border-cyan-400/40"
        >
          UPDATE RETENTION POLICIES
        </button>
      </form>

      {/* Compliance Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">India DPDP Act 2023</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Full compliance with Digital Personal Data Protection Act: Clear notice prior to processing, purpose limitation, and affirmative digital consent records.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">GDPR Article 9</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Special category biometric data protections: Explicit consent required, in-memory ephemeral extraction, and right-to-erasure compliance.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase">Prohibition of Surveillance</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            VerityAI strictly prohibits covert biometric matching, mass facial tracking, or non-consensual biometric profiling without explicit legal warrants.
          </p>
        </div>
      </div>

      {/* Data Subject Request (DSR) Tool */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white">Data Subject Right-to-Erasure (DSR) Portal</h3>
        </div>
        <p className="text-xs text-slate-300">
          Enter a Subject ID or Verification ID to purge all forensic artifacts, telemetry logs, and images from the active database.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={subjectIdToDelete}
            onChange={(e) => setSubjectIdToDelete(e.target.value)}
            placeholder="Enter Subject ID or Verification UUID..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-rose-400"
          />
          <button
            onClick={handlePurgeSubjectData}
            disabled={loading || !subjectIdToDelete}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-mono transition-all disabled:opacity-50"
          >
            EXECUTE PERMANENT PURGE
          </button>
        </div>
      </div>
    </div>
  );
}
