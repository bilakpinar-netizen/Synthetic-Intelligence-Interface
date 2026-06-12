import React, { useState } from 'react';
import {
  Shield,
  Key,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CornerDownRight,
  Laptop
} from 'lucide-react';

interface LoginGateProps {
  onLogin: (operatorName: string, role: string) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('operator@synthetic.io');
  const [selectedOperator, setSelectedOperator] = useState({
    name: 'Elena Volkov',
    role: 'Product Lead & Developer'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const operators = [
    {
      name: 'Elena Volkov',
      role: 'Product Lead & Developer',
      initials: 'EV',
      gradient: 'from-blue-400 to-purple-500'
    },
    {
      name: 'Alex Rivera',
      role: 'Infrastructure Architect',
      initials: 'AR',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Guest Auditor',
      role: 'Guest Sandboxed Session',
      initials: 'GS',
      gradient: 'from-emerald-400 to-blue-500'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please input a valid console operator email.');
      return;
    }

    setIsAuthenticating(true);
    setErrorMsg('');

    // Simulate cryptographic key verification latency
    setTimeout(() => {
      onLogin(selectedOperator.name, selectedOperator.role);
      setIsAuthenticating(false);
    }, 1200);
  };

  return (
    <div id="auth-portal-wrapper" className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative z-50">
      
      {/* Background radial spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[130px]"></div>
        <div className="absolute bottom-[20%] right-[30%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[130px]"></div>
      </div>

      <div id="auth-glass-container" className="max-w-md w-full glass-panel p-8 rounded-2xl border border-white/10 relative z-10 flex flex-col gap-6 bg-brand-surface-low/80 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        
        {/* Brand visual header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 border border-white/10 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(59,130,246,0.3)] mb-2">
            <Lock className="h-5 w-5 animate-pulse" />
          </div>
          <h1 className="font-display font-extrabold text-xl text-white tracking-tight">
            Synthetic Intelligence Portal
          </h1>
          <p className="text-xs text-brand-text-slate max-w-[280px]">
            Mobile App AI Orchestration Console Security Verification Gate
          </p>
        </div>

        {/* Quick select operator identity */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] tracking-wider font-bold text-center uppercase text-brand-text-slate font-sans">
            Choose Control Identity
          </label>
          <div className="flex flex-col gap-2">
            {operators.map((op) => {
              const acts = op.name === selectedOperator.name;
              return (
                <button
                  key={op.name}
                  type="button"
                  onClick={() => {
                    setSelectedOperator({ name: op.name, role: op.role });
                    if (op.name === 'Elena Volkov') setEmail('operator@synthetic.io');
                    else if (op.name === 'Alex Rivera') setEmail('alex.rivera@synthetic.io');
                    else setEmail('guest.auditor@synthetic.io');
                    setErrorMsg('');
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    acts
                      ? 'bg-white/10 border-blue-500/50 shadow-[0_4px_12px_rgba(59,130,246,0.15)] text-white'
                      : 'bg-white/0 border-white/5 text-brand-text-slate hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${op.gradient} flex items-center justify-center text-white font-extrabold text-xs select-none`}>
                      {op.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{op.name}</span>
                      <span className="text-[9px] opacity-75">{op.role}</span>
                    </div>
                  </div>
                  {acts && <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth form inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-[10px] font-bold text-brand-text-slate uppercase tracking-wider">email credential</label>
              <span className="text-[9px] text-brand-text-slate font-mono">domain verified</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-slate pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@synthetic.io"
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-[10px] font-bold text-brand-text-slate uppercase tracking-wider font-sans">passcode</label>
              <span className="text-[9px] text-blue-400 font-mono">bypass key format (any passphrase)</span>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-slate pointer-events-none" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white tracking-widest focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 font-bold self-start w-full">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-2 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-sans text-xs font-bold shadow-[0_4px_20px_rgba(59,130,246,0.35)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAuthenticating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cryptographic handshaking...
              </>
            ) : (
              <>
                Synchronize secure credentials
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-brand-text-slate border-t border-white/5 pt-4">
          <span className="flex items-center gap-1">
            <Laptop className="h-3.5 w-3.5" />
            Active hardware binding
          </span>
          <span>Build Console 2026</span>
        </div>

      </div>

    </div>
  );
}
