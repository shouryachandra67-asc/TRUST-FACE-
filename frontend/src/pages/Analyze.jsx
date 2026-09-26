import React, { useState } from 'react';
import UploadBox from '../components/UploadBox';
import FaceStatus from '../components/FaceStatus';
import AnalysisProgress from '../components/AnalysisProgress';
import ResultCard from '../components/ResultCard';
import ProbabilityChart from '../components/ProbabilityChart';
import HeatmapViewer from '../components/HeatmapViewer';
import { apiService } from '../services/api';
import { Shield, Play, RotateCcw, AlertTriangle } from 'lucide-react';

export default function Analyze() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState('IDLE');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Results & Errors
  const [faceCount, setFaceCount] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setFaceCount(undefined);
    setErrorMessage('');
    setCurrentStep('IDLE');
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setFaceCount(undefined);
    setErrorMessage('');
    setCurrentStep('IDLE');
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setFaceCount(undefined);
    setCurrentStep('UPLOADING');

    try {
      // Simulate real-time progress steps for user visibility during async pipeline
      const stepTimer1 = setTimeout(() => setCurrentStep('VALIDATING'), 300);
      const stepTimer2 = setTimeout(() => setCurrentStep('DETECTING_FACE'), 600);
      const stepTimer3 = setTimeout(() => setCurrentStep('PREPROCESSING'), 900);
      const stepTimer4 = setTimeout(() => setCurrentStep('ANALYZING'), 1200);

      const response = await apiService.analyzeImage(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      setCurrentStep('GENERATING_EXPLANATION');
      await new Promise((r) => setTimeout(r, 300));

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
        setErrorMessage(detail.message || 'Face detection rejected image.');
      } else if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage(err.message || 'Failed to complete forensic image analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Image Forensics Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Facial Authenticity Analysis
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload a digital image containing a single face for multi-level neural inspection.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadBox
        onFileSelected={handleFileSelected}
        onClear={handleClear}
        selectedFile={selectedFile}
        isAnalyzing={isAnalyzing}
      />

      {/* Analysis Action Button */}
      {selectedFile && !analysisResult && !isAnalyzing && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleRunAnalysis}
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all border border-cyan-400/30 group"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Execute Forensic Scan</span>
          </button>
        </div>
      )}

      {/* Progress Stepper */}
      {isAnalyzing && (
        <AnalysisProgress currentStep={currentStep} uploadProgress={uploadProgress} />
      )}

      {/* Face Status Notification on Error / Multi-face */}
      {(faceCount !== undefined || errorMessage) && !analysisResult && (
        <div className="max-w-xl mx-auto space-y-3">
          <FaceStatus count={faceCount} statusMessage={errorMessage} />
          <div className="text-center">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Try Another Image</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              INSPECTION DOSSIER
            </h3>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Another Image</span>
            </button>
          </div>

          <FaceStatus count={analysisResult.face_count} />

          <ResultCard resultData={analysisResult} />

          {analysisResult.scores && (
            <ProbabilityChart scores={analysisResult.scores} />
          )}

          <HeatmapViewer
            originalImage={previewUrl}
            faceCropImage={analysisResult.face_crop_base64}
            heatmapImage={analysisResult.heatmap_base64}
          />
        </div>
      )}
    </div>
  );
}
