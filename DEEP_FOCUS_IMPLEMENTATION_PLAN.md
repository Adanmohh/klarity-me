# Deep Focus TODO System - Implementation Plan

## Core Concept
**"One card at a time, progress over completion, momentum over intensity"**

A focus-lock system where users work on one active card at a time, with long-running projects that span days/weeks. Sessions end without completing cards, and cards maintain momentum across multiple work sessions.

## Phase 1: Core Focus Lock System
**Priority: CRITICAL - This is the foundation**

### 1. Refactor Card Detail View as Focus Session
- [ ] Move timer, pomodoro, and break system INTO CardDetailView
- [ ] Add session state: `active` | `paused` | `ended`
- [ ] Lock navigation when session active (disable nav buttons/show warning)
- [ ] Add "End Session" and "Pause" buttons prominently

### 2. Card States & Queue System
- [ ] Add card states: `active`, `queued`, `on-hold`, `completed`
- [ ] Only ONE card can be `active` at a time
- [ ] Implement queue order (position field)
- [ ] Auto-advance: When card completed → next queued becomes active

### 3. Session Completion vs Card Completion
- [ ] Add "End Session" (different from complete card)
- [ ] Session end returns card to queue
- [ ] Track `last_worked_on` timestamp
- [ ] Add `sessions_count` to track work sessions

## Phase 2: Card Management & Organization

### 4. Drag-and-Drop Queue Manager
- [ ] New view: `/focus` shows card organizer when no active session
- [ ] Draggable card list to reorder queue
- [ ] Visual indicators: position numbers, "next up" badge
- [ ] Can only reorder when no active session

### 5. Kanban Board View
- [ ] Alternative view toggle: List | Kanban
- [ ] Columns: Active | Queued | On Hold | Completed
- [ ] Drag between columns (except Active - that's locked)
- [ ] Quick actions: Archive, Delete from kanban

### 6. Pause System
- [ ] Micro-pause: 5 min break, stay in card context
- [ ] Session pause: Unlocks navigation, saves state
- [ ] Card pause: "Hide for X days" (moves to on-hold)
- [ ] Resume exactly where left off

## Phase 3: Progress & Momentum

### 7. Card Momentum Indicators
- [ ] Hot streak: Worked 3+ consecutive days 🔥
- [ ] Cooling: 2-3 days since last work ⚠️
- [ ] Cold: 5+ days dormant ❄️
- [ ] Visual badges on cards

### 8. Context Preservation
- [ ] "Where I left off" note field (shown on resume)
- [ ] Card journal: Auto-log each session
- [ ] Session summary: Tasks completed, time spent
- [ ] Persistent "Next action" at top of card

### 9. Progress Tracking
- [ ] Milestone system: Set 3-5 major goals per card
- [ ] Progress bar based on task completion
- [ ] Weekly progress graph per card
- [ ] Session history log

## Phase 4: Enhanced Task Management

### 10. Task Aging
- [ ] Visual fade for tasks older than 7 days
- [ ] "Stale" lane for old untouched tasks
- [ ] Periodic prompt: "Review stale tasks?"
- [ ] Bulk actions: refresh, archive, delete stale

### 11. Breakthrough Tasks
- [ ] Mark 1-2 tasks as "breakthrough" ⭐
- [ ] Highlight these specially
- [ ] Track when completed (unlocks momentum)
- [ ] Optional: completing breakthrough auto-ends session

### 12. Controller Card (Inbox)
- [ ] Special persistent card: "Inbox" or "Triage"
- [ ] All new tasks land here first
- [ ] Daily ritual: Process inbox → assign to cards
- [ ] Can work on inbox without it being "active"

## Phase 5: Smart Features

### 13. Focus Protection
- [ ] "Deep Mode": Can't pause for first 25 min
- [ ] "Do Not Disturb": No task edits during session
- [ ] Navigation lock with confirmation dialog
- [ ] Session commitment timer

### 14. Forced Breaks
- [ ] 5-10 min transition between cards
- [ ] Show completion summary
- [ ] Gentle prompt to move/stretch
- [ ] Preview next card before starting

### 15. Smart Queue Ordering
- [ ] Due dates for cards (soft deadlines)
- [ ] Auto-sort options: deadline, momentum, manual
- [ ] "Suggested next" based on patterns
- [ ] Warning for approaching deadlines

## Phase 6: Review & Analytics

### 16. Weekly Review System
- [ ] Sunday prompt for card review
- [ ] Progress summary per card
- [ ] Archive completed cards
- [ ] Reorder queue for next week
- [ ] Momentum report

### 17. Deep Dive Mode
- [ ] Declare focus week on single card
- [ ] Special UI theme
- [ ] Other cards auto-pause
- [ ] Daily default to deep dive card

### 18. Collaboration Markers
- [ ] "Blocked by" indicator
- [ ] "Waiting on" state (different from pause)
- [ ] "Ready for review" flag
- [ ] Visual badges for blockers

## Technical Implementation Order

**Week 1:** Phase 1 (Core Focus Lock)
- This is the fundamental change
- Everything else builds on this

**Week 2:** Phase 2 (Card Management)
- Drag-drop and kanban views
- Pause system

**Week 3:** Phase 3 (Progress & Momentum)
- Context preservation
- Momentum indicators

**Week 4:** Phase 4 (Task Management)
- Task aging, breakthrough tasks
- Controller card

**Week 5-6:** Phase 5 & 6 (Smart Features & Analytics)
- Protection features
- Review systems
- Deep dive mode

## Database Changes Needed

### Cards Table
- Add `state` enum: active, queued, on-hold, completed
- Add `position` integer for queue order
- Add `last_worked_on` timestamp
- Add `momentum_score` integer
- Add `sessions_count` integer
- Add `where_left_off` text field

### New Tables

**Sessions Table**
- id
- card_id
- started_at
- ended_at
- duration_minutes
- tasks_completed
- notes

**Milestones Table**
- id
- card_id
- title
- description
- completed
- completed_at
- position

**CardJournal Table**
- id
- card_id
- session_id
- entry_type (session_start, session_end, note, breakthrough)
- content
- created_at

### Tasks Table Updates
- Add `created_at` timestamp
- Add `is_breakthrough` boolean
- Add `is_stale` boolean
- Add `last_touched` timestamp

## Key User Flows

### Starting Work
1. Open app → Focus view
2. If no active card → See queue → Pick card
3. Card becomes active → Enter focus session
4. Timer starts → Navigation locked
5. Work on tasks (Controller → Main)

### Ending Session
1. Click "End Session" (not complete)
2. Prompt: "Where did you leave off?"
3. Session summary shown
4. Card returns to queue
5. Navigation unlocked

### Pausing
1. Micro-pause: Quick 5 min, stay in context
2. Session pause: Save state, unlock navigation
3. Card pause: Move to on-hold for X days

### Card Completion
1. Mark card as complete
2. Celebration animation
3. Auto-advance to next queued card
4. Or end session if no cards queued

## Success Metrics
- Average session duration
- Cards touched per week (momentum)
- Task completion rate
- Streak days per card
- Time from card creation to completion