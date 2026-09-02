import React, { useState, useEffect } from 'react';
import { UserRole, Complaint } from './types/index.js';
import { fetchAnalyticsApi, loginApi, registerApi } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './components/LandingPage.js';
import { SubmitComplaintForm } from './components/SubmitComplaintForm.js';
import { TrackComplaintView } from './components/TrackComplaintView.js';
import { CitizenMyComplaints } from './components/CitizenMyComplaints.js';
import { AdminOverview } from './components/AdminOverview.js';
import { AdminHighPriorityQueue } from './components/AdminHighPriorityQueue.js';
import { AdminAllComplaints } from './components/AdminAllComplaints.js';
import { AdminAnalytics } from './components/AdminAnalytics.js';
import { ModelEvaluationExplorer } from './components/ModelEvaluationExplorer.js';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal.js';
import { AuthModal } from './components/AuthModal.js';
import { AdminAccessGate } from './components/AdminAccessGate.js';

export default function App() {
  // Navigation & Role: 'landing' | 'citizen' | 'admin'
  const [currentView, setCurrentView] = useState<UserRole | 'landing'>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeTab, setActiveTab] = useState<string>('submit');

  // Active track ID when navigating from submission
  const [trackingId, setTrackingId] = useState<string>('');

  // Selected Complaint for Full Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    defaultRole?: UserRole;
    isRegister?: boolean;
    reason?: string;
  }>({});

  // High Priority Count for Badges
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  // User State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    token: string;
    phone?: string;
  } | null>(null);

  // Sync high priority count
  const refreshMetrics = async () => {
    try {
      const res = await fetchAnalyticsApi();
      setHighPriorityCount(res.analytics.highPriority);
    } catch (e) {
      // quiet
    }
  };

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setCurrentView(newRole);
    if (newRole === 'admin') {
      setActiveTab('overview');
    } else {
      setActiveTab('submit');
    }
  };

  const handleOpenAuth = (isRegister: boolean = false, defaultRole?: UserRole, reason?: string) => {
    setAuthModalConfig({ defaultRole: defaultRole || 'citizen', isRegister, reason });
    setShowAuthModal(true);
  };

  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    try {
      const email = demoRole === 'admin' ? 'admin@civicsense.gov' : 'citizen@civicsense.gov';
      const password = demoRole === 'admin' ? 'admin123' : 'citizen123';
      const res = await loginApi(email, password, demoRole);
      
      const sessionUser = {
        name: res.user.name,
        email: res.user.email,
        role: demoRole,
        token: res.token,
        phone: '+1 (555) 234-5678'
      };
      
      setCurrentUser(sessionUser);
      setCurrentRole(demoRole);
      setCurrentView(demoRole);
      setActiveTab(demoRole === 'admin' ? 'overview' : 'submit');
    } catch (e) {
      // Fallback local demo state
      const fallbackUser = {
        name: demoRole === 'admin' ? 'Commissioner K. Rao' : 'Aarav Sharma',
        email: demoRole === 'admin' ? 'admin@civicsense.gov' : 'citizen@civicsense.gov',
        role: demoRole,
        token: `demo-token-${Date.now()}`,
        phone: '+1 (555) 234-5678'
      };
      setCurrentUser(fallbackUser);
      setCurrentRole(demoRole);
      setCurrentView(demoRole);
      setActiveTab(demoRole === 'admin' ? 'overview' : 'submit');
    }
  };

  const handleAutoRegisterDemoCitizen = async () => {
    try {
      const res = await registerApi({
        name: 'Aarav Sharma',
        email: 'citizen@civicsense.gov',
        password: 'citizen123',
        role: 'citizen',
        phone: '+1 (555) 234-5678'
      });
      const sessionUser = {
        name: res.user.name,
        email: res.user.email,
        role: 'citizen' as UserRole,
        token: res.token,
        phone: '+1 (555) 234-5678'
      };
      setCurrentUser(sessionUser);
      setCurrentRole('citizen');
      setCurrentView('citizen');
      setActiveTab('submit');
    } catch (e) {
      handleQuickDemoLogin('citizen');
    }
  };

  const handleSubmissionSuccess = (complaintId: string) => {
    setTrackingId(complaintId);
    setActiveTab('track');
    refreshMetrics();
  };

  const handleComplaintUpdated = (updated: Complaint) => {
    setSelectedComplaint(updated);
    refreshMetrics();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('citizen');
    setCurrentView('landing');
    setActiveTab('submit');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentView}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        highPriorityCount={highPriorityCount}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onGoToLanding={() => setCurrentView('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. LANDING PAGE VIEW */}
        {currentView === 'landing' && (
          <LandingPage
            onStartCitizen={() => {
              setCurrentRole('citizen');
              setCurrentView('citizen');
              setActiveTab('submit');
            }}
            onStartAdmin={() => {
              setCurrentRole('admin');
              setCurrentView('admin');
              setActiveTab('overview');
            }}
            onOpenAuth={handleOpenAuth}
            onQuickDemoLogin={handleQuickDemoLogin}
          />
        )}

        {/* 2. CITIZEN PORTAL VIEWS */}
        {currentView === 'citizen' && (
          <div className="animate-in fade-in duration-150">
            {activeTab === 'submit' && (
              <SubmitComplaintForm
                onSuccess={handleSubmissionSuccess}
                currentUser={currentUser}
                onOpenAuth={handleOpenAuth}
                onAutoRegisterDemoCitizen={handleAutoRegisterDemoCitizen}
              />
            )}

            {activeTab === 'track' && (
              <TrackComplaintView
                initialComplaintId={trackingId}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
              />
            )}

            {activeTab === 'my-complaints' && (
              <CitizenMyComplaints
                citizenEmail={currentUser?.email || 'citizen@civicsense.gov'}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onNavigateSubmit={() => setActiveTab('submit')}
              />
            )}
          </div>
        )}

        {/* 3. ADMIN / MUNICIPAL AUTHORITY VIEWS: STRICTLY SEPARATED VIA ACCESS GATE */}
        {currentView === 'admin' && (
          <div className="animate-in fade-in duration-150">
            {currentUser?.role !== 'admin' ? (
              /* Security Gate: Citizen or non-admin cannot view the Admin dashboard */
              <AdminAccessGate
                onAdminLoginSuccess={(adminUser) => {
                  setCurrentUser(adminUser);
                  setCurrentRole('admin');
                  setCurrentView('admin');
                  setActiveTab('overview');
                }}
                onReturnToCitizen={() => {
                  setCurrentRole('citizen');
                  setCurrentView('citizen');
                  setActiveTab('submit');
                }}
                onGoToLanding={() => setCurrentView('landing')}
              />
            ) : (
              /* Verified Municipal Administrator Dashboard */
              <>
                {activeTab === 'overview' && (
                  <AdminOverview
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                  />
                )}

                {activeTab === 'high-priority' && (
                  <AdminHighPriorityQueue
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                  />
                )}

                {activeTab === 'all-complaints' && (
                  <AdminAllComplaints
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AdminAnalytics />
                )}

                {activeTab === 'model-eval' && (
                  <ModelEvaluationExplorer />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Clean CivicSense Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">CivicSense</span>
            <span>•</span>
            <span>Municipal Complaint Intelligence & Rapid Response System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentRole('citizen');
                setCurrentView('citizen');
                setActiveTab('submit');
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
            >
              Citizen Portal
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentRole('admin');
                setCurrentView('admin');
                setActiveTab('overview');
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
            >
              Admin Console
            </button>
            <span>•</span>
            <span className="font-mono text-slate-400 dark:text-slate-500">TF-IDF + Softmax ML Engine</span>
          </div>
        </div>
      </footer>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onComplaintUpdated={handleComplaintUpdated}
        />
      )}

      {/* Authentication & Registration Modal */}
      {showAuthModal && (
        <AuthModal
          initialIsRegister={authModalConfig.isRegister}
          initialRole={authModalConfig.defaultRole}
          reason={authModalConfig.reason}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setCurrentRole(user.role);
            setCurrentView(user.role);
            setActiveTab(user.role === 'admin' ? 'overview' : 'submit');
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
