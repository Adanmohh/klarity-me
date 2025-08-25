import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { cardsAPI } from '../../services/api';
import { CardStack } from '../cards/CardStack';
import { ProjectWorkspace } from '../workspace/ProjectWorkspace';
import { DailyTasksView } from '../daily/DailyTasksView';
import { Header } from './Header';
import { ModeSwitcher } from './ModeSwitcher';
import { Card } from '../../types';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    cards, 
    currentCard, 
    arrangeMode,
    currentArea,
    setCards, 
    setCurrentCard, 
    toggleArrangeMode,
    setCurrentArea
  } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    const loadCards = async () => {
      try {
        // Try to load from localStorage first
        const { storage } = await import('../../utils/storage');
        const localCards = storage.loadCards();
        
        if (localCards.length > 0) {
          setCards(localCards);
          setLoading(false);
        }
        
        // Then fetch from API to sync
        const fetchedCards = await cardsAPI.getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error('Failed to load cards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [setCards]);
  
  // Auto-save cards when they change
  useEffect(() => {
    if (cards.length > 0) {
      import('../../utils/storage').then(({ storage }) => {
        storage.saveCards(cards);
      });
    }
  }, [cards]);

  const handleCardClick = async (card: Card) => {
    try {
      const cardWithTasks = await cardsAPI.getCard(card.id);
      setCurrentCard(cardWithTasks);
    } catch (error) {
      console.error('Failed to load card details:', error);
    }
  };

  const handleCreateCard = async (title: string, description?: string) => {
    try {
      const newCard = await cardsAPI.createCard({
        title,
        description,
        position: cards.length
      });
      setCards([...cards, newCard]);
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-primary-gold/30 border-t-primary-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        user={user}
        arrangeMode={arrangeMode}
        onToggleArrangeMode={toggleArrangeMode}
        onCreateCard={handleCreateCard}
        hasCards={cards.length > 0}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Mode Switcher */}
        {!currentCard && (
          <ModeSwitcher 
            currentMode={currentArea}
            onModeChange={setCurrentArea}
          />
        )}
        
        {/* Content based on mode */}
        {currentArea === 'focus' ? (
          currentCard ? (
            <ProjectWorkspace 
              card={currentCard}
              onClose={() => setCurrentCard(null)}
            />
          ) : (
            <CardStack
              cards={cards}
              onCardClick={handleCardClick}
              arrangeMode={arrangeMode}
            />
          )
        ) : (
          <DailyTasksView />
        )}
      </main>
    </div>
  );
};