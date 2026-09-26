import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

export default function CameraCapture({ onCapture, isAnalyzing }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = useCallback(async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera acquisition is unsupported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was denied. Please allow camera access in your browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No physical camera device was detected on your system.');
      } else {
        setErrorMsg(`Camera error: ${err.message || 'Unable to access video stream.'}`);
      }
      setStreamActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(base64Image);

    // Convert base64 to File object for unified pipeline
    canvas.toBlob((blob) => {
      if (blob && onCapture) {
        const file = new File([blob], `camera_frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file, base64Image);
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (!streamActive) {
      startCamera();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Viewport Frame */}
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-slate-800 bg-black min-h-[380px] flex items-center justify-center">
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured frame"
              className="w-full h-auto max-h-[460px] object-contain mx-auto"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-mono text-cyan-400">
              FRAME CAPTURED
            </div>
          </div>
        ) : (
          <div className="relative w-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full max-h-[460px] object-cover transition-opacity ${
                streamActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Viewfinder Target Reticle */}
            {streamActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-72 rounded-3xl border-2 border-dashed border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-between p-3">
                  <span className="text-[10px] font-mono text-cyan-400 tracking-wider">ALIGN SINGLE FACE</span>
                  <div className="self-end text-[10px] font-mono text-cyan-400/70">1 SUBJECT STRICT</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden Canvas for Frame Grab */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Fallback Error Display */}
        {errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 space-y-3">
            <CameraOff className="w-12 h-12 text-rose-400" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-rose-300">Camera Unavailable</h4>
              <p className="text-xs text-slate-400 max-w-sm">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center space-x-3">
        {capturedImage ? (
          <button
            type="button"
            onClick={handleRetake}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Retake Frame</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!streamActive || isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all border border-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            <span>Capture & Inspect</span>
          </button>
        )}
      </div>

      {/* Ephemeral Notice */}
      <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-slate-500">
        <Shield className="w-3.5 h-3.5 text-slate-500" />
        <span>Camera frames are processed ephemerally in RAM and never stored to disk.</span>
      </div>
    </div>
  );
}
