import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sun, Moon, Star, RefreshCw, Heart, Copy, Check, Zap } from 'lucide-react';
import { powerStatementsService } from '../../services/powerStatementsService';

interface WisdomContent {
  morningMantra: string;
  dailyQuote: {
    text: string;
    author: string;
  };
  quranVerse: {
    text: string;
    reference: string;
  };
  hadith: {
    text: string;
    narrator: string;
  };
  affirmation: string;
  powerStatement?: string;
}

interface DailyWisdomProps {
  growthEdge?: string;
}

const DailyWisdom: React.FC<DailyWisdomProps> = ({ growthEdge = 'Discipline' }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date().getHours());
  const [userPowerStatement, setUserPowerStatement] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load a time-based power statement from user's collection
    const statement = powerStatementsService.getTimeBasedStatement();
    if (statement) {
      setUserPowerStatement(statement.text);
    }
  }, [refreshKey]);

  const refreshPowerStatement = () => {
    const statement = powerStatementsService.getRandomActiveStatement();
    if (statement) {
      setUserPowerStatement(statement.text);
    }
    setRefreshKey(prev => prev + 1);
  };

  // Powerful subconscious programming content
  const wisdomContent: WisdomContent = {
    morningMantra: currentTime < 12 
      ? `This is a wonderful day. I have never seen this day before. I am divinely guided all day long, and whatever I do will prosper.`
      : currentTime < 18
      ? `I am completely adequate for all situations. Infinite intelligence is within me, guiding me to perfect solutions.`
      : `I forgive everyone and I forgive myself. I sleep in peace and wake in joy. My tomorrow is secure.`,
    
    dailyQuote: (() => {
      const quotes = [
        {
          text: "Your subconscious mind is always working. Plant thoughts of peace, happiness, and prosperity, and you will reap accordingly.",
          author: "The Power of Mind"
        },
        {
          text: "Whatever you impress upon your subconscious mind will be expressed in your life.",
          author: "Universal Law"
        },
        {
          text: "The feeling of wealth produces wealth. The feeling of health produces health.",
          author: "Mental Science"
        },
        {
          text: "Your subconscious accepts what you feel to be true, not what you think intellectually.",
          author: "Mind Principles"
        },
        {
          text: "Busy your mind with concepts of harmony, health, peace, and good will, and wonders will happen.",
          author: "Subconscious Power"
        }
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    })(),
    
    quranVerse: {
      text: "Indeed, Allah will not change the condition of a people until they change what is in themselves.",
      reference: "Surah Ar-Ra'd (13:11)"
    },
    
    hadith: {
      text: "The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.",
      narrator: "Sahih Muslim"
    },
    
    affirmation: growthEdge === 'Discipline' 
      ? `Divine order is established in my mind and body. I move through this day with perfect discipline and ease.`
      : growthEdge === 'Focus'
      ? `My mind is a powerful instrument. I direct it with ease toward my highest good. Perfect concentration is mine.`
      : `I am whole, perfect, strong, powerful, loving, harmonious, and happy. ${growthEdge} flows through me abundantly.`
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const getTimeIcon = () => {
    if (currentTime >= 5 && currentTime < 12) return Sun;
    if (currentTime >= 12 && currentTime < 18) return Sun;
    return Moon;
  };

  const TimeIcon = getTimeIcon();

  return (
    <div className="space-y-4">
      {/* Time-based Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TimeIcon className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">
                {currentTime < 12 ? 'Morning' : currentTime < 18 ? 'Afternoon' : 'Evening'} Wisdom
              </h3>
              <p className="text-white/80 text-sm">Focusing on: {growthEdge}</p>
            </div>
          </div>
          <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Morning Mantra */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-purple-100"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">Today's Mantra</h4>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => toggleFavorite('mantra')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorites.includes('mantra') ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => copyToClipboard(wisdomContent.morningMantra, 'mantra')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied === 'mantra' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-700 italic leading-relaxed">
          "{wisdomContent.morningMantra}"
        </p>
      </motion.div>

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-purple-100"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">Wisdom Quote</h4>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => toggleFavorite('quote')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorites.includes('quote') ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => copyToClipboard(wisdomContent.dailyQuote.text, 'quote')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied === 'quote' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-700 mb-2 leading-relaxed">
          "{wisdomContent.dailyQuote.text}"
        </p>
        <p className="text-sm text-gray-500">— {wisdomContent.dailyQuote.author}</p>
      </motion.div>

      {/* Quran Verse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-5 border border-green-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">Quranic Wisdom</h4>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => toggleFavorite('quran')}
              className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorites.includes('quran') ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => copyToClipboard(wisdomContent.quranVerse.text, 'quran')}
              className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
            >
              {copied === 'quran' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-700 mb-2 leading-relaxed font-arabic">
          "{wisdomContent.quranVerse.text}"
        </p>
        <p className="text-sm text-gray-600">— {wisdomContent.quranVerse.reference}</p>
      </motion.div>

      {/* Hadith */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">Hadith</h4>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => toggleFavorite('hadith')}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorites.includes('hadith') ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => copyToClipboard(wisdomContent.hadith.text, 'hadith')}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
            >
              {copied === 'hadith' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-700 mb-2 leading-relaxed">
          "{wisdomContent.hadith.text}"
        </p>
        <p className="text-sm text-gray-600">— {wisdomContent.hadith.narrator}</p>
      </motion.div>

      {/* Personal Affirmation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5 text-white"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <h4 className="font-semibold">Your Affirmation</h4>
          </div>
          <button
            onClick={() => copyToClipboard(wisdomContent.affirmation, 'affirmation')}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {copied === 'affirmation' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          {wisdomContent.affirmation}
        </p>
      </motion.div>

      {/* User's Power Statement */}
      {userPowerStatement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <h4 className="font-semibold">Your Power Statement</h4>
            </div>
            <div className="flex gap-1">
              <button
                onClick={refreshPowerStatement}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Get another power statement"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => copyToClipboard(userPowerStatement, 'power-statement')}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {copied === 'power-statement' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-lg font-medium leading-relaxed italic">
            "{userPowerStatement}"
          </p>
          <p className="text-xs text-white/70 mt-2">
            From your personal Power Statements collection
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DailyWisdom;