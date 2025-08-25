import React, { useState, useEffect } from 'react';
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
import './index.css';

function App() {
  const [currentRoute, setCurrentRoute] = useState('/');
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
    setCurrentRoute(route);
    setSelectedCard(null);
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
  };

  const handleCreateCard = async (title: string, description?: string) => {
    await createCard({ title, description });
    setIsCreateModalOpen(false);
  };

  const handleCreateTask = () => {
    // Navigate to daily tasks and open create modal
    setCurrentRoute('/daily');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render card detail view if a card is selected
  if (selectedCard) {
    return (
      <CardDetailView
        card={selectedCard}
        onBack={() => setSelectedCard(null)}
      />
    );
  }

  // Render appropriate page based on route
  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return (
          <Dashboard
            cards={cards}
            dailyTasksCount={tasks.length}
            completedToday={5}
            weeklyStreak={7}
          />
        );
      case '/focus':
        return (
          <div className="p-8">
            <CardCarousel
              cards={cards}
              onCardClick={handleCardClick}
            />
          </div>
        );
      case '/daily':
        return <DailyTasksView />;
      case '/journal':
        return <DreamJournalView />;
      case '/analytics':
        return (
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-primary-black mb-4">Analytics</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
      case '/archive':
        return (
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-primary-black mb-4">Archive</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
      case '/settings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-primary-black mb-4">Settings</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
      case '/diagnostics':
        return <Diagnostics />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-primary-black mb-4">404</h2>
            <p className="text-gray-500">Page not found</p>
          </div>
        );
    }
  };

  return (
    <>
      <MainLayout
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onCreateCard={() => setIsCreateModalOpen(true)}
        onCreateTask={handleCreateTask}
      >
        {renderPage()}
      </MainLayout>

      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCard}
      />
    </>
  );
}

export default App;