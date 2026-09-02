import React from 'react';
import { UserRole } from '../types/index.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Send,
  Search,
  ListOrdered,
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  BrainCircuit,
  User,
  Shield,
  LogOut,
  Home,
  Sun,
  Moon,
  UserPlus,
  LogIn,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole | 'landing';
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  highPriorityCount: number;
  currentUser: { name: string; email: string; role: UserRole; phone?: string } | null;
  onOpenAuth: (isRegister: boolean, defaultRole?: UserRole, reason?: string) => void;
  onLogout: () => void;
  onGoToLanding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  highPriorityCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onGoToLanding
}) => {
  const isLanding = currentRole === 'landing';
  const { theme, toggleTheme } = useTheme();

  return (
    <header id="app-header-nav" className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title -> clickable to Landing */}
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs overflow-hidden transition-transform group-hover:scale-105">
              <img src="/favicon.svg" alt="CivicSense Logo" className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  CivicSense
                </span>
                {currentUser?.role === 'admin' ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    Admin Command
                  </span>
                ) : currentUser?.role === 'citizen' ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    Citizen Portal
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    Municipal AI
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Automated Complaint Categorization & Urgency Triage
              </p>
            </div>
          </button>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Light / Dark) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Home button */}
            <button
              onClick={onGoToLanding}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
                isLanding
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* AUTHENTICATED USER STATE: Dedicated profile + Explicit Log Out Button */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <div className="font-bold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {currentUser.role === 'admin' ? 'Municipal Admin' : 'Registered Citizen'}
                    </div>
                  </div>
                </div>

                {/* Explicit LOG OUT Button */}
                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Sign Out of CivicSense"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              /* GUEST STATE: Clear Citizen Registration / Login and Admin Console Access */
              <div className="flex items-center gap-1.5">
                <button
                  id="navbar-guest-register-btn"
                  onClick={() => onOpenAuth(true, 'citizen', 'Register your citizen profile to lodge civic complaints.')}
                  className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>

                <button
                  id="navbar-guest-signin-btn"
                  onClick={() => onOpenAuth(false, 'citizen', 'Sign in to your citizen account.')}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Citizen</span> Sign In
                </button>

                <button
                  id="navbar-guest-admin-btn"
                  onClick={() => onRoleChange('admin')}
                  className="inline-flex items-center gap-1 text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Municipal Officer Access"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs (Only shown when inside Citizen or Admin portal) */}
        {!isLanding && (
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm no-scrollbar">
            {currentRole === 'citizen' ? (
              /* CITIZEN PORTAL TABS ONLY - No Admin links */
              <>
                <button
                  id="nav-tab-submit"
                  onClick={() => onTabChange('submit')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'submit'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Complaint</span>
                </button>

                <button
                  id="nav-tab-track"
                  onClick={() => onTabChange('track')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'track'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Status</span>
                </button>

                <button
                  id="nav-tab-my-complaints"
                  onClick={() => onTabChange('my-complaints')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'my-complaints'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>My Registered Issues</span>
                </button>
              </>
            ) : (
              /* MUNICIPAL ADMIN PORTAL TABS ONLY - Only accessible when authenticated as Admin */
              <>
                <button
                  id="nav-tab-overview"
                  onClick={() => onTabChange('overview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Command Overview</span>
                </button>

                <button
                  id="nav-tab-high-priority"
                  onClick={() => onTabChange('high-priority')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'high-priority'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>High Priority Triage</span>
                  {highPriorityCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'high-priority' ? 'bg-white text-red-700' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    }`}>
                      {highPriorityCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-tab-all-complaints"
                  onClick={() => onTabChange('all-complaints')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'all-complaints'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>All Registry Table</span>
                </button>

                <button
                  id="nav-tab-analytics"
                  onClick={() => onTabChange('analytics')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics & SLA</span>
                </button>

                <button
                  id="nav-tab-model-eval"
                  onClick={() => onTabChange('model-eval')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'model-eval'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>ML Model Metrics</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
