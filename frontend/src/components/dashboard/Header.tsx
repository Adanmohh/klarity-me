import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { CreateCardModal } from '../cards/CreateCardModal';

interface HeaderProps {
  user: User | null;
  arrangeMode: boolean;
  onToggleArrangeMode: () => void;
  onCreateCard: (title: string, description?: string) => Promise<void>;
  hasCards: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  arrangeMode,
  onToggleArrangeMode,
  onCreateCard,
  hasCards
}) => {
  const { clearAuth } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <h1 className="text-2xl font-bold text-primary-black">
                Focus Cards
              </h1>
              {user && (
                <span className="text-gray-600">
                  Welcome, {user.full_name || user.email}
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(true)}
              >
                + New Card
              </Button>
              
              {hasCards && useAppStore.getState().currentArea === 'focus' && (
                <Button
                  variant={arrangeMode ? "gold" : "ghost"}
                  onClick={onToggleArrangeMode}
                >
                  {arrangeMode ? "Exit Arrange" : "Arrange Cards"}
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateCard}
      />
    </>
  );
};