import React, { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import FaceStatus from '../components/FaceStatus';
import AnalysisProgress from '../components/AnalysisProgress';
import ResultCard from '../components/ResultCard';
import ProbabilityChart from '../components/ProbabilityChart';
import HeatmapViewer from '../components/HeatmapViewer';
import { apiService } from '../services/api';
import { Camera as CameraIcon, Shield, RotateCcw } from 'lucide-react';

export default function Camera() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState('IDLE');
  const [capturedBase64, setCapturedBase64] = useState(null);

  const [faceCount, setFaceCount] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleCapture = async (file, base64Preview) => {
    setCapturedBase64(base64Preview);
    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setFaceCount(undefined);
    setCurrentStep('UPLOADING');

    try {
      const stepTimer1 = setTimeout(() => setCurrentStep('VALIDATING'), 200);
      const stepTimer2 = setTimeout(() => setCurrentStep('DETECTING_FACE'), 400);
      const stepTimer3 = setTimeout(() => setCurrentStep('PREPROCESSING'), 600);
      const stepTimer4 = setTimeout(() => setCurrentStep('ANALYZING'), 800);

      const response = await apiService.analyzeFrame(base64Preview);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      setCurrentStep('GENERATING_EXPLANATION');
      await new Promise((r) => setTimeout(r, 200));

      setCurrentStep('PREPARING_REPORT');
      await new Promise((r) => setTimeout(r, 200));

      setCurrentStep('COMPLETED');
      setFaceCount(response.face_count);
      setAnalysisResult(response);
    } catch (err) {
      setCurrentStep('FAILED');
      const detail = err.response?.data?.detail;

      if (detail && typeof detail === 'object') {
        setFaceCount(detail.face_count);
        setErrorMessage(detail.message || 'Face detection rejected frame.');
      } else if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage(err.message || 'Failed to analyze camera frame.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCapturedBase64(null);
    setAnalysisResult(null);
    setFaceCount(undefined);
    setErrorMessage('');
    setCurrentStep('IDLE');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
          <CameraIcon className="w-3.5 h-3.5" />
          <span>Real-Time Ingestion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Live Camera Forensics
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Position your face inside the reticle for real-time authenticity and synthesis inspection.
        </p>
      </div>

      {/* Camera Capture Module */}
      {!analysisResult && (
        <CameraCapture onCapture={handleCapture} isAnalyzing={isAnalyzing} />
      )}

      {/* Progress */}
      {isAnalyzing && (
        <AnalysisProgress currentStep={currentStep} />
      )}

      {/* Face Status or Error */}
      {(faceCount !== undefined || errorMessage) && !analysisResult && (
        <div className="max-w-xl mx-auto space-y-3">
          <FaceStatus count={faceCount} statusMessage={errorMessage} />
          <div className="text-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Frame Capture</span>
            </button>
          </div>
        </div>
      )}

      {/* Results View */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              CAMERA FRAME AUDIT
            </h3>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Capture New Frame</span>
            </button>
          </div>

          <FaceStatus count={analysisResult.face_count} />

          <ResultCard resultData={analysisResult} />

          {analysisResult.scores && (
            <ProbabilityChart scores={analysisResult.scores} />
          )}

          <HeatmapViewer
            originalImage={capturedBase64}
            faceCropImage={analysisResult.face_crop_base64}
            heatmapImage={analysisResult.heatmap_base64}
          />
        </div>
      )}
    </div>
  );
}
