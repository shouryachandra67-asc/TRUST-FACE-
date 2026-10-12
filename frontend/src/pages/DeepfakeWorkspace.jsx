import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  FileVideo, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Eye, 
  Clock, 
  Cpu, 
  Info,
  Sparkles,
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';

export default function DeepfakeWorkspace() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const targetFile = fileOverride || selectedFile;
      if (!targetFile) return;
      const data = await apiService.analyzeMedia(targetFile, (progress) => {
        setUploadProgress(progress);
      });
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : detail?.message || 'Error processing media through forensic engine.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleSpecimen = async (sampleType) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await apiService.fetchDeepfakeSampleBlob(sampleType);
      const file = new File([blob], `sample_${sampleType}_portrait.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      await handleScan(file);
    } catch (err) {
      setError('Could not load sample specimen.');
      setLoading(false);
    }
  };

  const isVideo = selectedFile?.type?.startsWith('video/') || selectedFile?.name?.match(/\.(mp4|avi|mov|webm)$/i);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Deepfake Media Forensics Workspace</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono">MODULE A</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          High-assurance manipulation and synthetic generation inspection for single portraits and video media.
        </p>
      </div>

      {/* Sample Specimen Simulator Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-200 font-mono">Media Specimen Simulator</h4>
          <p className="text-[11px] text-slate-400">Instantly test the PyTorch EfficientNet & forensic engine with sample media.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => loadSampleSpecimen('real')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-all"
          >
            Load Authentic Face
          </button>
          <button
            onClick={() => loadSampleSpecimen('fake')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition-all"
          >
            Load Synthetic Deepfake (FFT/Seams)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload and Media Viewer */}
        <div className="lg:col-span-5 space-y-5">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              selectedFile ? 'border-cyan-500/50 bg-slate-900/60' : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
            }`}
          >
            <input
              type="file"
              id="media-upload"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.avi,.mov,.webm"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="media-upload" className="cursor-pointer block space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                  {selectedFile ? 'Change Selected File' : 'Click to Upload or Drag Media'}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, WebP (Images) and MP4, AVI, MOV (Videos up to 50MB)
                </p>
              </div>
            </label>
          </div>

          {/* Media Preview Box */}
          {selectedFile && (
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2 truncate">
                  {isVideo ? <FileVideo className="w-4 h-4 text-cyan-400" /> : <ImageIcon className="w-4 h-4 text-cyan-400" />}
                  <span className="font-mono truncate">{selectedFile.name}</span>
                </div>
                <span className="text-slate-500 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div className="rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center max-h-72 border border-slate-800">
                {isVideo ? (
                  <video src={previewUrl} controls className="max-h-72 w-full object-contain" />
                ) : (
                  <img src={previewUrl} alt="Upload preview" className="max-h-72 object-contain" />
                )}
              </div>

              {loading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Uploading media...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 border border-cyan-400/40"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>EXECUTING NEURAL FORENSIC SCAN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>RUN FORENSIC AUTHENTICITY ANALYSIS</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Inspection Failed</p>
                <p className="mt-1 text-slate-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Forensic Telemetry & Results */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Awaiting Media Ingestion</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Upload an image or video on the left to extract 2D FFT periodic harmonics, boundary composite seams, Grad-CAM attention maps, and provenance metadata.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Verdict Summary Card */}
              <div className={`glass-panel p-6 rounded-2xl border ${
                result.result === 'REAL'
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : result.result === 'POTENTIAL MANIPULATION'
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : 'border-amber-500/50 bg-amber-950/20'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                      FORENSIC VERDICT
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center space-x-2">
                      <span>{result.result}</span>
                      {result.result === 'REAL' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-400 inline" />
                      ) : result.result === 'POTENTIAL MANIPULATION' ? (
                        <XCircle className="w-6 h-6 text-rose-400 inline" />
                      ) : (
                        <HelpCircle className="w-6 h-6 text-amber-400 inline" />
                      )}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Calibrated Model Confidence: <strong className="font-mono text-cyan-300">{(result.confidence * 100).toFixed(1)}%</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs space-y-1">
                    <p className="text-slate-400">Latency: <span className="text-white">{result.processing_time_ms} ms</span></p>
                    <p className="text-slate-400">Media: <span className="text-cyan-400 uppercase">{result.media_type}</span></p>
                    <p className="text-slate-400">ID: <span className="text-slate-300">{result.analysis_id.slice(0, 8)}...</span></p>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400">P(Real): {((result.scores.real || 0) * 100).toFixed(1)}%</span>
                    <span className="text-rose-400">P(Manipulation): {((result.scores.manipulation || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${(result.scores.real || 0) * 100}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{ width: `${(result.scores.manipulation || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Explainability Cards (Grad-CAM & ROI) */}
              {result.face_crop_base64 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Isolated Face ROI</span>
                    </span>
                    <img
                      src={result.face_crop_base64}
                      alt="Face ROI"
                      className="w-full h-44 object-cover rounded-lg border border-slate-800 bg-slate-950"
                    />
                  </div>

                  {result.heatmap_base64 && (
                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Grad-CAM Activation Heatmap</span>
                      </span>
                      <img
                        src={result.heatmap_base64}
                        alt="Grad-CAM"
                        className="w-full h-44 object-cover rounded-lg border border-slate-800 bg-slate-950"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Provenance and EXIF Inspector */}
              {result.provenance && (
                <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Provenance & Metadata Forensic Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">EXIF CONTAINER</span>
                      <span className="text-slate-200 font-bold">{result.provenance.has_exif ? 'PRESENT' : 'STRIPPED'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">SOFTWARE TAG</span>
                      <span className="text-slate-200 font-bold truncate block">{result.provenance.software_tool || 'NONE'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">CAMERA / SENSOR</span>
                      <span className="text-slate-200 font-bold truncate block">{result.provenance.camera_make || 'UNKNOWN'}</span>
                    </div>
                  </div>

                  {result.warnings && result.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      {result.warnings.map((w, idx) => (
                        <p key={idx}>• {w}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 italic">{result.provenance.disclaimer}</p>
                </div>
              )}

              {/* Video Temporal Timeline */}
              {result.temporal_analysis && (
                <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Video Temporal Sampling Timeline
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">FRAMES SAMPLED</span>
                      <span className="text-white font-bold">{result.temporal_analysis.total_frames_sampled}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">TEMPORAL JITTER</span>
                      <span className={result.temporal_analysis.temporal_jitter_detected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {result.temporal_analysis.temporal_jitter_detected ? 'DETECTED' : 'LOW'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">AVG MANIPULATION</span>
                      <span className="text-white font-bold">{result.temporal_analysis.average_fake_score}</span>
                    </div>
                  </div>

                  {/* Frame timeline chips */}
                  <div className="overflow-x-auto flex space-x-2 py-2">
                    {result.temporal_analysis.timeline?.slice(0, 15).map((f, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono flex-shrink-0 text-center">
                        <span className="text-slate-500 block">{f.timestamp_sec}s</span>
                        <span className={f.verdict === 'REAL' ? 'text-emerald-400 font-bold' : f.verdict === 'NO_FACE' ? 'text-slate-500' : 'text-rose-400 font-bold'}>
                          {f.verdict === 'NO_FACE' ? 'NO FACE' : f.verdict}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Signals list */}
              {result.technical_signals && result.technical_signals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.technical_signals.map((sig, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                      #{sig}
                    </span>
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
