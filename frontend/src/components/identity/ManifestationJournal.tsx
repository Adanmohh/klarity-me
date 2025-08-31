import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, TrendingUp, Calendar, Star, CheckCircle, Eye, Heart, DollarSign, Brain } from 'lucide-react';

interface ManifestationEntry {
  id: string;
  type: 'visualization' | 'manifestation' | 'synchronicity' | 'gratitude';
  title: string;
  description: string;
  visualizedDate?: Date;
  manifestedDate?: Date;
  status: 'visualizing' | 'in-progress' | 'manifested';
  category: string;
  tags: string[];
  createdAt: Date;
}

const ManifestationJournal: React.FC = () => {
  const [entries, setEntries] = useState<ManifestationEntry[]>([
    {
      id: '1',
      type: 'manifestation',
      title: 'New Client Opportunity',
      description: 'Visualized getting a call from a potential client. Today they reached out unexpectedly!',
      visualizedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      manifestedDate: new Date(),
      status: 'manifested',
      category: 'wealth',
      tags: ['business', 'success'],
      createdAt: new Date()
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'visualization' | 'manifestation' | 'synchronicity' | 'gratitude'>('visualization');
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    category: 'wealth',
    tags: ''
  });

  const entryTypes = [
    { id: 'visualization', label: 'New Visualization', icon: Eye, color: 'from-blue-500 to-purple-500' },
    { id: 'manifestation', label: 'Manifestation!', icon: Sparkles, color: 'from-green-500 to-emerald-500' },
    { id: 'synchronicity', label: 'Synchronicity', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { id: 'gratitude', label: 'Gratitude', icon: Heart, color: 'from-pink-500 to-red-500' }
  ];

  const categories = [
    { id: 'wealth', label: 'Wealth & Abundance', icon: DollarSign },
    { id: 'health', label: 'Health & Vitality', icon: Heart },
    { id: 'relationships', label: 'Love & Relationships', icon: Heart },
    { id: 'success', label: 'Success & Achievement', icon: TrendingUp },
    { id: 'spiritual', label: 'Spiritual Growth', icon: Brain }
  ];

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.description) return;

    const entry: ManifestationEntry = {
      id: Date.now().toString(),
      type: selectedType,
      title: newEntry.title,
      description: newEntry.description,
      visualizedDate: selectedType === 'visualization' ? new Date() : undefined,
      manifestedDate: selectedType === 'manifestation' ? new Date() : undefined,
      status: selectedType === 'visualization' ? 'visualizing' : 
              selectedType === 'manifestation' ? 'manifested' : 'in-progress',
      category: newEntry.category,
      tags: newEntry.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date()
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: '', description: '', category: 'wealth', tags: '' });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'visualizing': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'manifested': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = entryTypes.find(t => t.id === type);
    return typeConfig?.icon || Eye;
  };

  const manifestedCount = entries.filter(e => e.status === 'manifested').length;
  const visualizingCount = entries.filter(e => e.status === 'visualizing').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Manifestation Journal</h1>
                  <p className="text-gray-600">Track your visualizations and watch them manifest</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{manifestedCount}</p>
                  <p className="text-sm text-gray-500">Manifested</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{visualizingCount}</p>
                  <p className="text-sm text-gray-500">Visualizing</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {entryTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id as any);
                  setShowAddForm(true);
                }}
                className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-purple-100 hover:border-purple-300 transition-all flex items-center gap-2"
              >
                <div className={`p-2 bg-gradient-to-r ${type.color} rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add Entry Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add {entryTypes.find(t => t.id === selectedType)?.label}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title your experience..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <textarea
                  placeholder={
                    selectedType === 'visualization' 
                      ? "Describe what you're visualizing in detail. Feel it as real..."
                      : selectedType === 'manifestation'
                      ? "Describe how your visualization manifested into reality..."
                      : selectedType === 'synchronicity'
                      ? "Describe the meaningful coincidence that occurred..."
                      : "Express your gratitude and appreciation..."
                  }
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAddEntry}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Add Entry
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const Icon = getTypeIcon(entry.type);
            const typeConfig = entryTypes.find(t => t.id === entry.type);
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-purple-100 hover:border-purple-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-gradient-to-r ${typeConfig?.color} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{entry.title}</h3>
                      <p className="text-gray-600 mt-1">{entry.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {entry.status === 'visualizing' ? 'Visualizing' : 
                           entry.status === 'manifested' ? 'Manifested!' : 
                           'In Progress'}
                        </span>
                        
                        {entry.visualizedDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Visualized: {entry.visualizedDate.toLocaleDateString()}
                          </span>
                        )}
                        
                        {entry.manifestedDate && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Manifested: {entry.manifestedDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {entry.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {entry.status === 'visualizing' && (
                    <button
                      onClick={() => {
                        const updatedEntry = { ...entry, status: 'manifested' as const, manifestedDate: new Date() };
                        setEntries(entries.map(e => e.id === entry.id ? updatedEntry : e));
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm hover:shadow-lg transition-shadow"
                    >
                      Mark Manifested
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Start tracking your manifestations</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Add Your First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManifestationJournal;