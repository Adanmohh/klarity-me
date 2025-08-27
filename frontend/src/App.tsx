import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { CardCarousel } from './components/cards/CardCarousel';
import { DailyTasksView } from './components/daily/DailyTasksView';
import { DreamJournalView } from './components/journal/DreamJournalView';
import { CreateCardModal } from './components/cards/CreateCardModal';
import { CardDetailView } from './components/cards/CardDetailView';
import { useCardStore } from './store/cardStore';
import { useDailyTaskStore } from './store/dailyTaskStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Diagnostics } from './components/Diagnostics';
import { Plus, Zap } from 'lucide-react';
import './index.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  // Page components for routing
  const FocusPage = () => {
    // If there are no cards, show empty state
    if (!cards || cards.length === 0) {
      return (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Focus Cards Yet</h3>
              <p className="text-gray-500 mb-6">Create your first focus card to start organizing your tasks</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Focus Card
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Show card carousel for now
    return (
      <div className="p-8">
        <CardCarousel
          cards={cards}
          onCardClick={handleCardClick}
        />
      </div>
    );
  };

  const AnalyticsPage = () => (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-primary-black mb-4">Analytics</h2>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  );

  const ArchivePage = () => (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-primary-black mb-4">Archive</h2>
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
      <MainLayout
        currentRoute={location.pathname}
        onNavigate={handleNavigate}
        onCreateCard={() => setIsCreateModalOpen(true)}
        onCreateTask={handleCreateTask}
      >
        <Routes>
          <Route path="/" element={
            <Dashboard
              cards={cards}
              dailyTasksCount={tasks.length}
              completedToday={5}
              weeklyStreak={7}
            />
          } />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/daily" element={<DailyTasksView />} />
          <Route path="/journal" element={<DreamJournalView />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
        </Routes>
      </MainLayout>

      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCard}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;