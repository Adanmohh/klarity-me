# TODO System Overview

## Core Purpose
A simple, practical system for:
- **Habit Building** - Click-to-complete daily habits with automated check-ins
- **Mental Training** - Subconscious mind programming through visualization and affirmations
- **Daily Wisdom** - Mantras, quotes, hadith, and Quranic verses for mental reprogramming
- **Task Management** - Focus area with cards and daily tasks

## Current Architecture

### Frontend (React + TypeScript)
- **Focus Area** - Card-based task management system
- **Daily Tasks** - Simple daily task tracking with streaks
- **Identity Evolution Center** - Main hub with 3 tabs:
  - Habit Tracker (5 default habits for subconscious programming)
  - Mental Training (Mental Movie, Scientific Prayer, Sleep Programming)
  - Daily Wisdom (Time-based mantras, quotes, verses)
- **Manifestation Journal** - Track visualizations and manifestations
- **Power Statements** - Personal affirmations that appear throughout the system
- **Archive** - Completed tasks storage

### Backend (FastAPI + Python)
- In-memory DEV_STORE for development
- Supabase integration ready (tables created)
- RAG infrastructure for future AI features

## Key Features

### 1. Subconscious Programming (Murphy's Principles)
Integrated without explicit naming:
- Mental Movie technique for visualization
- Scientific Prayer for affirmations
- Sleep Programming for subconscious work
- Power Statements appearing in Daily Wisdom
- Time-based mantras (morning/afternoon/evening)

### 2. Simple Habit System
- 5 core habits focused on mental power
- Click to complete
- Visual progress tracking
- Automated reminders possible

### 3. Task Management
- Focus Area with cards
- Daily tasks with descriptions
- Archive for completed items
- Clean, minimal interface

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python, Supabase (ready)
- **State**: Zustand for local state, localStorage for persistence
- **Icons**: Lucide React

## Recent Changes
- Removed old complex habits system
- Transformed Mind Journal → Manifestation Journal
- Transformed Identity Settings → Power Statements
- Integrated Murphy's techniques throughout
- Connected Power Statements to Daily Wisdom
- Simplified navigation structure

## Future Considerations
- Supabase integration for data persistence
- Mobile app version
- Advanced RAG features for personalized guidance
- Automated habit check-ins
- Analytics and progress tracking