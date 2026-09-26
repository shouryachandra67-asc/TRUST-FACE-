import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Camera, Upload, Info, Cpu, Activity } from 'lucide-react';
import { apiService } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const data = await apiService.checkHealth();
        if (isMounted) {
          setBackendStatus(data.status === 'healthy' ? 'online' : 'degraded');
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Overview', icon: ShieldCheck },
    { to: '/analyze', label: 'Analyze Image', icon: Upload },
    { to: '/camera', label: 'Camera Mode', icon: Camera },
    { to: '/how-it-works', label: 'Methodology', icon: Cpu },
    { to: '/about', label: 'Academic & Ethics', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-slate-100">TRUSTFACE</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">AI</span>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-slate-400 font-mono">Verify. Detect. Trust.</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Backend health pulse indicator */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Core Engine:</span>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : backendStatus === 'degraded'
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : backendStatus === 'offline'
                    ? 'bg-rose-400 shadow-[0_0_8px_#f87171]'
                    : 'bg-slate-500'
                }`}
              />
              <span
                className={`capitalize font-medium ${
                  backendStatus === 'online'
                    ? 'text-emerald-400'
                    : backendStatus === 'degraded'
                    ? 'text-amber-400'
                    : backendStatus === 'offline'
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {backendStatus}
              </span>
            </div>
          </div>

          <Link
            to="/analyze"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm hover:from-cyan-500 hover:to-blue-500 transition-all border border-cyan-400/30"
          >
            Launch Scan
          </Link>
        </div>
      </div>
    </header>
  );
}
