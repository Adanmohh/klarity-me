import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Zap, Save, Edit2, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { powerStatementsService, type PowerStatement } from '../../services/powerStatementsService';

const PowerStatements: React.FC = () => {
  const [statements, setStatements] = useState<PowerStatement[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatement, setNewStatement] = useState({
    text: '',
    category: 'success' as const
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadStatements = () => {
      const loaded = powerStatementsService.getStatements();
      setStatements(loaded);
    };
    loadStatements();
  }, []);

  const categories = [
    { id: 'wealth', label: 'Wealth & Abundance', icon: '💰', color: 'from-green-500 to-emerald-500' },
    { id: 'health', label: 'Health & Vitality', icon: '❤️', color: 'from-pink-500 to-red-500' },
    { id: 'success', label: 'Success & Achievement', icon: '🏆', color: 'from-blue-500 to-purple-500' },
    { id: 'relationships', label: 'Love & Relationships', icon: '💕', color: 'from-pink-500 to-purple-500' },
    { id: 'spiritual', label: 'Spiritual Power', icon: '✨', color: 'from-purple-500 to-pink-500' }
  ];

  const suggestedStatements = [
    "I am a money magnet. Money comes to me easily and frequently",
    "My body is a temple of health and vitality",
    "Success is my birthright. I claim it now",
    "I radiate love and it returns to me multiplied",
    "My subconscious mind is my partner in success",
    "I sleep in peace and wake in joy",
    "Everything is working for my highest good",
    "I am completely adequate for all situations",
    "Wealth is mine, health is mine, success is mine now",
    "I am divinely guided and protected at all times"
  ];

  const handleAddStatement = () => {
    if (!newStatement.text.trim()) return;
    if (statements.length >= 10) {
      alert('Maximum 10 power statements allowed for optimal focus');
      return;
    }

    const categoryConfig = categories.find(c => c.id === newStatement.category);
    const statement = powerStatementsService.addStatement({
      text: newStatement.text.trim(),
      category: newStatement.category,
      color: categoryConfig?.color || 'from-purple-500 to-pink-500',
      active: true
    });

    setStatements([...statements, statement]);
    setNewStatement({ text: '', category: 'success' });
    setShowAddForm(false);
  };

  const handleEdit = (id: string) => {
    if (!editText.trim()) return;
    powerStatementsService.updateStatement(id, { text: editText.trim() });
    setStatements(statements.map(s => 
      s.id === id ? { ...s, text: editText.trim() } : s
    ));
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id: string) => {
    powerStatementsService.deleteStatement(id);
    setStatements(statements.filter(s => s.id !== id));
  };

  const toggleActive = (id: string) => {
    powerStatementsService.toggleActive(id);
    setStatements(statements.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCount = statements.filter(s => s.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/20 p-6">
      <div className="max-w-4xl mx-auto">
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
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Power Statements</h1>
                  <p className="text-gray-600">Your core affirmations for subconscious programming</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{activeCount}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-800">How Power Statements Work</p>
              <p className="text-xs text-gray-600 mt-1">
                These statements appear throughout your day in Daily Wisdom, are used in Mental Training sessions, 
                and program your subconscious mind through repetition with feeling. Keep them in present tense and positive.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statements List */}
        <div className="space-y-3 mb-6">
          {statements.map((statement, index) => {
            const categoryConfig = categories.find(c => c.id === statement.category);
            
            return (
              <motion.div
                key={statement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 border ${
                  statement.active ? 'border-purple-200' : 'border-gray-200 opacity-60'
                }`}
              >
                {editingId === statement.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEdit(statement.id)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{categoryConfig?.icon}</span>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {categoryConfig?.label}
                        </span>
                        {!statement.active && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className={`text-lg font-medium ${
                        statement.active ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        "{statement.text}"
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => copyToClipboard(statement.text, statement.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedId === statement.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(statement.id);
                          setEditText(statement.text);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => toggleActive(statement.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Zap className={`w-4 h-4 ${
                          statement.active ? 'text-yellow-500' : 'text-gray-400'
                        }`} />
                      </button>
                      <button
                        onClick={() => handleDelete(statement.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Add Statement Form */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={statements.length >= 10}
            className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Power Statement
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-purple-200"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Create New Power Statement</h3>
            
            <div className="space-y-3">
              <textarea
                placeholder="Enter your power statement (present tense, positive, personal)..."
                value={newStatement.text}
                onChange={(e) => setNewStatement({ ...newStatement, text: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <select
                value={newStatement.category}
                onChange={(e) => setNewStatement({ ...newStatement, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={handleAddStatement}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  Create Statement
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStatement({ text: '', category: 'success' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            {/* Suggestions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Need inspiration? Try these:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedStatements.slice(0, 3).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setNewStatement({ ...newStatement, text: suggestion })}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {suggestion.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PowerStatements;