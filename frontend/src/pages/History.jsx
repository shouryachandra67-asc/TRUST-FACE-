import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  Eye
} from 'lucide-react';
import { apiService } from '../services/api';

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiService.getVerificationHistory(50, filter);
      setRecords(data.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const filteredRecords = records.filter((r) => 
    !search || r.verification_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <HistoryIcon className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Verification History & Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable regulatory audit log for identity verifications and fraud attempts.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by verification ID..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-300 font-mono"
          >
            <option value="">ALL STATUSES</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
            <option value="INCOMPLETE">INCOMPLETE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-semibold">TIMESTAMP</th>
              <th className="pb-3 font-semibold">VERIFICATION ID</th>
              <th className="pb-3 font-semibold">POLICY</th>
              <th className="pb-3 font-semibold">AUTHENTICITY</th>
              <th className="pb-3 font-semibold">IDENTITY MATCH</th>
              <th className="pb-3 font-semibold">LIVENESS PAD</th>
              <th className="pb-3 font-semibold">DOCUMENT</th>
              <th className="pb-3 font-semibold">DECISION</th>
              <th className="pb-3 font-semibold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500 font-sans">
                  {loading ? 'Loading verification history...' : 'No verification records found matching filter.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 text-slate-400">{r.created_at ? r.created_at.slice(0, 19).replace('T', ' ') : 'N/A'}</td>
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
                  <td className="py-3 text-right">
                    <Link
                      to={`/results/${r.verification_id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] underline"
                    >
                      Report
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
