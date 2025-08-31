/**
 * AI Coach Interface Component
 * Provides chat interface and personalized guidance for mental training
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { aiGuidanceService } from '../../services/aiGuidanceService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionableSteps?: string[];
  followUpSuggestions?: string[];
  sources?: Array<{ title: string; author: string; source: string }>;
  confidence?: number;
}

interface DailyInsight {
  guidance_text: string;
  actionable_steps: string[];
  follow_up_suggestions: string[];
  confidence: number;
  personalization_score: number;
}

interface DailyInsights {
  daily_wisdom: DailyInsight;
  habit_optimization: DailyInsight;
  pattern_analysis: DailyInsight;
}

interface GuidanceType {
  value: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const guidanceTypes: GuidanceType[] = [
  {
    value: 'daily_wisdom',
    name: 'Daily Wisdom',
    description: 'Inspirational guidance for today',
    icon: Lightbulb
  },
  {
    value: 'habit_optimization',
    name: 'Habit Optimization', 
    description: 'Improve your current habits',
    icon: Target
  },
  {
    value: 'success_prediction',
    name: 'Success Analysis',
    description: 'Analyze your success patterns',
    icon: TrendingUp
  },
  {
    value: 'custom_affirmation',
    name: 'Custom Affirmations',
    description: 'Personalized affirmations',
    icon: Star
  },
  {
    value: 'manifestation_insight',
    name: 'Manifestation Insights',
    description: 'Improve your manifestation practice',
    icon: Sparkles
  }
];

interface AICoachProps {
  userId: string;
  className?: string;
}

export const AICoach: React.FC<AICoachProps> = ({ userId, className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyInsights, setDailyInsights] = useState<DailyInsights | null>(null);
  const [selectedGuidanceType, setSelectedGuidanceType] = useState<string>('daily_wisdom');
  const [showInsights, setShowInsights] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize AI Coach and load daily insights
  useEffect(() => {
    const initializeCoach = async () => {
      try {
        setIsLoading(true);
        
        // Check if service is healthy and initialize if needed
        await aiGuidanceService.initializeKnowledgeBase();
        
        // Load daily insights
        const insights = await aiGuidanceService.getDailyInsights(userId);
        setDailyInsights(insights);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `Hello! I'm your AI Coach, combining wisdom from Napoleon Hill, Joseph Murphy, and Al-Ghazali. I'm here to provide personalized guidance for your mental training and subconscious programming journey. How can I help you today?`,
          timestamp: new Date().toISOString()
        };
        
        setMessages([welcomeMessage]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI Coach:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
          timestamp: new Date().toISOString()
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCoach();
  }, [userId]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiGuidanceService.chatWithCoach(userId, inputMessage, messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response.content,
        timestamp: response.response.timestamp,
        actionableSteps: response.actionable_steps,
        followUpSuggestions: response.follow_up_suggestions,
        sources: response.sources,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble processing your message. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpecificGuidance = async (guidanceType: string) => {
    setIsLoading(true);
    try {
      const response = await aiGuidanceService.getPersonalizedGuidance(userId, guidanceType);
      
      const guidanceMessage: ChatMessage = {
        role: 'assistant',
        content: response.guidance,
        timestamp: new Date().toISOString(),
        actionableSteps: response.actionable_steps,
        followUpSuggestions: response.follow_up_suggestions,
        sources: response.sources,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, guidanceMessage]);
    } catch (error) {
      console.error('Failed to get guidance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const provideFeedback = async (messageIndex: number, isHelpful: boolean) => {
    try {
      await aiGuidanceService.provideFeedback(userId, isHelpful, isHelpful ? 5 : 2);
    } catch (error) {
      console.error('Failed to provide feedback:', error);
    }
  };

  return (
    <div className={`ai-coach-container ${className}`}>
      {/* Daily Insights Panel */}
      {dailyInsights && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Today's Personalized Insights
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInsights(!showInsights)}
              >
                {showInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(dailyInsights).map(([key, insight]) => (
                      <Card key={key} className="p-4">
                        <h4 className="font-semibold text-sm mb-2 capitalize">
                          {key.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {insight.guidance_text.substring(0, 120)}...
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.personalization_score * 100)}% personalized
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => getSpecificGuidance(key)}
                            className="text-xs"
                          >
                            Explore
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Guidance Type Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {guidanceTypes.map(type => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={selectedGuidanceType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedGuidanceType(type.value);
                    getSpecificGuidance(type.value);
                  }}
                  className="flex flex-col gap-1 h-auto p-3"
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{type.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            AI Coach Chat
          </CardTitle>
        </CardHeader>

        {/* Messages Container */}
        <CardContent className="flex-1 overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-full overflow-y-auto space-y-4 pr-2"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="prose prose-sm max-w-none">
                        {message.content}
                      </div>
                      
                      {/* Actionable Steps */}
                      {message.actionableSteps && message.actionableSteps.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="font-semibold text-sm mb-2">Action Steps:</h5>
                          <ul className="space-y-1">
                            {message.actionableSteps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-sm flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Follow-up Suggestions */}
                      {message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="font-semibold text-sm mb-2">Consider Exploring:</h5>
                          <div className="flex flex-wrap gap-1">
                            {message.followUpSuggestions.map((suggestion, sugIndex) => (
                              <Badge key={sugIndex} variant="secondary" className="text-xs">
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-6 px-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => provideFeedback(index, true)}
                              className="h-6 px-2 text-green-600"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => provideFeedback(index, false)}
                              className="h-6 px-2 text-red-600"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {message.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(message.confidence * 100)}% confident
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input Area */}
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              placeholder="Ask for guidance, share your goals, or discuss your challenges..."
              className="flex-1"
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading || !isInitialized}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim() || !isInitialized}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICoach;