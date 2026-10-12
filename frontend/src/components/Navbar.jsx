import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  Upload, 
  FileText, 
  UserCheck, 
  Activity, 
  History, 
  BarChart3, 
  Settings, 
  Lock, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const data = await apiService.checkHealthV1();
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

  const primaryNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/verify', label: 'Identity Wizard', icon: UserCheck },
    { to: '/deepfake', label: 'Deepfake Media', icon: ShieldAlert },
    { to: '/liveness', label: 'Liveness PAD', icon: Camera },
    { to: '/documents', label: 'Doc Forensics', icon: FileText },
    { to: '/history', label: 'History', icon: History },
  ];

  const secondaryNav = [
    { to: '/model-eval', label: 'Model Benchmarks', icon: BarChart3 },
    { to: '/admin', label: 'Admin', icon: Settings },
    { to: '/privacy', label: 'Privacy & Retention', icon: Lock },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">VERITY</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">AI</span>
            </div>
            <p className="text-[9px] tracking-widest uppercase text-slate-400 font-mono">Deepfake & Identity Trust</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Core Health, Secondary Links, Launch Button */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* System status pulse */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900/80 border border-slate-800">
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
            <span className="text-slate-400">Core:</span>
            <span
              className={`capitalize font-semibold ${
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

          <Link
            to="/verify"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm hover:from-cyan-400 hover:to-blue-500 transition-all border border-cyan-400/40"
          >
            Start Verification
          </Link>

          <Link
            to="/admin"
            title="Admin & Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 transition-all"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#070b14]/95 px-4 pt-3 pb-5 space-y-1">
          {[...primaryNav, ...secondaryNav].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  active ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
