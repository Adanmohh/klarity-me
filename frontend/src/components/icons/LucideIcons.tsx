import React from 'react';
import {
  Home,
  Zap,
  CheckSquare,
  Moon,
  BarChart3,
  Archive,
  Settings,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  RefreshCw,
  ArrowLeftRight,
  Search,
  Command,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Tag,
  Filter,
  MoreVertical,
  Menu,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Sparkles,
  Target,
  Layers,
  BookOpen,
  Coffee,
  Star,
  Heart,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  type LucideProps
} from 'lucide-react';

// Re-export commonly used icons with consistent sizing
export const Icons = {
  // Navigation
  Home: (props: LucideProps) => <Home size={24} {...props} />,
  Focus: (props: LucideProps) => <Zap size={24} {...props} />,
  Daily: (props: LucideProps) => <CheckSquare size={24} {...props} />,
  Dreams: (props: LucideProps) => <Moon size={24} {...props} />,
  Analytics: (props: LucideProps) => <BarChart3 size={24} {...props} />,
  Archive: (props: LucideProps) => <Archive size={20} {...props} />,
  Settings: (props: LucideProps) => <Settings size={20} {...props} />,
  
  // Actions
  Add: (props: LucideProps) => <Plus size={20} {...props} />,
  Edit: (props: LucideProps) => <Edit3 size={16} {...props} />,
  Delete: (props: LucideProps) => <Trash2 size={16} {...props} />,
  Close: (props: LucideProps) => <X size={20} {...props} />,
  Check: (props: LucideProps) => <Check size={20} {...props} />,
  Refresh: (props: LucideProps) => <RefreshCw size={18} {...props} />,
  Move: (props: LucideProps) => <ArrowLeftRight size={18} {...props} />,
  Search: (props: LucideProps) => <Search size={20} {...props} />,
  Command: (props: LucideProps) => <Command size={16} {...props} />,
  
  // UI Elements
  ChevronRight: (props: LucideProps) => <ChevronRight size={16} {...props} />,
  ChevronDown: (props: LucideProps) => <ChevronDown size={16} {...props} />,
  Calendar: (props: LucideProps) => <Calendar size={16} {...props} />,
  Clock: (props: LucideProps) => <Clock size={16} {...props} />,
  Tag: (props: LucideProps) => <Tag size={16} {...props} />,
  Filter: (props: LucideProps) => <Filter size={18} {...props} />,
  More: (props: LucideProps) => <MoreVertical size={18} {...props} />,
  Menu: (props: LucideProps) => <Menu size={20} {...props} />,
  
  // User
  User: (props: LucideProps) => <User size={20} {...props} />,
  LogOut: (props: LucideProps) => <LogOut size={18} {...props} />,
  Bell: (props: LucideProps) => <Bell size={18} {...props} />,
  Help: (props: LucideProps) => <HelpCircle size={18} {...props} />,
  
  // Features
  Sparkles: (props: LucideProps) => <Sparkles size={18} {...props} />,
  Target: (props: LucideProps) => <Target size={18} {...props} />,
  Layers: (props: LucideProps) => <Layers size={18} {...props} />,
  Book: (props: LucideProps) => <BookOpen size={18} {...props} />,
  Coffee: (props: LucideProps) => <Coffee size={18} {...props} />,
  
  // Status
  Star: (props: LucideProps) => <Star size={18} {...props} />,
  Heart: (props: LucideProps) => <Heart size={18} {...props} />,
  TrendingUp: (props: LucideProps) => <TrendingUp size={18} {...props} />,
  
  // Alerts
  AlertCircle: (props: LucideProps) => <AlertCircle size={18} {...props} />,
  AlertTriangle: (props: LucideProps) => <AlertTriangle size={18} {...props} />,
  Info: (props: LucideProps) => <Info size={18} {...props} />,
  Success: (props: LucideProps) => <CheckCircle size={18} {...props} />,
  Error: (props: LucideProps) => <XCircle size={18} {...props} />,
};

// Export type for icon names
export type IconName = keyof typeof Icons;