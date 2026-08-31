import React from 'react';
import { UserRole } from '../types/index.js';
import {
  Building2,
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
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole | 'landing';
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  highPriorityCount: number;
  currentUser: { name: string; email: string; role: UserRole } | null;
  onOpenAuth: (defaultRole?: UserRole, isRegister?: boolean) => void;
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

  return (
    <header id="app-header-nav" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title -> clickable to Landing */}
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-xs font-bold text-lg transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  CivicSense
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Municipal Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Automated Complaint Categorization & Urgency Triage
              </p>
            </div>
          </button>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home / Landing button */}
            <button
              onClick={onGoToLanding}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
                isLanding
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Portal Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
              <button
                id="role-switch-citizen"
                onClick={() => {
                  onRoleChange('citizen');
                  if (!['submit', 'track', 'my-complaints'].includes(activeTab)) {
                    onTabChange('submit');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentRole === 'citizen'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Citizen</span>
              </button>

              <button
                id="role-switch-admin"
                onClick={() => {
                  onRoleChange('admin');
                  if (!['overview', 'high-priority', 'all-complaints', 'analytics', 'model-eval'].includes(activeTab)) {
                    onTabChange('overview');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* User Account / Profile button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="hidden lg:block text-right text-xs">
                  <div className="font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono capitalize">{currentUser.role} Account</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('citizen', false)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('citizen', true)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer hidden sm:inline-block"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs (Only shown when inside Citizen or Admin portal) */}
        {!isLanding && (
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 text-xs sm:text-sm no-scrollbar">
            {currentRole === 'citizen' ? (
              <>
                <button
                  id="nav-tab-submit"
                  onClick={() => onTabChange('submit')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'submit'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>My Registered Issues</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-tab-overview"
                  onClick={() => onTabChange('overview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>High Priority Triage</span>
                  {highPriorityCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'high-priority' ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
