import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';
import { theme } from '../../styles/theme';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const MindJournalView: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [newTags, setNewTags] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const moods = [
    { icon: Icons.Smile, label: 'Happy', color: 'text-green-500' },
    { icon: Icons.Meh, label: 'Neutral', color: 'text-blue-500' },
    { icon: Icons.Frown, label: 'Sad', color: 'text-purple-500' },
    { icon: Icons.Zap, label: 'Energetic', color: 'text-yellow-500' },
    { icon: Icons.Heart, label: 'Grateful', color: 'text-red-500' },
  ];

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryTitle.trim() || !newEntryContent.trim()) return;

    setLoading(true);
    try {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: newEntryTitle.trim(),
        content: newEntryContent.trim(),
        mood: selectedMood,
        tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setEntries([newEntry, ...entries]);
      setNewEntryTitle('');
      setNewEntryContent('');
      setSelectedMood('');
      setNewTags('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
  };

  const EntryCard = React.forwardRef<HTMLDivElement, { entry: JournalEntry }>(({ entry }, ref) => {
    const mood = moods.find(m => m.label === entry.mood);
    const MoodIcon = mood?.icon || Icons.Circle;
    
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "group relative bg-white rounded-xl p-4 cursor-pointer",
          "border-2 transition-all duration-200",
          selectedEntry?.id === entry.id 
            ? "border-indigo-400 shadow-lg" 
            : "border-gray-200 hover:border-indigo-300",
          "hover:shadow-lg"
        )}
        style={{
          boxShadow: selectedEntry?.id === entry.id ? theme.shadows.lg : theme.shadows.md,
        }}
        onClick={() => setSelectedEntry(entry)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {mood && (
                <MoodIcon className={cn("w-5 h-5", mood.color)} />
              )}
              <h3 className="font-medium text-gray-800">{entry.title}</h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEntry(entry.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Icons.Trash className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/20 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mind Journal</h1>
            <p className="text-gray-600">Capture your thoughts, feelings, and reflections</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ boxShadow: theme.shadows.lg }}
          >
            <Icons.Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ boxShadow: theme.shadows.xl }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">New Journal Entry</h3>
              <form onSubmit={handleCreateEntry}>
                <input
                  type="text"
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                  placeholder="Entry title..."
                  className="w-full px-3 py-2 mb-3 bg-white rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">How are you feeling?</label>
                  <div className="flex gap-2">
                    {moods.map((mood) => {
                      const MoodIcon = mood.icon;
                      return (
                        <button
                          key={mood.label}
                          type="button"
                          onClick={() => setSelectedMood(mood.label)}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all",
                            selectedMood === mood.label
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          )}
                          title={mood.label}
                        >
                          <MoodIcon className={cn("w-5 h-5", mood.color)} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  className="w-full px-3 py-2 mb-3 bg-white rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  rows={8}
                />
                
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="w-full px-3 py-2 mb-4 bg-white rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !newEntryTitle.trim() || !newEntryContent.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Entry'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEntryTitle('');
                      setNewEntryContent('');
                      setSelectedMood('');
                      setNewTags('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entries List */}
        <div className="lg:col-span-1">
          <div 
            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
            style={{ boxShadow: theme.shadows.xl }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Icons.Book className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Recent Entries</h2>
              <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {entries.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {entries.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </AnimatePresence>
              
              {entries.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Icons.Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No journal entries yet</p>
                  <p className="text-sm mt-1">Start by creating your first entry</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entry Detail */}
        <div className="lg:col-span-2">
          <div 
            className="bg-white rounded-2xl border-2 border-purple-200 p-6 h-full"
            style={{ boxShadow: theme.shadows.xl }}
          >
            {selectedEntry ? (
              <>
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEntry.title}</h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {selectedEntry.mood && (
                          <span className="flex items-center gap-1">
                            {(() => {
                              const mood = moods.find(m => m.label === selectedEntry.mood);
                              const MoodIcon = mood?.icon || Icons.Circle;
                              return <MoodIcon className={cn("w-4 h-4", mood?.color)} />;
                            })()}
                            {selectedEntry.mood}
                          </span>
                        )}
                        <span>{new Date(selectedEntry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-gray max-w-none mb-6">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedEntry.content}</p>
                </div>
                
                {selectedEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Icons.FileText className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">Select an entry to view</p>
                <p className="text-sm mt-1">Click on any journal entry to read it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};