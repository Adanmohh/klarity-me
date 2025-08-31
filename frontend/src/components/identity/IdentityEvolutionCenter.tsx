import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Sparkles, ChevronRight, MessageCircle } from 'lucide-react';
import { api } from '../../services/api';
import HabitTracker from './HabitTracker';
import MentalTraining from './MentalTraining';
import DailyWisdom from './DailyWisdom';
import AICoach from './AICoach';
import { IdentityQuality } from '../../types/identity';

const IdentityEvolutionCenter: React.FC = () => {
  const [qualities, setQualities] = useState<IdentityQuality[]>([]);
  const [growthEdge, setGrowthEdge] = useState<string>('Discipline');
  const [activeSection, setActiveSection] = useState<'habits' | 'mental' | 'wisdom' | 'aicoach'>('habits');
  const [todayStats, setTodayStats] = useState({
    habitsCompleted: 0,
    mentalSessions: 0,
    wisdomRead: false
  });

  // Use a proper UUID for dev mode
  const userId = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    loadIdentityData();
  }, []);

  const loadIdentityData = async () => {
    try {
      const [qualitiesRes, growthRes] = await Promise.all([
        api.get(`/identity-evolution/qualities?user_id=${userId}`),
        api.get(`/identity-evolution/growth-edge?user_id=${userId}`)
      ]);

      setQualities(qualitiesRes.data);
      if (growthRes.data?.quality_name) {
        setGrowthEdge(growthRes.data.quality_name);
      }
    } catch (error) {
      console.error('Failed to load identity data:', error);
    }
  };

  const handleHabitComplete = async (habitId: number, qualityName: string) => {
    // Record evidence for the quality
    try {
      await api.post(`/identity-evolution/evidence?user_id=${userId}`, {
        quality_id: findOrCreateQuality(qualityName),
        evidence_type: 'habit',
        action: 'Completed habit',
        description: `Completed daily habit for ${qualityName}`,
        impact_score: 2.0
      });
      
      setTodayStats(prev => ({ ...prev, habitsCompleted: prev.habitsCompleted + 1 }));
      loadIdentityData();
    } catch (error) {
      console.error('Failed to record habit evidence:', error);
    }
  };

  const handleMentalSessionComplete = async (type: string, duration: number) => {
    // Record mental training as evidence
    try {
      await api.post(`/identity-evolution/evidence?user_id=${userId}`, {
        quality_id: findOrCreateQuality('Mental Strength'),
        evidence_type: 'training',
        action: `${type} session`,
        description: `Completed ${duration} minute ${type} session`,
        impact_score: duration / 5 // 5 min = 1 point, 10 min = 2 points, etc.
      });
      
      setTodayStats(prev => ({ ...prev, mentalSessions: prev.mentalSessions + 1 }));
      loadIdentityData();
    } catch (error) {
      console.error('Failed to record mental training:', error);
    }
  };

  const findOrCreateQuality = (qualityName: string): number => {
    const existing = qualities.find(q => q.quality_name === qualityName);
    if (existing) return existing.id;
    
    // Create quality if it doesn't exist
    api.post(`/identity-evolution/qualities?user_id=${userId}`, {
      quality_name: qualityName,
      category: 'character'
    }).then(() => loadIdentityData());
    
    return 1; // Temporary ID
  };

  const sections = [
    { id: 'habits', label: 'Daily Habits', icon: CheckCircle },
    { id: 'mental', label: 'Mental Training', icon: Brain },
    { id: 'wisdom', label: 'Daily Wisdom', icon: Sparkles },
    { id: 'aicoach', label: 'AI Coach', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simplified Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Identity Evolution</h1>
                  <p className="text-sm text-gray-600">Transform through daily practice</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{todayStats.habitsCompleted}</p>
                  <p className="text-gray-500">Habits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">{todayStats.mentalSessions}</p>
                  <p className="text-gray-500">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-700">
                    Focus: <span className="text-purple-600">{growthEdge}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-white border border-purple-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'habits' && (
            <HabitTracker 
              userId={userId}
              onHabitComplete={handleHabitComplete}
            />
          )}
          
          {activeSection === 'mental' && (
            <MentalTraining 
              onSessionComplete={handleMentalSessionComplete}
            />
          )}
          
          {activeSection === 'wisdom' && (
            <DailyWisdom 
              growthEdge={growthEdge}
            />
          )}
          
          {activeSection === 'aicoach' && (
            <AICoach 
              userId={userId}
            />
          )}
        </motion.div>

        {/* Quick Tip Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Daily Routine</p>
              <p className="text-xs text-gray-600">
                Complete habits → Do mental training → Read wisdom → Transform your identity
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IdentityEvolutionCenter;