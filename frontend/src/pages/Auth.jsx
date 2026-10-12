import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, Key, CheckCircle, ArrowRight } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('analyst@verity.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Sarah Connor');
  const [role, setRole] = useState('analyst');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg(`Authenticated successfully as ${role.toUpperCase()}. Redirecting to dashboard...`);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const handleDemoLogin = (selectedRole) => {
    setRole(selectedRole);
    setEmail(`${selectedRole}@verity.ai`);
    setSuccessMsg(`Session established with role: ${selectedRole.toUpperCase()}`);
    setTimeout(() => {
      navigate('/dashboard');
    }, 700);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 cyber-radial-glow">
      <div className="max-w-md w-full glass-panel-glow p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {isLogin ? 'Sign In to VerityAI' : 'Create Security Account'}
          </h2>
          <p className="text-xs text-slate-400">
            Role-Based Access Control (RBAC) & Ephemeral Biometric Session Access
          </p>
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  placeholder="Officer / Analyst Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Enterprise Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="analyst@enterprise.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="analyst">Forensic Analyst (Standard Access)</option>
              <option value="admin">Security Administrator (Full Policy & Audit Access)</option>
              <option value="viewer">Compliance Auditor (Read-Only Inspection)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/40"
          >
            {isLogin ? 'Authenticate Session' : 'Create Credential'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            {isLogin ? "Don't have an enterprise credential? " : 'Already registered? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:underline font-medium"
            >
              {isLogin ? 'Register New' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Demo Fast Login Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <p className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider">Fast Test Role Sign-in</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('analyst')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-xs text-slate-300 hover:text-cyan-300 font-mono"
            >
              Log in as Analyst
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-blue-950 border border-slate-700 hover:border-blue-500 text-xs text-slate-300 hover:text-blue-300 font-mono"
            >
              Log in as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
