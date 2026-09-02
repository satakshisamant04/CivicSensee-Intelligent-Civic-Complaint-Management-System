import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Shield,
  KeyRound,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { loginApi } from '../services/api.js';
import { UserRole } from '../types/index.js';

interface AdminAccessGateProps {
  onAdminLoginSuccess: (user: { name: string; email: string; role: UserRole; token: string }) => void;
  onReturnToCitizen: () => void;
  onGoToLanding: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  onAdminLoginSuccess,
  onReturnToCitizen,
  onGoToLanding
}) => {
  const [email, setEmail] = useState('admin@civicsense.gov');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setIsLoading(true);
      const res = await loginApi(email.trim(), password, 'admin');
      if (res.user.role.toLowerCase() !== 'admin') {
        setErrorMsg('Access Denied: This account does not possess Municipal Administrator privileges.');
        setIsLoading(false);
        return;
      }
      onAdminLoginSuccess({
        name: res.user.name,
        email: res.user.email,
        role: 'admin',
        token: res.token
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@civicsense.gov');
    setPassword('admin123');
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-0">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-6 transition-colors">
        {/* Security Shield Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
              Restricted Municipal Authority Access
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              Municipal Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
              Citizens are separated from the municipal command dashboard. Please authenticate with authorized administrator credentials to manage triage, emergency dispatches, and SLA operations.
            </p>
          </div>
        </div>

        {/* Quick Demo Fill Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Official Admin Demo:</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              admin@civicsense.gov • admin123
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoAdmin}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Auto-Fill
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Municipal Officer Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@civicsense.gov"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Security Passcode
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate as Municipal Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Navigation options */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={onReturnToCitizen}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Citizen Portal</span>
          </button>

          <button
            onClick={onGoToLanding}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
