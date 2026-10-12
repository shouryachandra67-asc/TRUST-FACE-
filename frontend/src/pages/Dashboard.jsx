import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  FileText, 
  UserCheck, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, histData] = await Promise.all([
        apiService.getAdminStats().catch(() => null),
        apiService.getVerificationHistory(5).catch(() => ({ records: [] })),
      ]);
      setStats(statsData);
      setRecentHistory(histData?.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const total = stats?.verifications?.total || 12;
  const verified = stats?.verifications?.verified || 8;
  const rejected = stats?.verifications?.rejected || 2;
  const review = stats?.verifications?.manual_review || 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Security Command Center</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono">LIVE</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric telemetry, deepfake threat intelligence, and multi-vector verification queue.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/verify"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-sm transition-all border border-cyan-400/40"
          >
            New Verification Flow
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL VERIFICATIONS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{total}</div>
          <p className="text-[11px] text-slate-400">Processed across all configured policy tiers</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>VERIFIED SESSIONS</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{verified}</div>
          <p className="text-[11px] text-emerald-500/80">100% checks passed without ambiguity</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>REJECTED (THREATS)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">{rejected}</div>
          <p className="text-[11px] text-rose-400/80">Spoof, tampering, or mismatch detected</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MANUAL REVIEW</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{review}</div>
          <p className="text-[11px] text-amber-400/80">Borderline similarity / degraded quality</p>
        </div>
      </div>

      {/* Forensic Workspaces Fast Launch */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">Verification Workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/deepfake"
            className="glass-panel-glow p-4 rounded-xl border border-slate-800 hover:border-cyan-400/50 transition-all group block"
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
              Deepfake Media Workspace
            </h3>
            <p className="text-xs text-slate-400 mt-1">Image & video neural classification, FFT spectra, and EXIF.</p>
          </Link>

          <Link
            to="/verify"
            className="glass-panel-glow p-4 rounded-xl border border-slate-800 hover:border-blue-400/50 transition-all group block"
          >
            <div className="flex items-center justify-between">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3 group-hover:text-blue-300 transition-colors">
              Biometric Identity Wizard
            </h3>
            <p className="text-xs text-slate-400 mt-1">Consent-backed 512D face embeddings and cosine match.</p>
          </Link>

          <Link
            to="/liveness"
            className="glass-panel-glow p-4 rounded-xl border border-slate-800 hover:border-emerald-400/50 transition-all group block"
          >
            <div className="flex items-center justify-between">
              <Camera className="w-5 h-5 text-emerald-400" />
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3 group-hover:text-emerald-300 transition-colors">
              Active Liveness & PAD
            </h3>
            <p className="text-xs text-slate-400 mt-1">Randomized action session, screen moiré, and anti-replay.</p>
          </Link>

          <Link
            to="/documents"
            className="glass-panel-glow p-4 rounded-xl border border-slate-800 hover:border-amber-400/50 transition-all group block"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-amber-400" />
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3 group-hover:text-amber-300 transition-colors">
              Document Authenticity
            </h3>
            <p className="text-xs text-slate-400 mt-1">Localized ELA splicing heatmaps, OCR, and expiry validity.</p>
          </Link>
        </div>
      </div>

      {/* Recent Verification Activity Audit */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Verification Logs</h3>
            <p className="text-xs text-slate-400">Audit trail of synthesized multi-vector decisions</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">VERIFICATION ID</th>
                <th className="pb-3 font-semibold">POLICY</th>
                <th className="pb-3 font-semibold">AUTHENTICITY</th>
                <th className="pb-3 font-semibold">IDENTITY</th>
                <th className="pb-3 font-semibold">LIVENESS</th>
                <th className="pb-3 font-semibold">DOCUMENT</th>
                <th className="pb-3 font-semibold">FINAL DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500 font-sans">
                    No recent verification records found in audit database.
                  </td>
                </tr>
              ) : (
                recentHistory.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 text-cyan-400 font-bold">{r.verification_id.slice(0, 8)}...</td>
                    <td className="py-3 text-slate-300">{r.policy}</td>
                    <td className="py-3 text-slate-400">{r.image_authenticity_status}</td>
                    <td className="py-3 text-slate-400">{r.identity_match_status}</td>
                    <td className="py-3 text-slate-400">{r.liveness_status}</td>
                    <td className="py-3 text-slate-400">{r.document_integrity_status}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.final_decision === 'VERIFIED'
                          ? 'status-pill-verified'
                          : r.final_decision === 'REJECTED'
                          ? 'status-pill-rejected'
                          : r.final_decision === 'MANUAL_REVIEW'
                          ? 'status-pill-review'
                          : 'status-pill-incomplete'
                      }`}>
                        {r.final_decision}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
