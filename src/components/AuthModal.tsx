import React, { useState } from 'react';
import { UserRole } from '../types/index.js';
import { loginApi, registerApi } from '../services/api.js';
import {
  X,
  User,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: UserRole; token: string }) => void;
  initialIsRegister?: boolean;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  initialIsRegister = false,
  initialRole = 'citizen'
}) => {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialRole === 'admin' ? 'admin@civicsense.gov' : '');
  const [password, setPassword] = useState(initialRole === 'admin' ? 'admin123' : '');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setIsLoading(true);
      if (isRegister) {
        const res = await registerApi({ name, email, password, role });
        onLoginSuccess({
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          token: res.token
        });
      } else {
        const res = await loginApi(email, password);
        onLoginSuccess({
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          token: res.token
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@civicsense.gov');
      setPassword('admin123');
      setRole('admin');
    } else {
      setEmail('citizen@civicsense.gov');
      setPassword('citizen123');
      setRole('citizen');
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-card"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isRegister ? 'Create CivicSense Account' : 'Sign in to CivicSense'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRegister ? 'Register as citizen or municipal official' : 'Enter credentials or pick a demo account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>1-Click Demo Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('citizen')}
              className="flex items-center justify-center gap-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 py-1.5 px-2 rounded-lg font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex items-center justify-center gap-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 py-1.5 px-2 rounded-lg font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Demo Municipal Admin</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Priya Patel"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    role === 'citizen' ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    role === 'admin' ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Municipal Official
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          {isRegister ? (
            <button
              onClick={() => setIsRegister(false)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Already have an account? Sign In
            </button>
          ) : (
            <button
              onClick={() => setIsRegister(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Don't have an account? Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
