# 🎯 Habit Building Feature - Identity & Habit System

## Overview
Two distinct but connected features:
1. **Identity Settings** - Static configuration of who you are becoming (affirmations)
2. **Habit Building System** - Dynamic tracking system with Becoming → I AM progression

## Feature 1: Identity Settings (App Configuration)

### Core Concept
Users define their identity in present tense, as if already achieved. These become daily mantras and reminders throughout their day.

### Configuration
- **3-5 Identity Statements** (optimal range for focus without overwhelm)
- Written in present tense: "I am..."
- Examples:
  - "I am a disciplined person"
  - "I am healthy and energetic"
  - "I am a creative problem solver"
  - "I am calm and mindful"
  - "I am a consistent learner"

### Mantra Display System
**Morning Ritual:**
- Display all statements as morning affirmations
- Beautiful typography with animations
- Swipeable cards or vertical list
- 5-minute morning review ritual

**Throughout Day:**
- Rotate one statement every 2-3 hours
- Subtle notification/widget
- Gentle reminder of identity

**Evening Review:**
- Quick review of all statements
- Reflection prompt
- Reinforce before sleep

### Visual Design
- Large, elegant typography
- Customizable backgrounds/colors per statement
- Subtle animations and transitions
- Calming, aspirational aesthetic

## Feature 2: Habit Building System

### Lane Structure (Right to Left Flow)

```
    [BECOMING] →→→→→→→→→→→→→ [I AM]
       (Right)              (Left)
    Active Habits      Established Identity
```

### Becoming Lane (Right Side)
**Purpose:** Where habits are actively being built
- New habits start here
- Dynamic, energetic visual design
- Progress indicators (Day 23/40)
- Pulsing or animated elements
- Focus of daily interaction

**Duration by Frequency:**
- Daily habits: 40 days
- 5-6x per week: 50 days
- 3-4x per week: 60 days
- Weekly: 90 days
- Monthly: 6 months

### I AM Lane (Left Side)
**Purpose:** Graduated habits that are now identity
- Completed habits move here
- Calm, established appearance
- Shows total days practiced (e.g., "147 days strong")
- Badges or icons instead of progress bars
- Listed in reverse chronological order (newest at top)
- Optional maintenance tracking

### Graduation Process
**Automatic Graduation:**
- Completes required days based on frequency
- Consistency above 80%

**Manual Graduation:**
- Available after minimum 21 days
- User decides habit is established
- Quick celebration moment

**Visual Transition:**
- Celebration animation
- Habit slides from right to left
- Brief acknowledgment screen
- Optional share moment

## Science-Based Missing Day Rules

### "Never Miss Twice" Principle (James Clear)
- **1 miss:** Normal, show encouragement
  - "Life happens! Get back tomorrow 💪"
  - No penalty
  
- **2 misses:** Critical intervention
  - Stronger reminder notification
  - Offer "tiny habit" option (minimum viable action)
  - "Just do 1 pushup" instead of full workout
  - Warning that streak is at risk
  
- **3+ misses:** Flexible recovery
  - Don't reset to Day 0 (demotivating)
  - Add 1 extra day for every 2 days missed
  - Keep showing "best streak" for motivation
  - Option to use "Grace Day" (1 per month)

## Connection Between Features

### Identity Evolution System

**When Habit Graduates to I AM:**
1. **Identity Statement Suggestion**
   - Habit: "Meditate 10 min daily" graduates
   - Suggests: "Add 'I am mindful and centered' to your identity?"
   - User can accept, modify, or skip

2. **Identity Strength Visualization**
   - Each identity statement shows "strength level"
   - More supporting habits = stronger identity
   - Visual: Glow intensity or progress meter
   - Example: "I am healthy" strengthens with each health habit

3. **Quarterly Identity Review**
   - Every 3 months: identity evolution checkpoint
   - Review I AM habits vs Identity Statements
   - Suggest updates based on transformation
   - Archive outdated identities
   - Celebrate growth

4. **Visual Connections**
   - Identity statements at top of screen
   - Habits below in lanes
   - Subtle connection lines between related items
   - Tap identity to highlight supporting habits

### Smart Suggestions
- Gap Analysis: Identity without habits suggests actions
- Pattern Recognition: Multiple similar habits suggest identity
- Complementary Habits: Suggest related habits to strengthen identity

## Data Models

