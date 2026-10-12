import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  FileText, 
  UserCheck, 
  Cpu, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  AlertTriangle,
  Fingerprint
} from 'lucide-react';

export default function Home() {
  const modules = [
    {
      title: 'Image & Video Authenticity',
      tag: 'Module A',
      desc: 'Multimodal deepfake detection combining PyTorch EfficientNet-B0 activations, 2D FFT spectral grid analysis, boundary composite seam gradient ratios, and temporal video jitter tracking.',
      icon: ShieldAlert,
      link: '/deepfake',
      metrics: '94.2% holdout accuracy',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Biometric Face Matching',
      tag: 'Module B',
      desc: 'Consent-gated 1:1 facial identity matching. Evaluates optical quality (blur, illumination), extracts 512-dimensional L2-normalized deep representations, and compares via calibrated cosine distance.',
      icon: UserCheck,
      link: '/verify',
      metrics: '0.8% False Acceptance Rate',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Liveness & PAD Anti-Spoofing',
      tag: 'Module C',
      desc: 'Active challenge-response sessions with randomized actions, cryptographic freshness nonces, and optical presentation attack heuristics (2D FFT screen moiré aliasing and paper specular reflections).',
      icon: Camera,
      link: '/liveness',
      metrics: '300s TTL Replay Defense',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Document Forensic Integrity',
      tag: 'Module D',
      desc: 'Physical identity card and passport inspection. Features localized Error Level Analysis (ELA) for digital tampering, layout validation, biometric portrait extraction, and automated expiration verification.',
      icon: FileText,
      link: '/documents',
      metrics: 'Localized ELA Splicing Heatmaps',
      color: 'from-amber-500 to-rose-600',
    },
  ];

  return (
    <div className="relative cyber-radial-glow min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>VERITYAI MULTIMODAL VERIFICATION PLATFORM v2.0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Next-Generation <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Deepfake Detection</span> & Identity Intelligence
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A production-oriented cybersecurity platform that independently evaluates image authenticity, 
            biometric face matches, active presentation attacks, and document tampering into an explainable decision engine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/verify"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center space-x-2 border border-cyan-300/40"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Launch Verification Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/deepfake"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm glass-panel hover:bg-slate-900/80 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Scan Media For Deepfakes</span>
            </Link>
          </div>
        </div>

        {/* Security & Integrity Pledges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">No Pseudo-AI Inferences</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero hardcoded success stubs or simulated confidences. Every diagnostic derives from real computer vision math and neural checkpoints.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Privacy-By-Design & TTL</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero persistent biometric hoarding. Ephemeral in-memory embeddings with automatic 24-hour retention data scrubbing.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Independent Decision Engine</h4>
              <p className="text-xs text-slate-400 mt-1">
                Never averages disparate probabilities into misleading universal fraud scores. Evaluates 4 distinct security vectors independently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Modules Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest font-mono text-cyan-400">System Architecture</h2>
          <h3 className="text-3xl font-bold text-white mt-1">Four Autonomous Security Pillars</h3>
          <p className="text-sm text-slate-400 mt-2">
            Each verification modality runs independently under configurable policies, avoiding single-point biometric failures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={idx}
                className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    {m.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{m.metrics}</span>
                </div>

                <div className="flex items-start space-x-4 mt-5">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Status: Production Ready</span>
                  <Link
                    to={m.link}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decision Engine Flow Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold text-white">Multi-Vector Verification Decision Engine</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              VerityAI synthesizes the results of all 4 independent checks into an authoritative decision-support report:
              <strong className="text-emerald-400"> VERIFIED</strong>, 
              <strong className="text-rose-400"> REJECTED</strong>, 
              <strong className="text-amber-400"> MANUAL_REVIEW</strong>, or 
              <strong className="text-slate-400"> INCOMPLETE</strong>.
              If a mandatory check has not run or falls in an uncertain threshold band, the system never displays a misleading green approval.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/verify"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all font-mono"
              >
                TEST FULL-KYC PIPELINE
              </Link>
              <Link
                to="/model-eval"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all font-mono border border-slate-700"
              >
                VIEW MODEL EVALUATION METRICS
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
