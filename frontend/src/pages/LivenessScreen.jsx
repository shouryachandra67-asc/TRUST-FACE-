import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Radio, 
  HelpCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { apiService } from '../services/api';

export default function LivenessScreen() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [session, setSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(300);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Initialize webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied or unavailable. Please grant webcam permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  // Start fresh liveness challenge session
  const initSession = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCapturedFrames([]);
    setCurrentStep(0);

    try {
      const s = await apiService.createLivenessSession();
      setSession(s);
      setSessionTimer(s.ttl_seconds || 300);
      if (!streamActive) {
        await startCamera();
      }
    } catch (err) {
      setError('Could not initialize liveness session.');
    } finally {
      setLoading(false);
    }
  };

  // Session TTL Countdown
  useEffect(() => {
    if (!session || sessionTimer <= 0) return;
    const interval = setInterval(() => {
      setSessionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('Session expired. Fresh challenge session required.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, sessionTimer]);

  // Capture frame sequence
  const captureBurstFrames = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    const frames = [];
    let count = 0;

    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval);
        setCapturing(false);
        setCapturedFrames((prev) => [...prev, ...frames]);
        if (session && currentStep < session.challenges.length - 1) {
          setCurrentStep((prev) => prev + 1);
        }
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) frames.push(blob);
      }, 'image/jpeg', 0.90);
      count++;
    }, 300);
  };

  // Simulate active challenge capture without requiring physical camera
  const simulateLiveChallengeBurst = async () => {
    let activeSession = session;
    if (!activeSession) {
      setLoading(true);
      try {
        activeSession = await apiService.createLivenessSession();
        setSession(activeSession);
        setSessionTimer(activeSession.ttl_seconds || 300);
      } catch (e) {
        setError('Could not initialize liveness session.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    setCapturing(true);
    setError(null);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    const frames = [];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 320, 320);

      const cx = 160 + (i * 2 - 4);
      const cy = 160 + Math.sin(i * 0.9) * 3;

      // Hair
      ctx.fillStyle = '#261c16';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 20, 70, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Face skin
      ctx.fillStyle = '#f2cbaf';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 55, 72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#1e140d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 25);
      ctx.lineTo(cx - 10, cy - 30);
      ctx.moveTo(cx + 10, cy - 30);
      ctx.lineTo(cx + 35, cy - 25);
      ctx.stroke();

      // Eyes
      if (i === 2) {
        // Natural blink frame
        ctx.strokeStyle = '#1e140d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy - 15);
        ctx.lineTo(cx - 12, cy - 15);
        ctx.moveTo(cx + 12, cy - 15);
        ctx.lineTo(cx + 28, cy - 15);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 20, cy - 15, 7, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy - 15, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e140d';
        ctx.beginPath();
        ctx.arc(cx - 20, cy - 15, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy - 15, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nose bridge
      ctx.strokeStyle = '#d69e7b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();

      // Lips
      ctx.fillStyle = '#c76666';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 32, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) frames.push(blob);
          resolve();
        }, 'image/jpeg', 0.90);
      });
    }

    setCapturedFrames((prev) => [...prev, ...frames]);
    setCapturing(false);
    if (activeSession && currentStep < activeSession.challenges.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Submit collected frames for Presentation Attack Detection
  const handleVerifySession = async () => {
    if (!session || capturedFrames.length < 2) {
      setError('Please record active action frames before submitting for PAD verification.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.verifyLiveness(session.session_id, session.nonce, capturedFrames);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : detail?.message || 'Liveness verification failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const formatChallenge = (str) => str?.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-radial-glow">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Camera className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Liveness & PAD Verification</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono">MODULE C</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Randomized challenge-response action sessions with optical 2D FFT moiré and specular reflection anti-spoofing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Viewfinder and Challenge HUD */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${streamActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                <span className="text-slate-300">{streamActive ? 'CAMERA FEED ACTIVE' : 'CAMERA OFFLINE'}</span>
              </div>
              {session && (
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SESSION TTL: {sessionTimer}s</span>
                </div>
              )}
            </div>

            {/* Video Viewport */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${!streamActive ? 'hidden' : ''}`}
              />

              {!streamActive && (
                <div className="text-center p-6 space-y-3">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Camera offline. Click below to begin session.</p>
                </div>
              )}

              {/* Action Prompt Overlay Banner */}
              {session && streamActive && (
                <div className="absolute top-4 left-4 right-4 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-center shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                    CURRENT CHALLENGE ACTION ({currentStep + 1} OF {session.challenges.length})
                  </span>
                  <span className="text-lg font-black text-white font-mono mt-0.5 block animate-bounce">
                    👉 {formatChallenge(session.challenges[currentStep])}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Perform the action steadily towards the lens, then click "Record Action Frames".
                  </p>
                </div>
              )}

              {capturing && (
                <div className="absolute inset-0 bg-cyan-950/30 backdrop-blur-xs flex items-center justify-center border-4 border-cyan-400 animate-pulse">
                  <span className="text-sm font-mono font-bold text-cyan-300 bg-slate-950/80 px-4 py-2 rounded-lg">
                    CAPTURING ACTION FRAMES...
                  </span>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {!session ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={initSession}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono transition-all border border-emerald-400/40 shadow-sm"
                  >
                    START LIVENESS SESSION
                  </button>

                  <button
                    onClick={simulateLiveChallengeBurst}
                    disabled={loading || capturing}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono transition-all border border-cyan-500/30 shadow-sm"
                  >
                    SIMULATE CAMERA BURST (NO WEBCAM)
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={captureBurstFrames}
                    disabled={capturing || sessionTimer <= 0}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white font-mono transition-all border border-cyan-400/40 shadow-sm"
                  >
                    RECORD WEBCAM ({capturedFrames.length})
                  </button>

                  <button
                    onClick={simulateLiveChallengeBurst}
                    disabled={capturing || sessionTimer <= 0}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-mono transition-all border border-cyan-500/30"
                  >
                    + SIMULATE BURST
                  </button>

                  <button
                    onClick={handleVerifySession}
                    disabled={loading || capturedFrames.length < 2 || sessionTimer <= 0}
                    className={`px-5 py-2.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                      capturedFrames.length < 2
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-md'
                    }`}
                  >
                    {loading ? 'VERIFYING PAD...' : 'SUBMIT VERIFICATION'}
                  </button>

                  <button
                    onClick={initSession}
                    title="Reset Session"
                    className="p-2.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Session Metadata & Verification Results */}
        <div className="lg:col-span-5 space-y-6">
          {session && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-white font-sans">Active Session Cryptographic Seed</h3>
              <div className="space-y-1.5 text-slate-300">
                <p>Session ID: <span className="text-cyan-400">{session.session_id.slice(0, 16)}...</span></p>
                <p>Nonce: <span className="text-slate-400 truncate block">{session.nonce}</span></p>
                <p>Recorded Frames: <span className="text-emerald-400">{capturedFrames.length} frames</span></p>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                Anti-Replay Nonce expires in {session.ttl_seconds} seconds. Re-submission of the exact same nonce will be blocked.
              </p>
            </div>
          )}

          {/* Verification Results Card */}
          {result && (
            <div className={`glass-panel p-6 rounded-2xl border space-y-5 ${
              result.status === 'PASS'
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : result.status === 'FAIL'
                ? 'border-rose-500/50 bg-rose-950/20'
                : 'border-amber-500/50 bg-amber-950/20'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">PAD VERDICT</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-2xl font-black ${
                      result.status === 'PASS' ? 'text-emerald-400' : result.status === 'FAIL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {result.status}
                    </span>
                    {result.status === 'PASS' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : result.status === 'FAIL' ? (
                      <XCircle className="w-6 h-6 text-rose-400" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[10px]">LIVENESS INDEX</span>
                  <span className="text-xl font-bold text-cyan-300">{(result.liveness_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Optical Heuristics Telemetry */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SCREEN MOIRÉ RISK</span>
                  <span className="text-slate-200 font-bold">{result.screen_moire_risk}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SPECULAR PAPER RISK</span>
                  <span className="text-slate-200 font-bold">{result.paper_specular_risk}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">MOTION DETECTED</span>
                  <span className={result.natural_motion_detected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {result.natural_motion_detected ? 'YES (Biological)' : 'NO (Static)'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FRAMES VALIDATED</span>
                  <span className="text-slate-200 font-bold">{result.frames_analyzed} frames</span>
                </div>
              </div>

              {/* Signals and Diagnostic reasons */}
              {result.reasons && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
                  <span className="text-[10px] uppercase text-slate-500 block">PAD Diagnostic Reasoning:</span>
                  {result.reasons.map((r, idx) => (
                    <p key={idx}>• {r}</p>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-slate-500 italic">{result.disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
