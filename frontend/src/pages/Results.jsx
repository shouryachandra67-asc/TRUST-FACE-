import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Download, 
  Printer, 
  ArrowLeft,
  Clock,
  Fingerprint,
  Camera,
  ShieldAlert,
  Play
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(location.state?.report || null);
  const [loading, setLoading] = useState(false);
  const [testPolicy, setTestPolicy] = useState('BALANCED');

  useEffect(() => {
    if (id && !report) {
      setLoading(true);
      apiService.getVerification(id)
        .then((data) => setReport(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Interactive decision engine simulator test
  const handleSimulateDecision = async (preset) => {
    setLoading(true);
    let payload = {};
    if (preset === 'all_pass') {
      payload = {
        policy: testPolicy,
        image_authenticity: { status: 'REAL', confidence: 0.95 },
        identity_match: { status: 'MATCH', similarity_score: 0.84 },
        liveness: { status: 'PASS', liveness_score: 0.91 },
        document_integrity: { status: 'GENUINE', tamper_risk_score: 0.08 },
      };
    } else if (preset === 'tampered_doc') {
      payload = {
        policy: testPolicy,
        image_authenticity: { status: 'REAL', confidence: 0.95 },
        identity_match: { status: 'MATCH', similarity_score: 0.84 },
        liveness: { status: 'PASS', liveness_score: 0.91 },
        document_integrity: { status: 'TAMPERED', tamper_risk_score: 0.88 },
      };
    } else if (preset === 'spoof_attack') {
      payload = {
        policy: testPolicy,
        image_authenticity: { status: 'REAL', confidence: 0.95 },
        identity_match: { status: 'MATCH', similarity_score: 0.84 },
        liveness: { status: 'FAIL', liveness_score: 0.22 },
        document_integrity: { status: 'GENUINE', tamper_risk_score: 0.08 },
      };
    } else {
      // Incomplete
      payload = {
        policy: testPolicy,
        image_authenticity: { status: 'REAL', confidence: 0.95 },
        identity_match: { status: 'MATCH', similarity_score: 0.84 },
        liveness: { status: 'NOT_TESTED' },
        document_integrity: { status: 'NOT_TESTED' },
      };
    }

    try {
      const rep = await apiService.evaluateVerification(payload);
      setReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (decision) => {
    switch (decision) {
      case 'VERIFIED':
        return {
          color: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/50',
          icon: CheckCircle,
          desc: 'All security checks passed in compliance with policy.',
        };
      case 'REJECTED':
        return {
          color: 'text-rose-400 bg-rose-950/50 border-rose-500/50',
          icon: XCircle,
          desc: 'A defined verification requirement failed (tampering, spoof, mismatch).',
        };
      case 'MANUAL_REVIEW':
        return {
          color: 'text-amber-400 bg-amber-950/50 border-amber-500/50',
          icon: AlertTriangle,
          desc: 'Ambiguous telemetry or borderline similarity requires supervisor review.',
        };
      default:
        return {
          color: 'text-slate-400 bg-slate-900/50 border-slate-700/50',
          icon: HelpCircle,
          desc: 'One or more mandatory verification modules have not been executed.',
        };
    }
  };

  const badge = getStatusBadge(report?.final_decision);
  const StatusIcon = badge.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Verification Decision Report</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative, multi-vector decision synthesis with explainable forensic transparency.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Simulator Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-300">Policy Tier:</span>
          <select
            value={testPolicy}
            onChange={(e) => setTestPolicy(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-400 font-mono"
          >
            <option value="STRICT">STRICT (High-Assurance KYC)</option>
            <option value="BALANCED">BALANCED (Standard Biometric)</option>
            <option value="FAST">FAST (Authenticity & Match)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => handleSimulateDecision('all_pass')}
            className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
          >
            Simulate 100% Pass
          </button>
          <button
            onClick={() => handleSimulateDecision('tampered_doc')}
            className="px-3 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60"
          >
            Simulate Doc Tampering
          </button>
          <button
            onClick={() => handleSimulateDecision('spoof_attack')}
            className="px-3 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60"
          >
            Simulate PAD Replay
          </button>
          <button
            onClick={() => handleSimulateDecision('incomplete')}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Simulate Incomplete
          </button>
        </div>
      </div>

      {!report && !loading && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Verification Loaded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Run an end-to-end verification in the Identity Wizard or click one of the simulator presets above to inspect decision behavior.
          </p>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Master Verdict Banner */}
          <div className={`glass-panel p-6 rounded-2xl border ${badge.color}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">FINAL SYNTHESIZED DECISION</span>
                <div className="flex items-center space-x-3 mt-1">
                  <h2 className="text-3xl font-black">{report.final_decision}</h2>
                  <StatusIcon className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-200 mt-1">{badge.desc}</p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs space-y-1">
                <p className="text-slate-400">Verification ID: <span className="text-white">{report.verification_id?.slice(0, 16)}...</span></p>
                <p className="text-slate-400">Policy: <span className="text-cyan-400 font-bold">{report.policy}</span></p>
                <p className="text-slate-400">Timestamp: <span className="text-slate-300">{report.timestamp?.slice(0, 19)}</span></p>
              </div>
            </div>
          </div>

          {/* 4 Independent Security Pillars Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Image Authenticity */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">1. IMAGE AUTHENTICITY</span>
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {report.image_authenticity?.status || 'NOT_TESTED'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Confidence: {report.image_authenticity?.confidence ? `${(report.image_authenticity.confidence * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>

            {/* 2. Identity Match */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">2. IDENTITY MATCH</span>
                <Fingerprint className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {report.identity_match?.status || 'NOT_TESTED'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Cosine Similarity: {report.identity_match?.similarity_score !== null ? report.identity_match.similarity_score : 'N/A'}
              </p>
            </div>

            {/* 3. Liveness PAD */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">3. LIVENESS PAD</span>
                <Camera className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {report.liveness?.status || 'NOT_TESTED'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                PAD Score: {report.liveness?.liveness_score ? `${(report.liveness.liveness_score * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>

            {/* 4. Document Integrity */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">4. DOCUMENT INTEGRITY</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {report.document_integrity?.status || 'NOT_TESTED'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Tamper Score: {report.document_integrity?.tamper_risk_score !== null ? report.document_integrity.tamper_risk_score : 'N/A'}
              </p>
            </div>
          </div>

          {/* Explainable Decision Reasoning Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-sm font-bold text-white font-sans">Explainable Decision Reasons & Audit Trail</h3>
            <div className="space-y-1.5 text-slate-300">
              {report.reasons?.map((r, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">›</span>
                  <p>{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
