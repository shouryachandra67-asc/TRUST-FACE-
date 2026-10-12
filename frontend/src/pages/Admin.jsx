import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Trash2, 
  Sliders, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrubMessage, setScrubMessage] = useState('');
  const [matchThreshold, setMatchThreshold] = useState(0.65);
  const [padThreshold, setPadThreshold] = useState(0.70);
  const [tamperThreshold, setTamperThreshold] = useState(0.35);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [s, logs] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAuditLogs(20),
      ]);
      setStats(s);
      setAuditLogs(logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTriggerScrub = async () => {
    try {
      const res = await apiService.scrubPrivacyData();
      setScrubMessage(`Successfully scrubbed ${res.scrubbed_records_count} expired records under ${res.retention_policy_hours}h retention policy.`);
      fetchAdminData();
    } catch (e) {
      setScrubMessage('Scrubber execution failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Security Administration & Policy Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            System health telemetry, decision threshold tuning, and immutable regulatory audit trail.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {scrubMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{scrubMessage}</span>
        </div>
      )}

      {/* Decision Thresholds Tuner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Configurable Decision Policy Thresholds</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Biometric Match Threshold</span>
              <span className="text-cyan-400 font-bold">{matchThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.85"
              step="0.01"
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-mono">Scores below {matchThreshold.toFixed(2)} flagged as NO_MATCH or REVIEW</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Liveness PAD Pass Score</span>
              <span className="text-emerald-400 font-bold">{padThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.01"
              value={padThreshold}
              onChange={(e) => setPadThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-mono">Requires natural biological motion and moiré risk &lt; 0.35</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Document Tampering (ELA) Limit</span>
              <span className="text-rose-400 font-bold">{tamperThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.60"
              step="0.01"
              value={tamperThreshold}
              onChange={(e) => setTamperThreshold(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-mono">Discrepancies above {tamperThreshold.toFixed(2)} trigger TAMPERED alert</p>
          </div>
        </div>
      </div>

      {/* System Health Diagnostics & Privacy Retention Scrubber */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">System Diagnostics & Hardware</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CORE VERSION</span>
              <span className="text-slate-200 font-bold">VerityAI 2.0.0</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">DEVICE RUNTIME</span>
              <span className="text-cyan-400 font-bold">PyTorch Torchvision (CPU)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">RETENTION WINDOW</span>
              <span className="text-slate-200 font-bold">{stats?.retention_window_hours || 24} Hours</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">PERSISTENCE MODE</span>
              <span className="text-emerald-400 font-bold">Ephemeral Zero-Hoard</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Privacy Scrubber Daemon</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Immediately scrubs facial crops, biometric embedding arrays, and module payloads for any verification record exceeding the 24-hour retention threshold.
          </p>
          <button
            onClick={handleTriggerScrub}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 flex items-center space-x-2 font-mono transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>TRIGGER RETENTION SCRUB NOW</span>
          </button>
        </div>
      </div>

      {/* Immutable Audit Logs Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Immutable Security Audit Stream</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">TIMESTAMP</th>
                <th className="pb-3 font-semibold">ACTION</th>
                <th className="pb-3 font-semibold">ACTOR</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold">RESOURCE ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((l, i) => (
                <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 text-slate-400">{l.timestamp?.slice(0, 19).replace('T', ' ')}</td>
                  <td className="py-2.5 text-cyan-300 font-bold">{l.action}</td>
                  <td className="py-2.5 text-slate-300">{l.actor}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.status === 'SUCCESS' || l.status === 'VERIFIED' ? 'status-pill-verified' : 'status-pill-rejected'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">{l.resource_id ? `${l.resource_id.slice(0, 8)}...` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
