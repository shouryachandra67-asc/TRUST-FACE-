import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DeepfakeWorkspace from './pages/DeepfakeWorkspace';
import IdentityWizard from './pages/IdentityWizard';
import LivenessScreen from './pages/LivenessScreen';
import DocumentWorkspace from './pages/DocumentWorkspace';
import Results from './pages/Results';
import History from './pages/History';
import Admin from './pages/Admin';
import ModelEval from './pages/ModelEval';
import PrivacySettings from './pages/PrivacySettings';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* 12 Core VerityAI Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deepfake" element={<DeepfakeWorkspace />} />
            <Route path="/verify" element={<IdentityWizard />} />
            <Route path="/liveness" element={<LivenessScreen />} />
            <Route path="/documents" element={<DocumentWorkspace />} />
            <Route path="/results" element={<Results />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/model-eval" element={<ModelEval />} />
            <Route path="/privacy" element={<PrivacySettings />} />

            {/* Backward-Compatible & Reference Routes */}
            <Route path="/analyze" element={<DeepfakeWorkspace />} />
            <Route path="/camera" element={<LivenessScreen />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
