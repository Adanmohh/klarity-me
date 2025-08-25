import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Particles } from '../ui/Particles';
import { MagicCard } from '../ui/MagicCard';

interface ExtractedTask {
  title: string;
  context: string;
  category: string;
  time_estimate: number;
  confidence: number;
  suggested_time: string;
  motivation: string;
}

interface JournalResponse {
  success: boolean;
  tasks: ExtractedTask[];
  briefing: string;
  themes: string[];
  emotional_analysis: {
    anxiety_level: number;
    excitement_level: number;
    urgency_markers: string[];
  };
  processed_at: string;
}

export const DreamJournalView: React.FC = () => {
  const [journalText, setJournalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<JournalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'results'>('write');
  const [connectionError, setConnectionError] = useState(false);

  const processJournal = async () => {
    if (!journalText.trim()) {
      setError('Please enter your thoughts first');
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionError(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('http://localhost:8080/api/v1/ai/dream-journal/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journal_text: journalText,
          generate_audio: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Dream Journal API endpoint not found. Please ensure the backend is running.');
        }
        throw new Error(`Failed to process journal (${res.status})`);
      }

      const data = await res.json();
      setResponse(data);
      setActiveTab('results');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (err.message.includes('fetch')) {
        setConnectionError(true);
        setError('Cannot connect to the server. Please ensure the backend is running on port 8080.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSampleEntry = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/ai/dream-journal/sample');
      const data = await res.json();
      if (data.samples && data.samples.length > 0) {
        // Pick a random sample
        const randomSample = data.samples[Math.floor(Math.random() * data.samples.length)];
        setJournalText(randomSample.text);
      }
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  };

  const getEmotionColor = (level: number) => {
    if (level > 0.7) return 'text-red-500';
    if (level > 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="relative p-8 space-y-6 animate-fadeIn">
      {/* Animated particles background */}
      <Particles 
        className="absolute inset-0" 
        quantity={50} 
        color="#9333EA" 
        size={0.8}
        staticity={60}
      />
      {/* Connection Error Banner */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-600 font-medium">Connection Error</p>
              <p className="text-red-500 text-sm mt-1">
                Unable to connect to the backend server. Make sure it's running on port 8080.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('write')}
          className={`px-6 py-3 rounded-xl font-medium transition-all backdrop-blur-md border ${
            activeTab === 'write'
              ? 'bg-primary-gold text-primary-black border-primary-gold shadow-lg shadow-primary-gold/20'
              : 'bg-white/10 text-gray-600 hover:bg-white/20 border-white/10 hover:border-primary-gold/30'
          }`}
        >
          Write Journal
        </motion.button>
        <motion.button
          whileHover={{ scale: response ? 1.02 : 1 }}
          whileTap={{ scale: response ? 0.98 : 1 }}
          onClick={() => setActiveTab('results')}
          className={`px-6 py-3 rounded-xl font-medium transition-all backdrop-blur-md border ${
            activeTab === 'results'
              ? 'bg-primary-gold text-primary-black border-primary-gold shadow-lg shadow-primary-gold/20'
              : 'bg-white/10 text-gray-600 hover:bg-white/20 border-white/10 hover:border-primary-gold/30'
          } ${
            !response ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!response}
        >
          Results {response && `(${response.tasks.length})`}
        </motion.button>
      </div>

      {/* Write Tab */}
      {activeTab === 'write' && (
        <GlassCard className="p-8" variant="default" animate={false}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Morning Thoughts</h2>
              <button
                onClick={loadSampleEntry}
                className="text-sm text-primary-gold hover:underline focus:outline-none focus:ring-2 focus:ring-primary-gold/50 rounded px-2 py-1"
                aria-label="Load a sample journal entry"
              >
                Load Sample Entry
              </button>
            </div>

            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write your morning thoughts, dreams, worries, or ideas here... The AI will extract actionable tasks and provide insights."
              className="w-full h-64 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 resize-none transition-all duration-200 text-gray-800 placeholder-gray-400"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              aria-label="Journal entry text area"
              aria-describedby="journal-helper-text"
            />

            <div className="flex justify-between items-center">
              <span id="journal-helper-text" className="text-sm text-gray-500">
                {journalText.length} characters
              </span>
              <div className="space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setJournalText('');
                    setResponse(null);
                  }}
                  disabled={!journalText || loading}
                >
                  Clear
                </Button>
                <Button
                  onClick={processJournal}
                  disabled={loading || !journalText.trim()}
                  className="min-w-[120px]"
                  aria-label="Process journal entry"
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Process Journal'
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Briefing */}
          <GlassCard className="p-8" variant="default" animate={false}>
            <h2 className="text-xl font-semibold mb-4">Morning Briefing</h2>
            <p className="text-gray-600 whitespace-pre-line">{response.briefing}</p>
            
            {/* Emotional Analysis */}
            <div className="mt-6 p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <h3 className="text-sm font-medium mb-2">Emotional State</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Anxiety Level</span>
                  <span className={`text-sm font-medium ${getEmotionColor(response.emotional_analysis.anxiety_level)}`}>
                    {Math.round(response.emotional_analysis.anxiety_level * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Excitement Level</span>
                  <span className="text-sm font-medium text-green-500">
                    {Math.round(response.emotional_analysis.excitement_level * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Themes</h3>
              <div className="flex flex-wrap gap-2">
                {response.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-gold/20 text-primary-gold rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Extracted Tasks */}
          <GlassCard className="p-8" variant="default" animate={false}>
            <h2 className="text-xl font-semibold mb-4">
              Extracted Tasks ({response.tasks.length})
            </h2>
            <div className="space-y-4">
              {response.tasks.map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MagicCard 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary-gold/50 hover:shadow-lg hover:shadow-primary-gold/10 transition-all duration-300"
                    gradientColor="#9333EA"
                    gradientOpacity={0.15}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <span className="text-xs px-2 py-1 bg-primary-gold/20 text-primary-gold rounded">
                          {task.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{task.context}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-500">
                            ⏱️ {task.time_estimate} min
                          </span>
                          <span className="text-gray-500">
                            📊 {Math.round(task.confidence * 100)}% confidence
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            // TODO: Add task to daily tasks
                            console.log('Add to tasks:', task);
                          }}
                        >
                          Add to Tasks
                        </Button>
                      </div>
                      
                      {task.suggested_time && (
                        <div className="mt-3 p-2 bg-green-500/10 rounded text-sm text-green-500">
                          💡 {task.suggested_time}
                        </div>
                      )}
                      
                      {task.motivation && (
                        <div className="mt-2 text-sm text-primary-gold italic">
                          ✨ {task.motivation}
                        </div>
                      )}
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Process New Entry Button */}
          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => {
                setActiveTab('write');
                setJournalText('');
                setResponse(null);
              }}
            >
              Process Another Entry
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};