import React from 'react';
import { Cpu, Eye, Shield, Layers, Binary, CheckCircle, BarChart3, Database } from 'lucide-react';

export default function HowItWorks() {
  const architectureStages = [
    {
      step: '01',
      title: 'Ephemeral Intake & MIME Validation',
      desc: 'Image buffers are decoded in volatile memory. Magic binary signatures for JPEG (FF D8 FF), PNG (89 50 4E 47), and WebP are checked before processing.',
      icon: Binary,
    },
    {
      step: '02',
      title: 'Strict Single-Face Detection',
      desc: 'OpenCV and MediaPipe algorithms scan for facial landmarks. The pipeline strictly demands exactly 1 face. Zero faces or multi-subject scenes are immediately rejected to prevent forensic ambiguity.',
      icon: Eye,
    },
    {
      step: '03',
      title: 'Bounding Box Affine Normalization',
      desc: 'The face region of interest (ROI) is expanded with a 15% contextual margin to capture cheek and forehead blending boundaries, then interpolated to 224x224 RGB tensors.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Convolutional Deepfake Inference',
      desc: 'The normalized tensor passes through an EfficientNet-B0 backbone fine-tuned on FaceForensics++ benchmarks, inspecting spatial micro-texture and frequency distortion artifacts.',
      icon: Shield,
    },
    {
      step: '05',
      title: 'Explainable AI via Grad-CAM',
      desc: 'Gradients from the predicted class logit flow backwards to the final convolutional feature maps, synthesizing an activation heatmap that exposes the spatial regions governing the decision.',
      icon: Layers,
    },
    {
      step: '06',
      title: 'Confidence Calibration & Uncertainty Floor',
      desc: 'Softmax probabilities are temperature-scaled. If confidence falls below 60% or blur variance is excessive, the engine returns UNCERTAIN rather than guessing.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>Technical Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          How TrustFace AI Works
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          An end-to-end overview of the computer vision, deep learning, and mathematical calibration architecture.
        </p>
      </div>

      <div className="space-y-4">
        {architectureStages.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-mono font-bold text-base shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                {item.step}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-semibold text-slate-200">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
