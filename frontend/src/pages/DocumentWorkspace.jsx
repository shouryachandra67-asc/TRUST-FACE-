import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Sparkles, 
  Calendar, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { apiService } from '../services/api';

export default function DocumentWorkspace() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const loadSyntheticSpecimen = async (sampleType) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await apiService.fetchSyntheticSampleBlob(sampleType, 'ALEXANDER CHEN');
      const file = new File([blob], `synthetic_${sampleType}_id.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Auto-analyze synthetic specimen
      const data = await apiService.analyzeDocument(file);
      setResult(data);
    } catch (err) {
      setError('Could not generate or analyze synthetic document.');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.analyzeDocument(selectedFile);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : detail?.message || 'Document analysis failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Identity Document Forensic Workspace</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400 font-mono">MODULE D</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Optical layout inspection, localized Error Level Analysis (ELA) tampering detection, and MRZ validity verification.
        </p>
      </div>

      {/* Synthetic Specimen Fast-Testing Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-200 font-mono">Test Specimen Simulator</h4>
          <p className="text-[11px] text-slate-400">Load synthetic in-memory test cards without uploading real identity documents.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => loadSyntheticSpecimen('genuine')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-all"
          >
            Load Genuine Card
          </button>
          <button
            onClick={() => loadSyntheticSpecimen('tampered')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition-all"
          >
            Load Tampered Card (ELA)
          </button>
          <button
            onClick={() => loadSyntheticSpecimen('expired')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-all"
          >
            Load Expired Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Document Viewer */}
        <div className="lg:col-span-5 space-y-5">
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center bg-slate-950/40">
            <input
              type="file"
              id="doc-upload"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="doc-upload" className="cursor-pointer block space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-semibold text-amber-400 hover:text-amber-300">
                  {selectedFile ? 'Replace Document File' : 'Upload ID Card or Passport'}
                </span>
                <p className="text-xs text-slate-400 mt-1">Supports ID-1 National ID cards and ID-3 Passports</p>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="truncate">{selectedFile.name}</span>
                <span className="text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>

              <div className="rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center max-h-64 border border-slate-800">
                <img src={previewUrl} alt="Document Preview" className="max-h-64 object-contain" />
              </div>

              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-mono tracking-wider shadow-md transition-all border border-amber-400/40"
              >
                {loading ? 'ANALYZING DOCUMENT INTEGRITY...' : 'RUN FORENSIC DOCUMENT SCAN'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: ELA Heatmaps & Extracted Field Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Awaiting Document Upload</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a document or choose a synthetic specimen above to run localized Error Level Analysis and OCR extraction.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div className={`glass-panel p-6 rounded-2xl border ${
                result.status === 'GENUINE'
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : result.status === 'TAMPERED'
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : result.status === 'EXPIRED'
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : 'border-amber-500/50 bg-amber-950/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">DOCUMENT STATUS</span>
                    <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
                      <span>{result.status}</span>
                      {result.status === 'GENUINE' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-400 inline" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 inline" />
                      )}
                    </h2>
                  </div>

                  <div className="text-right font-mono text-xs space-y-1">
                    <p className="text-slate-400">Card Format: <span className="text-cyan-400 font-bold">{result.document_type}</span></p>
                    <p className="text-slate-400">Aspect Ratio: <span className="text-white">{result.aspect_ratio}</span></p>
                    <p className="text-slate-400">Tamper Index: <span className={result.is_tampered ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {result.tamper_risk_score}
                    </span></p>
                  </div>
                </div>
              </div>

              {/* Extracted Biometric Portrait & ELA Heatmap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Extracted Document Portrait</span>
                  </span>
                  {result.extracted_portrait_base64 ? (
                    <img src={result.extracted_portrait_base64} alt="Extracted Portrait" className="w-full h-44 object-cover rounded-lg border border-slate-800 bg-slate-950" />
                  ) : (
                    <div className="w-full h-44 bg-slate-950 rounded-lg flex items-center justify-center text-xs text-slate-500 font-mono">
                      No facial portrait isolated
                    </div>
                  )}
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Localized ELA Tampering Heatmap</span>
                  </span>
                  {result.ela_heatmap_base64 && (
                    <img src={result.ela_heatmap_base64} alt="ELA Heatmap" className="w-full h-44 object-cover rounded-lg border border-slate-800 bg-slate-950" />
                  )}
                </div>
              </div>

              {/* OCR Parsed Fields and Expiration check */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Structured Identity Fields & Validity Inspection
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">FULL NAME</span>
                    <span className="text-white font-bold">{result.extracted_fields?.full_name}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DOCUMENT ID</span>
                    <span className="text-white font-bold">{result.extracted_fields?.document_number}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">EXPIRY DATE</span>
                    <span className={result.expiration_check?.is_expired ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {result.extracted_fields?.expiry_date} ({result.expiration_check?.status})
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">REFERENCE DATE</span>
                    <span className="text-slate-300 font-bold">{result.expiration_check?.reference_date || '2026-10-12'}</span>
                  </div>
                </div>

                {result.extracted_fields?.mrz_code && (
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 truncate">
                    MRZ: {result.extracted_fields.mrz_code}
                  </div>
                )}
              </div>

              {/* Forensic Reasons */}
              {result.reasons && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
                  <span className="text-[10px] uppercase text-slate-500 block">Forensic Integrity Evaluation:</span>
                  {result.reasons.map((r, i) => (
                    <p key={i}>• {r}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
