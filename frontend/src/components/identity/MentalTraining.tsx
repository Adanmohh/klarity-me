import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Pause, RotateCcw, Eye, Heart, Zap, Volume2 } from 'lucide-react';
import { powerStatementsService } from '../../services/powerStatementsService';

interface MentalTrainingProps {
  onSessionComplete: (type: string, duration: number) => void;
}

const MentalTraining: React.FC<MentalTrainingProps> = ({ onSessionComplete }) => {
  const [selectedType, setSelectedType] = useState<'visualization' | 'affirmation' | 'meditation'>('visualization');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [selectedDuration, setSelectedDuration] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get user's power statements for affirmation session
  const userPowerStatements = powerStatementsService.getActiveStatements();
  const defaultAffirmations = [
    "I am whole, perfect, strong, powerful, loving, harmonious, and happy",
    "Infinite intelligence leads me and guides me in all my ways",
    "I am one with infinite abundance. Wealth flows to me freely and easily",
    "The healing power within me is now transforming every cell of my body",
    "Divine order is established in my mind, body, and affairs"
  ];
  
  // Use user's power statements if available, otherwise use defaults
  const affirmationPrompts = userPowerStatements.length > 0 
    ? userPowerStatements.map(s => s.text)
    : defaultAffirmations;

  const sessionTypes = {
    visualization: {
      icon: Eye,
      title: 'Mental Movie',
      description: 'Live your success in your mind',
      color: 'from-blue-500 to-purple-500',
      prompts: [
        "See yourself IN the scene of success, not watching from outside. Feel the emotions of achievement right now...",
        "You are already successful. Feel the joy, the gratitude, the satisfaction as if it's happening now...",
        "Create a short mental movie of your achievement. Add sounds, feelings, smells. Loop it with intense emotion...",
        "Picture yourself at the moment of triumph. How does it feel? Who is there? Make it vivid and real...",
        "Imagine waking up tomorrow with your goal achieved. Feel the relief, joy, and gratitude flooding through you..."
      ]
    },
    affirmation: {
      icon: Heart,
      title: 'Scientific Prayer',
      description: 'Plant seeds in your subconscious',
      color: 'from-pink-500 to-red-500',
      prompts: affirmationPrompts
    },
    meditation: {
      icon: Zap,
      title: 'Sleep Programming',
      description: 'Program your subconscious before sleep',
      color: 'from-green-500 to-teal-500',
      prompts: [
        "As you drift to sleep, repeat: 'I sleep in peace and wake in joy'...",
        "Your subconscious is working on perfect solutions while you rest...",
        "Repeat with feeling: 'Wealth is mine, health is mine, success is mine now'...",
        "Let this be your last thought: 'Everything is working for my highest good'...",
        "Feel deep gratitude as you fall asleep. Your subconscious multiplies what you appreciate..."
      ]
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            onSessionComplete(selectedType, selectedDuration);
            return selectedDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timeLeft, selectedType, selectedDuration, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setTimeLeft(selectedDuration * 60);
  };

  const changeDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsPlaying(false);
  };

  const currentSession = sessionTypes[selectedType];
  const Icon = currentSession.icon;
  const randomPrompt = currentSession.prompts[Math.floor(Math.random() * currentSession.prompts.length)];

  return (
    <div className="space-y-4">
      {/* Session Type Selector */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(sessionTypes).map(([type, config]) => {
          const TypeIcon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedType === type
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <TypeIcon className={`w-6 h-6 mx-auto mb-1 ${
                selectedType === type ? 'text-purple-600' : 'text-gray-600'
              }`} />
              <p className="text-xs font-medium text-gray-700">{config.title}</p>
            </button>
          );
        })}
      </div>

      {/* Main Training Area */}
      <motion.div
        key={selectedType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-gradient-to-br ${currentSession.color} p-8 rounded-2xl text-white relative overflow-hidden`}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 200 + 100,
                height: Math.random() * 200 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <Icon className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-2">{currentSession.title}</h3>
            <p className="text-white/80">{currentSession.description}</p>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2 font-mono">
              {formatTime(timeLeft)}
            </div>
            {isPlaying && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg italic"
              >
                "{randomPrompt}"
              </motion.p>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={togglePlay}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
            <button
              onClick={reset}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="w-8 h-8" />
            </button>
          </div>

          {/* Duration Selector */}
          <div className="flex justify-center gap-2">
            {[5, 10, 15].map(minutes => (
              <button
                key={minutes}
                onClick={() => changeDuration(minutes)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedDuration === minutes
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          Quick Tips
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Find a quiet, comfortable space</li>
          <li>• Close your eyes or soften your gaze</li>
          <li>• Breathe naturally and relax</li>
          <li>• Let the session guide you gently</li>
        </ul>
      </div>
    </div>
  );
};

export default MentalTraining;