import React, { useState, useEffect } from 'react';
import { HexLogo } from './HexLogo';
import { verifyPassword, setAuthenticated, checkServerSecretStatus } from '../utils/auth';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCloudflareSecret, setHasCloudflareSecret] = useState(true);

  useEffect(() => {
    checkServerSecretStatus().then(status => {
      setHasCloudflareSecret(status.isConfigured);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setAuthenticated();
        onLoginSuccess();
      } else {
        setError('Incorrect password. Please enter the password set in Cloudflare.');
      }
    } catch {
      setError('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-700/60 shadow-2xl backdrop-blur-xl bg-[#11131f]/90 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <HexLogo size="lg" withText={false} />
            <h1 className="text-xl font-black text-white tracking-tight pt-2">
              HexOS Update Center
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Restricted Developer Dashboard Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Admin Password</span>
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter Cloudflare secret password..."
                  className="w-full pl-4 pr-11 py-3 bg-[#0a0b12] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Strict Session Security Indicator */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-cyan-400/90 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Password required every time site opens
              </span>

              <span className="text-[10px] text-slate-500 font-mono">
                SHA-256
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Unlock Dashboard'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Cloudflare Secrets Status Box */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-300 leading-relaxed text-center space-y-1">
            <span className="text-emerald-400 font-mono font-semibold block flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cloudflare Secret Password Verification
            </span>
            <p className="text-[10px] text-slate-400 pt-0.5">
              Enter the secret password configured in Cloudflare Pages (under <em>Variables and secrets</em>).
            </p>
          </div>

          {/* Security Footer Note */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edge Authentication via Cloudflare Network</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
