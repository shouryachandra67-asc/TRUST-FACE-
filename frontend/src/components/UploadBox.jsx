import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadBox({ onFileSelected, isAnalyzing, selectedFile, onClear }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandleFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    // Check mime type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload JPEG, PNG, or WebP images only.');
      return;
    }

    // Check size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File exceeds 10 MB limit. Please select a smaller image.');
      return;
    }

    if (file.size === 0) {
      setErrorMsg('The selected file is empty. Please select a valid image.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) onClear();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !previewUrl && !isAnalyzing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all ${
          previewUrl
            ? 'border-slate-700 bg-slate-900/40'
            : dragActive
            ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
            : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/30 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block max-h-80 rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-black">
              <img
                src={previewUrl}
                alt="Selected media preview"
                className="max-h-72 w-auto object-contain mx-auto"
              />
              {!isAnalyzing && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-rose-950/90 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
              <FileImage className="w-4 h-4 text-cyan-400" />
              <span>{selectedFile?.name || 'Selected Image'}</span>
              <span>•</span>
              <span>{selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : ''}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-slate-200">
                Drag and drop facial image, or <span className="text-cyan-400 underline underline-offset-4">browse</span>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Supports JPG, JPEG, PNG, WEBP (Max 10 MB)
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-mono text-slate-400 bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Strict Rule: Exactly 1 face must be present</span>
            </div>
          </div>
        )}
      </div>

      {/* Error notification if validation fails */}
      {errorMsg && (
        <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
