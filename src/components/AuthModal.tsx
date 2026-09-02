import React, { useState } from 'react';
import { UserRole } from '../types/index.js';
import { loginApi, registerApi } from '../services/api.js';
import {
  X,
  User,
  Shield,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  UserCheck,
  Building2,
  CheckCircle
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: UserRole; token: string; phone?: string }) => void;
  initialIsRegister?: boolean;
  initialRole?: UserRole;
  promptReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  initialIsRegister = false,
  initialRole = 'citizen',
  promptReason
}) => {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialRole === 'admin' ? 'admin@civicsense.gov' : '');
  const [phone, setPhone] = useState(initialRole === 'citizen' ? '+1 (555) 432-8910' : '');
  const [password, setPassword] = useState(initialRole === 'admin' ? 'admin123' : 'password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setIsLoading(true);
      if (isRegister) {
        if (!name.trim()) {
          setErrorMsg('Full name is required for registration.');
          setIsLoading(false);
          return;
        }
        const res = await registerApi({ name: name.trim(), email: email.trim(), password, role });
        onLoginSuccess({
          name: res.user.name,
          email: res.user.email,
          role: role,
          token: res.token,
          phone: phone.trim() || undefined
        });
      } else {
        const res = await loginApi(email.trim(), password, role);
        onLoginSuccess({
          name: res.user.name,
          email: res.user.email,
          role: role,
          token: res.token,
          phone: phone.trim() || undefined
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole, isDemoRegister: boolean = false) => {
    if (demoRole === 'admin') {
      setEmail('admin@civicsense.gov');
      setPassword('admin123');
      setName('Commissioner K. Rao');
      setRole('admin');
      setIsRegister(isDemoRegister);
    } else {
      setEmail('aarav.sharma@example.com');
      setPassword('citizen123');
      setName('Aarav Sharma');
      setPhone('+1 (555) 234-5678');
      setRole('citizen');
      setIsRegister(isDemoRegister);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-card"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 transition-colors my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                role === 'admin'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}>
                {role === 'admin' ? 'Municipal Admin Access' : 'Citizen Portal'}
              </span>
              {isRegister && (
                <span className="text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Mandatory Registration
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRegister
                ? role === 'citizen'
                  ? 'Register Citizen Profile'
                  : 'Register Municipal Official'
                : role === 'citizen'
                ? 'Sign in as Citizen'
                : 'Sign in to Admin Console'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {promptReason ||
                (isRegister
                  ? 'Mandatory registration to lodge civic issues and track live resolutions'
                  : 'Access your registered complaints or municipal triage queue')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => {
              setRole('citizen');
              if (email === 'admin@civicsense.gov') {
                setEmail('');
                setPassword('password123');
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              role === 'citizen'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setEmail('admin@civicsense.gov');
              setPassword('admin123');
              setIsRegister(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Municipal Admin</span>
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Instant 1-Click Credentials:</span>
            </span>
            <span className="text-[10px] text-slate-400">For Quick Testing</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('citizen', isRegister)}
              className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-2 px-2.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">Citizen (Aarav)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin', false)}
              className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-2 px-2.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">Admin (Official)</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Full Legal / Citizen Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Patel"
                  className="w-full pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@civicsense.gov' : 'priya.patel@example.com'}
                className="w-full pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isRegister && role === 'citizen' && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Phone Number (For SMS Emergency Alerts)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {isLoading
                ? 'Authenticating...'
                : isRegister
                ? 'Complete Citizen Registration'
                : role === 'admin'
                ? 'Sign In to Admin Console'
                : 'Sign In as Citizen'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Sign In to Account
              </button>
            </p>
          ) : (
            <p>
              New Citizen?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Register Mandatory Profile
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

