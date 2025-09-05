import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProfessionalSidebar } from './components/layout/ProfessionalSidebar';
import { Dashboard } from './pages/Dashboard';
import { Archive } from './pages/Archive';
import { DeepWorkDashboard } from './pages/DeepWorkDashboard';
import { FocusPage } from './pages/FocusPage';
import IdentityEvolutionCenter from './components/identity/IdentityEvolutionCenter';
import ManifestationJournal from './components/identity/ManifestationJournal';
import PowerStatements from './components/identity/PowerStatements';
import { CardCarousel } from './components/cards/CardCarousel';
import { DailyTasksView } from './components/daily/DailyTasksView';
import DailyTasksViewStyled from './components/daily/DailyTasksViewStyled';
import { DreamJournalView } from './components/journal/DreamJournalView';
import { MindJournalView } from './components/journal/MindJournalView';
import { CreateCardModal } from './components/cards/CreateCardModal';
import { CardDetailView } from './components/cards/CardDetailView';
import { useCardStore } from './store/cardStore';
import { useDailyTaskStore } from './store/dailyTaskStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Diagnostics } from './components/Diagnostics';
import { 
  ForgotPasswordForm, 
  ResetPasswordForm, 
  AuthCallback, 
  ProtectedRoute, 
  PublicOnlyRoute 
} from './components/auth';
import { OTPAuth } from './components/auth/OTPAuth';
import { Plus, Zap } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { GlobalSearch } from './components/search/GlobalSearch';
import './styles/globals.css';
import './index.css';
import { useAuthStore } from './store/authStore';

// New UI Components
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { CompletionMetrics } from './components/analytics/CompletionMetrics';
import { useGlobalKeyboardShortcuts, formatShortcut } from './hooks/useGlobalKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './components/help/KeyboardShortcutsHelp';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { cards, fetchCards, createCard } = useCardStore();
  const { tasks } = useDailyTaskStore();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  
  // Use the global keyboard shortcuts hook
  const { 
    shortcuts, 
    isHelpOpen, 
    setIsHelpOpen,
    isSearchOpen: globalSearchOpen,
    setIsSearchOpen: setGlobalSearchOpen,
    isCreateModalOpen: globalCreateOpen,
    setIsCreateModalOpen: setGlobalCreateOpen
  } = useGlobalKeyboardShortcuts();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
    
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [initializeAuth, isAuthenticated]);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        await fetchCards();
      } catch (error) {
        console.error('Failed to load cards:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchCards]);

  const handleNavigate = (route: string) => {
    navigate(route);
    setSelectedCard(null);
  };

  const handleCardClick = (card: any) => {
    // Navigate to card detail route instead of setting state
    navigate(`/card/${card.id}`);
  };

  const handleCreateCard = async (title: string, description?: string) => {
    await createCard({ title, description });
    setIsCreateModalOpen(false);
  };

  const handleCreateTask = () => {
    // Navigate to daily tasks and open create modal
    navigate('/daily');
  };
  
  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onCreateCard: () => setIsCreateModalOpen(true),
    onCreateTask: handleCreateTask,
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
  });
  
  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ for search
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Card detail page component
  const CardDetailPage = () => {
    const cardId = location.pathname.split('/card/')[1];
    const card = cards.find(c => c.id === cardId);
    
    if (!card) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Card Not Found</h2>
          <button
            onClick={() => navigate('/focus')}
            className="text-primary-500 hover:text-primary-600"
          >
            Back to Focus Area
          </button>
        </div>
      );
    }
    
    return (
      <CardDetailView
        card={card}
        onBack={() => navigate('/focus')}
      />
    );
  };

  // Using FocusPage from ./pages/FocusPage - removed local definition

  const AnalyticsPage = () => (
    <div className="p-8">
      <CompletionMetrics />
    </div>
  );


  const SettingsPage = () => (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-primary-black mb-4">Settings</h2>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  );

  // Check if current route is an auth page
  const isAuthPage = location.pathname.startsWith('/auth') || 
                     location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/register';

  // If it's an auth page, render without sidebar
  if (isAuthPage) {
    return (
      <>
        <Routes>
          {/* Auth routes - accessible only when NOT authenticated */}
          <Route path="/auth/login" element={
            <PublicOnlyRoute>
              <OTPAuth />
            </PublicOnlyRoute>
          } />
          <Route path="/auth/signup" element={
            <PublicOnlyRoute>
              <OTPAuth />
            </PublicOnlyRoute>
          } />
          <Route path="/login" element={
            <PublicOnlyRoute>
              <OTPAuth />
            </PublicOnlyRoute>
          } />
          <Route path="/signup" element={
            <PublicOnlyRoute>
              <OTPAuth />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <OTPAuth />
            </PublicOnlyRoute>
          } />
          <Route path="/auth/forgot-password" element={
            <PublicOnlyRoute>
              <ForgotPasswordForm />
            </PublicOnlyRoute>
          } />
          <Route path="/auth/reset-password" element={
            <ResetPasswordForm />
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </>
    );
  }

  // Regular app with sidebar
  return (
    <>
      <ProfessionalSidebar
        currentRoute={location.pathname}
        onNavigate={handleNavigate}
        onCreateCard={() => setIsCreateModalOpen(true)}
        onCreateTask={handleCreateTask}
        isCommandPaletteOpen={isCommandPaletteOpen}
        onCloseCommandPalette={() => setIsCommandPaletteOpen(false)}
      >
        <Routes>
          {/* Protected routes - accessible only when authenticated */}
          <Route path="/" element={
            <ProtectedRoute>
              <FocusPage />
            </ProtectedRoute>
          } />
          <Route path="/focus" element={
            <ProtectedRoute>
              <FocusPage />
            </ProtectedRoute>
          } />
          <Route path="/card/:id" element={
            <ProtectedRoute>
              <CardDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/daily" element={
            <ProtectedRoute>
              <DailyTasksViewStyled />
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute>
              <MindJournalView />
            </ProtectedRoute>
          } />
          <Route path="/dream-journal" element={
            <ProtectedRoute>
              <DreamJournalView />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/archive" element={
            <ProtectedRoute>
              <Archive />
            </ProtectedRoute>
          } />
          <Route path="/identity-evolution" element={
            <ProtectedRoute>
              <IdentityEvolutionCenter />
            </ProtectedRoute>
          } />
          <Route path="/manifestation-journal" element={
            <ProtectedRoute>
              <ManifestationJournal />
            </ProtectedRoute>
          } />
          <Route path="/power-statements" element={
            <ProtectedRoute>
              <PowerStatements />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/diagnostics" element={
            <ProtectedRoute>
              <Diagnostics />
            </ProtectedRoute>
          } />
        </Routes>
      </ProfessionalSidebar>

      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCard}
      />
      
      <GlobalSearch
        isOpen={isSearchOpen || globalSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setGlobalSearchOpen(false);
        }}
      />
      
      {/* Notification Center */}
      <NotificationCenter />
      
      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow 
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('hasSeenOnboarding', 'true');
          }}
        />
      )}
      
      {/* Keyboard Shortcuts Help */}
      {isHelpOpen && (
        <KeyboardShortcutsHelp 
          shortcuts={shortcuts}
          onClose={() => setIsHelpOpen(false)}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;