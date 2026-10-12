import React, { useState } from 'react';
import { 
  UserCheck, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Sliders, 
  Fingerprint, 
  Camera,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';

export default function IdentityWizard() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [referenceFile, setReferenceFile] = useState(null);
  const [probeFile, setProbeFile] = useState(null);
  const [refPreview, setRefPreview] = useState(null);
  const [probePreview, setProbePreview] = useState(null);
  const [threshold, setThreshold] = useState(0.65);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRefUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      setRefPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleProbeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProbeFile(file);
      setProbePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleLoadSyntheticRef = async () => {
    try {
      const blob = await apiService.fetchSyntheticSampleBlob('genuine', 'ALEXANDER CHEN');
      const file = new File([blob], 'synthetic_id_card.jpg', { type: 'image/jpeg' });
      setReferenceFile(file);
      setRefPreview(URL.createObjectURL(file));
    } catch (e) {
      setError('Could not fetch synthetic spec document.');
    }
  };

  const handleLoadSampleSelfie = async (target = 'match') => {
    try {
      const blob = await apiService.fetchSampleSelfieBlob(target);
      const filename = target === 'match' ? 'alexander_chen_selfie.jpg' : 'sarah_jenkins_selfie.jpg';
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setProbeFile(file);
      setProbePreview(URL.createObjectURL(file));
      setError(null);
    } catch (e) {
      setError('Could not fetch sample test selfie.');
    }
  };

  const handleRunMatch = async () => {
    if (!consentGiven) {
      setError('Informed biometric consent is mandatory before identity verification.');
      return;
    }
    if (!referenceFile || !probeFile) {
      setError('Please provide both an authorized reference portrait/document and a fresh live selfie.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.matchIdentity(referenceFile, probeFile, consentGiven, threshold);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : detail?.message || 'Biometric identity match failed.';
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
          <UserCheck className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Biometric Identity Matching Wizard</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-400 font-mono">MODULE B</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Consent-governed 1:1 biometric comparison using 512D normalized embeddings and calibrated cosine similarity.
        </p>
      </div>

      {/* Step 1: Mandatory Biometric Consent */}
      <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-blue-950/15 space-y-3">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="biometric-consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="biometric-consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
            <strong className="text-white block font-medium mb-0.5">Mandatory Informed Biometric Consent Declaration</strong>
            I hereby give informed consent for temporary 1:1 facial embedding extraction solely for identity verification purposes. 
            I understand that raw facial biometric representations are processed ephemerally in memory and scrubbed in accordance with 
            applicable data protection regulations (India DPDP Act 2023 / GDPR). No demographic or facial attribute profiling will be conducted.
          </label>
        </div>
      </div>

      {/* Step 2 & 3: Reference Image & Probe Selfie Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference Portrait / Document */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center font-mono text-xs font-bold">1</span>
              <h3 className="text-sm font-bold text-white">Reference Portrait or ID Card</h3>
            </div>
            <button
              onClick={handleLoadSyntheticRef}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              Use Synthetic ID Card
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center">
            <input
              type="file"
              id="ref-upload"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleRefUpload}
              className="hidden"
            />
            <label htmlFor="ref-upload" className="cursor-pointer block space-y-2">
              {refPreview ? (
                <img src={refPreview} alt="Reference Preview" className="h-44 w-full object-contain rounded-lg bg-slate-950" />
              ) : (
                <div className="py-8 space-y-2">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Click to upload reference ID or portrait</p>
                  <p className="text-[10px] text-slate-500">JPG, PNG, WebP up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Live Selfie Probe */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold">2</span>
              <h3 className="text-sm font-bold text-white">Fresh Live Selfie</h3>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => handleLoadSampleSelfie('match')}
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                + Match (Alexander)
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => handleLoadSampleSelfie('mismatch')}
                className="text-rose-400 hover:text-rose-300 underline"
              >
                + Mismatch (Sarah)
              </button>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center">
            <input
              type="file"
              id="probe-upload"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleProbeUpload}
              className="hidden"
            />
            <label htmlFor="probe-upload" className="cursor-pointer block space-y-2">
              {probePreview ? (
                <img src={probePreview} alt="Probe Preview" className="h-44 w-full object-contain rounded-lg bg-slate-950" />
              ) : (
                <div className="py-8 space-y-2">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Click to upload captured selfie</p>
                  <p className="text-[10px] text-slate-500">Requires exactly 1 clear frontal face</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Threshold & Execution Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <Sliders className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Match Threshold (Cosine):</span>
              <span className="text-cyan-400 font-bold ml-2">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.85"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-48 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleRunMatch}
          disabled={loading || !consentGiven || !referenceFile || !probeFile}
          className={`px-8 py-3 rounded-xl font-semibold text-xs font-mono tracking-wider transition-all flex items-center space-x-2 ${
            !consentGiven || !referenceFile || !probeFile
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/40'
          }`}
        >
          {loading ? (
            <span>EXTRACTING 512D EMBEDDINGS...</span>
          ) : (
            <>
              <Fingerprint className="w-4 h-4" />
              <span>COMPUTE BIOMETRIC SIMILARITY</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">BIOMETRIC MATCH VERDICT</span>
              <div className="flex items-center space-x-2.5 mt-1">
                <span className={`text-2xl font-extrabold ${
                  result.status === 'MATCH'
                    ? 'text-emerald-400'
                    : result.status === 'NO_MATCH'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {result.status}
                </span>
                {result.status === 'MATCH' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : result.status === 'NO_MATCH' ? (
                  <XCircle className="w-6 h-6 text-rose-400" />
                ) : (
                  <HelpCircle className="w-6 h-6 text-amber-400" />
                )}
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1">
              <p className="text-slate-400">
                Cosine Similarity: <strong className="text-cyan-400">{result.similarity_score !== null ? result.similarity_score : 'N/A'}</strong>
              </p>
              <p className="text-slate-400">
                Threshold Applied: <span className="text-slate-200">{result.threshold_applied}</span>
              </p>
              <p className="text-slate-400">
                Review Gate: <span className={result.requires_manual_review ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {result.requires_manual_review ? 'MANUAL REVIEW REQUIRED' : 'AUTOMATED VERIFIED'}
                </span>
              </p>
            </div>
          </div>

          {/* Extracted Face Crops and Quality Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
              {result.reference_face_base64 && (
                <img src={result.reference_face_base64} alt="Ref Face" className="w-20 h-20 rounded-lg object-cover border border-slate-700 bg-slate-950" />
              )}
              <div className="text-xs font-mono space-y-1">
                <span className="text-slate-400 block text-[10px]">REFERENCE FACE ROI</span>
                <p className="text-slate-200">Sharpness: {result.reference_quality?.laplacian_variance}</p>
                <p className="text-slate-200">Illumination: {result.reference_quality?.mean_brightness}</p>
                <p className={result.reference_quality?.acceptable ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.reference_quality?.acceptable ? 'Quality Pass' : 'Quality Degraded'}
                </p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
              {result.probe_face_base64 && (
                <img src={result.probe_face_base64} alt="Probe Face" className="w-20 h-20 rounded-lg object-cover border border-slate-700 bg-slate-950" />
              )}
              <div className="text-xs font-mono space-y-1">
                <span className="text-slate-400 block text-[10px]">LIVE SELFIE ROI</span>
                <p className="text-slate-200">Sharpness: {result.probe_quality?.laplacian_variance}</p>
                <p className="text-slate-200">Illumination: {result.probe_quality?.mean_brightness}</p>
                <p className={result.probe_quality?.acceptable ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.probe_quality?.acceptable ? 'Quality Pass' : 'Quality Degraded'}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic Reasons */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Biometric Decision Reasoning:</span>
            {result.reasons?.map((r, i) => (
              <p key={i}>• {r}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
