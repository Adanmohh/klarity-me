import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-gray-600">Track your progress and insights</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-100">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Analytics Coming Soon</h2>
          <p className="text-gray-500">
            Advanced analytics and insights will be available here to track your habits, mental training, and overall progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;