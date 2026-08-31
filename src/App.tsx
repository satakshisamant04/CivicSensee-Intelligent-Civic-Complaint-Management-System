import React, { useState, useEffect } from 'react';
import { UserRole, Complaint } from './types/index.js';
import { fetchAnalyticsApi, loginApi } from './services/api.js';
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
  }>({});

  // High Priority Count for Badges
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  // User State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    token: string;
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

  const handleOpenAuth = (defaultRole?: UserRole, isRegister?: boolean) => {
    setAuthModalConfig({ defaultRole, isRegister });
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
        token: res.token
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
        token: `demo-token-${Date.now()}`
      };
      setCurrentUser(fallbackUser);
      setCurrentRole(demoRole);
      setCurrentView(demoRole);
      setActiveTab(demoRole === 'admin' ? 'overview' : 'submit');
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

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentView}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        highPriorityCount={highPriorityCount}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('landing');
        }}
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
                defaultCitizenEmail={currentUser?.email || 'citizen@civicsense.gov'}
                defaultCitizenName={currentUser?.name || 'Aarav Sharma'}
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

        {/* 3. ADMIN / MUNICIPAL AUTHORITY VIEWS */}
        {currentView === 'admin' && (
          <div className="animate-in fade-in duration-150">
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
          </div>
        )}
      </main>

      {/* Clean CivicSense Footer without interview prep references */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CivicSense</span>
            <span>•</span>
            <span>Civic Complaint Intelligence & Priority Dispatch System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
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
              className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
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
              className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              Admin Console
            </button>
            <span>•</span>
            <span className="font-mono text-slate-400">TF-IDF + Softmax ML Engine</span>
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
