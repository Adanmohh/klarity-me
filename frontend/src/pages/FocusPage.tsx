import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types';
import { useCardStore } from '../store/cardStore';
import { FocusSessionView } from '../components/cards/FocusSessionView';
import { GlassCard } from '../components/ui/GlassCard';
import { AccessibleButton } from '../components/ui/AccessibleButton';
import { Icons } from '../components/icons/LucideIcons';

// Sortable Card Component
const SortableCard: React.FC<{ 
  card: Card; 
  isActive: boolean;
  isNext: boolean; 
  onEnterFocus: () => void;
  onPauseCard: () => void;
  onActivateCard: () => void;
}> = ({ 
  card, 
  isActive,
  isNext,
  onEnterFocus,
  onPauseCard,
  onActivateCard
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <GlassCard className={`p-4 ${isActive ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : isNext ? 'ring-2 ring-primary-500' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Icons.Menu className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {card.title}
                </h3>
                {isActive && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                    ACTIVE
                  </span>
                )}
                {isNext && !isActive && (
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                    Next Up
                  </span>
                )}
                {card.status === 'on-hold' && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded">
                    ON HOLD
                  </span>
                )}
              </div>
              {card.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {card.description}
                </p>
              )}
              {card.last_worked_on && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Last worked: {new Date(card.last_worked_on).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Enter Focus Mode button - ONLY for active card */}
            {isActive ? (
              <AccessibleButton
                variant="primary"
                size="sm"
                onClick={onEnterFocus}
                ariaLabel="Enter focus mode for this card"
              >
                <Icons.Focus className="w-4 h-4 mr-1" />
                Enter Focus
              </AccessibleButton>
            ) : null}

            {/* Quick Actions */}
            {isActive ? (
              <AccessibleButton
                variant="secondary"
                size="sm"
                onClick={onPauseCard}
                ariaLabel="Pause this card"
              >
                <Icons.Pause className="w-4 h-4" />
              </AccessibleButton>
            ) : card.status === 'on-hold' ? (
              <AccessibleButton
                variant="secondary"
                size="sm"
                onClick={onActivateCard}
                ariaLabel="Resume this card"
              >
                <Icons.Play className="w-4 h-4" />
                <span className="ml-1">Resume</span>
              </AccessibleButton>
            ) : (
              <AccessibleButton
                variant="ghost"
                size="sm"
                onClick={onActivateCard}
                ariaLabel="Set as active card"
              >
                <Icons.Play className="w-4 h-4" />
                <span className="ml-1">Activate</span>
              </AccessibleButton>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export const FocusPage: React.FC = () => {
  const { cards, fetchCards, updateCard } = useCardStore();
  const [focusCard, setFocusCard] = useState<Card | null>(null); // Card currently in focus mode
  const [queuedCards, setQueuedCards] = useState<Card[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [whereLeftOff, setWhereLeftOff] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Fetch cards and ensure only one is active on mount
    const initializeCards = async () => {
      await fetchCards();
    };
    initializeCards();
  }, [fetchCards]);

  useEffect(() => {
    // SAFETY: Ensure only ONE card is active
    const activeCards = cards.filter(c => c.status === 'active');
    if (activeCards.length > 1) {
      console.warn(`Multiple active cards detected (${activeCards.length}), fixing...`);
      // Fix immediately - keep only the first one active
      const fixMultipleActive = async () => {
        for (let i = 1; i < activeCards.length; i++) {
          await updateCard(activeCards[i].id, { status: 'queued' });
        }
        // Re-fetch to ensure UI is in sync
        await fetchCards();
      };
      fixMultipleActive();
      return; // Exit early to wait for re-fetch
    }
    
    // Set active card and queued cards
    const active = activeCards[0] || null;
    const queued = cards
      .filter(c => c.status !== 'completed')
      .sort((a, b) => {
        // Active card first
        if (a.status === 'active') return -1;
        if (b.status === 'active') return 1;
        // Then by position
        return (a.position || 0) - (b.position || 0);
      });
    
    setActiveCard(active);
    setQueuedCards(queued);
  }, [cards, updateCard, fetchCards]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = queuedCards.findIndex((card) => card.id === active.id);
      const newIndex = queuedCards.findIndex((card) => card.id === over?.id);

      const newOrder = arrayMove(queuedCards, oldIndex, newIndex);
      setQueuedCards(newOrder);

      // Update positions in backend
      newOrder.forEach((card, index) => {
        updateCard(card.id, { position: index });
      });
    }
  };

  const handleEnterFocus = (card: Card) => {
    // Enter focus mode for ANY card (doesn't have to be active)
    setFocusCard(card);
  };

  const handleActivateCard = async (card: Card) => {
    // First, deactivate ALL active cards (ensure only ONE can be active)
    const currentlyActive = cards.filter(c => c.status === 'active');
    for (const activeCard of currentlyActive) {
      if (activeCard.id !== card.id) {
        await updateCard(activeCard.id, { status: 'queued' });
      }
    }
    // Then set this card as active
    await updateCard(card.id, { status: 'active' });
    // Fetch updated cards to ensure UI syncs
    await fetchCards();
  };

  const handlePauseCard = async (card: Card) => {
    // Pause the active card (change to on-hold)
    await updateCard(card.id, { status: 'on-hold' });
    // Fetch updated cards to ensure UI syncs
    await fetchCards();
  };

  const handleEndSession = async (cardId: string, leftOff?: string) => {
    if (leftOff) {
      setWhereLeftOff(prev => ({ ...prev, [cardId]: leftOff }));
      await updateCard(cardId, { 
        where_left_off: leftOff,
        last_worked_on: new Date().toISOString()
      });
    } else {
      await updateCard(cardId, { 
        last_worked_on: new Date().toISOString()
      });
    }
    setFocusCard(null);
  };

  const handleCompleteCard = async (cardId: string) => {
    await updateCard(cardId, { status: 'completed' });
    setFocusCard(null);
    
    // Auto-activate next card if there is one
    const nextCard = queuedCards.find(c => c.status === 'queued' && c.id !== cardId);
    if (nextCard) {
      await handleActivateCard(nextCard);
    }
  };

  // If in focus mode, show the focus session view
  if (focusCard) {
    return (
      <FocusSessionView
        card={focusCard}
        onEndSession={(leftOff) => handleEndSession(focusCard.id, leftOff)}
        onCompleteCard={() => handleCompleteCard(focusCard.id)}
      />
    );
  }

  // Otherwise show the queue manager
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Focus Queue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Drag to reorder your cards. Click "Enter Focus" on any card to start working on it.
          </p>
        </motion.div>

        {queuedCards.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Icons.Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Cards in Queue
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create some cards to start focusing on your projects.
            </p>
            <AccessibleButton variant="primary" ariaLabel="Create your first focus card">
              Create Your First Card
            </AccessibleButton>
          </GlassCard>
        ) : (
          <>
            {/* Card Queue */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={queuedCards.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  <AnimatePresence>
                    {queuedCards.map((card, index) => (
                      <SortableCard
                        key={card.id}
                        card={card}
                        isActive={card.status === 'active'}
                        isNext={index === 0 && card.status !== 'active'}
                        onEnterFocus={() => handleEnterFocus(card)}
                        onPauseCard={() => handlePauseCard(card)}
                        onActivateCard={() => handleActivateCard(card)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>

            {/* Stats and Quick Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {queuedCards.filter(c => c.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </GlassCard>
              
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {queuedCards.filter(c => c.status === 'queued').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Queued</div>
              </GlassCard>
              
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {queuedCards.filter(c => c.status === 'on-hold').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On Hold</div>
              </GlassCard>
            </motion.div>

            {/* Where Left Off Notes */}
            {Object.keys(whereLeftOff).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Notes
                </h3>
                <div className="space-y-2">
                  {Object.entries(whereLeftOff).map(([cardId, note]) => {
                    const card = cards.find(c => c.id === cardId);
                    if (!card) return null;
                    return (
                      <div key={cardId} className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {card.title}:
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          {note}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};