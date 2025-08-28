import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProfessionalSidebar } from './components/layout/ProfessionalSidebar';
import { Dashboard } from './pages/Dashboard';
import { Archive } from './pages/Archive';
import { DeepWorkDashboard } from './pages/DeepWorkDashboard';
import { FocusPage } from './pages/FocusPage';
import IdentitySettings from './pages/IdentitySettings';
import Habits from './pages/Habits';
import { CardCarousel } from './components/cards/CardCarousel';
import { DailyTasksView } from './components/daily/DailyTasksView';
import DailyTasksViewStyled from './components/daily/DailyTasksViewStyled';
import { DreamJournalView } from './components/journal/DreamJournalView';
import { CreateCardModal } from './components/cards/CreateCardModal';
import { CardDetailView } from './components/cards/CardDetailView';
import { useCardStore } from './store/cardStore';
import { useDailyTaskStore } from './store/dailyTaskStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Diagnostics } from './components/Diagnostics';
import { Plus, Zap } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { GlobalSearch } from './components/search/GlobalSearch';
import './styles/globals.css';
import './index.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { cards, fetchCards, createCard } = useCardStore();
  const { tasks } = useDailyTaskStore();

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
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-primary-black mb-4">Analytics</h2>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  );


  const SettingsPage = () => (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-primary-black mb-4">Settings</h2>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  );

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
          <Route path="/" element={<FocusPage />} />
          <Route path="/deep-work-old" element={<DeepWorkDashboard />} />
          <Route path="/dashboard-old" element={
            <Dashboard
              cards={cards}
              dailyTasksCount={tasks.length}
              completedToday={5}
              weeklyStreak={7}
            />
          } />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/daily" element={<DailyTasksViewStyled />} />
          <Route path="/journal" element={<DreamJournalView />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/identity" element={<IdentitySettings />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
        </Routes>
      </ProfessionalSidebar>

      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCard}
      />
      
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;