### Identity Settings
```typescript
interface IdentitySettings {
  id: string;
  userId: string;
  statements: IdentityStatement[];
  reminderSettings: {
    morningRitual: boolean;
    morningTime: string;
    dayRotation: boolean;
    rotationInterval: number; // hours
    eveningReview: boolean;
    eveningTime: string;
  };
}

interface IdentityStatement {
  id: string;
  text: string;
  backgroundColor?: string;
  backgroundImage?: string;
  order: number;
  strength: number; // 0-100 based on supporting habits
  relatedHabitIds: string[];
  createdAt: Date;
  active: boolean;
}
```

### Habit Model
```typescript
interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  lane: 'becoming' | 'i_am';
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    targetDays?: number; // per week
    specificDays?: number[]; // 0-6 for days
  };
  requiredDays: number; // Based on frequency
  currentDay: number;
  missedDays: number;
  graceDaysUsed: number;
  longestStreak: number;
  currentStreak: number;
  startDate: Date;
  graduationDate?: Date;
  lastCheckIn?: Date;
  totalCompletions: number;
  tinyHabitOption?: string; // Minimum viable version
}

interface DailyCheckIn {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
  tinyHabitUsed: boolean;
  note?: string;
}
```

## UI Components Structure

### Identity Settings Page (`/identity`)
```
┌─────────────────────────────────┐
│     My Identity Statements       │
├─────────────────────────────────┤
│                                  │
│  [+] Add Statement               │
│                                  │
│  ┌─────────────────────────┐    │
│  │ "I am disciplined"       │    │
│  │ [Edit] [Color] [Delete]  │    │
│  └─────────────────────────┘    │
│                                  │
│  ┌─────────────────────────┐    │
│  │ "I am healthy"          │    │
│  │ ████████░░ Strength: 80% │    │
│  └─────────────────────────┘    │
│                                  │
│  Reminder Settings:              │
│  Morning Ritual: 7:00 AM ✓      │
│  Day Rotation: Every 3 hrs ✓    │
│  Evening Review: 10:00 PM ✓     │
└─────────────────────────────────┘
```

### Habit Builder Page (`/habits`)
```
┌───────────────┬─────────────────┐
│    I AM       │    BECOMING     │
│    (Left)     │    (Right)      │
├───────────────┼─────────────────┤
│ ✓ Runner      │ 📊 Meditator    │
│   247 days    │    Day 23/40    │
│               │    ███████░░    │
│ ✓ Reader      │                 │
│   89 days     │ 📊 Writer       │
│               │    Day 7/40     │
│ ✓ Coder       │    ██░░░░░░░    │
│   156 days    │                 │
│               │ [+] Add Habit   │
└───────────────┴─────────────────┘
     ← Graduation Direction ←
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create identity settings page UI
- [ ] Basic CRUD for identity statements  
- [ ] Create habit model and database schema
- [ ] Basic two-lane UI layout
- [ ] Add habit functionality

### Phase 2: Core Tracking (Week 2)
- [ ] Daily check-in system
- [ ] Streak calculation logic
- [ ] Miss day handling with rules
- [ ] Progress visualization
- [ ] Basic notifications

### Phase 3: Graduation System (Week 3)
- [ ] Graduation animation
- [ ] Manual graduation option
- [ ] Identity suggestion on graduation
- [ ] I AM lane display
- [ ] Celebration moments

### Phase 4: Connections (Week 4)
- [ ] Identity strength calculation
- [ ] Visual connections between identity and habits
- [ ] Smart suggestions
- [ ] Quarterly review system
- [ ] Grace days implementation

### Phase 5: Polish (Week 5)
- [ ] Refined animations
- [ ] Reminder notifications
- [ ] Statistics and insights
- [ ] Backup and export
- [ ] Onboarding flow

## Success Metrics
- Daily active users
- Habit completion rate
- Graduation rate (Becoming → I AM)
- Identity statement engagement
- Streak lengths
- Recovery rate after misses

## Key Design Principles
1. **Positive Reinforcement** - Celebrate progress, gentle with setbacks
2. **Identity First** - Habits serve identity, not vice versa
3. **Flexibility** - Life happens, system adapts
4. **Visual Progress** - See transformation happening
5. **Simple Daily Use** - Quick check-ins, not burdensome

---

**Created**: 2024-12-28
**Updated**: 2024-12-28 (Refined Version)
**Status**: Ready for Implementation