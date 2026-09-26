import React from 'react';
import Hero from '../components/Hero';
import { ShieldCheck, Cpu, Eye, Lock, FileSearch, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const forensicCapabilities = [
    {
      title: 'Facial Synthesis Detection',
      desc: 'Detects whole-face generation artifacts produced by modern generative diffusion and GAN architectures.',
      tag: 'GAN / Diffusion',
    },
    {
      title: 'Identity Face Swapping',
      desc: 'Identifies boundary edge-blending anomalies, color dissonance, and warped facial landmark seams.',
      tag: 'DeepFaceLab / SimSwap',
    },
    {
      title: 'Facial Reenactment Forensics',
      desc: 'Detects micro-texture jitter and unnatural expression transfer on eye, mouth, and cheek regions.',
      tag: 'Face2Face / LivePortrait',
    },
    {
      title: 'Strict Single-Subject Guard',
      desc: 'Rejects multi-subject frames to enforce forensic accountability and eliminate ambiguity.',
      tag: 'Zero-Tolerance Policy',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      <Hero />

      {/* Capabilities Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
            Forensic Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Engineered Against Advanced Manipulation
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Leveraging convolutional spatial representations and frequency artifact detection to protect digital identity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {forensicCapabilities.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-panel border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  {item.tag}
                </span>
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Disclaimer Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
              Academic & Ethical Standards
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            TrustFace AI provides an AI-based probabilistic assessment of media authenticity. It is not definitive proof that an image, video, voice recording, or person is genuine. AI-generated media detection can produce false positives and false negatives under low-resolution, high compression, or adverse illumination conditions.
          </p>
        </div>
      </section>
    </div>
  );
}
