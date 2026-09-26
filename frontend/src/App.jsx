import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Camera from './pages/Camera';
import Results from './pages/Results';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/results" element={<Results />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
