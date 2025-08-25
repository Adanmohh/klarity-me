# Product Requirements Document (PRD)
## Focus Cards - Task Management System

### Product Overview
A card-based task management system with a unique stack interface that combines project-level focus with daily task execution. Features a Basecamp-inspired design with Glassmorphism effects in a black/white/golden yellow color scheme.

### Core Features

#### 1. Card Stack Interface
- **Initial View**: List of cards that can be rearranged by importance
- **Arrange Mode**: Toggle mode (like dark/light mode) to enter card arrangement
- **Stack View**: After arrangement, cards display as a stack with backs visible
- **Card Reveal**: Top card shows upside down, click to flip and reveal task name
- **Card Navigation**: Move between any card in the stack

#### 2. Card-Level Controls
- **Pause Function**: Pause current major task/card for specific time periods (hours, days, etc.)
- **Card Selection**: Switch between cards in the stack at any time

#### 3. Focus Area (within each card)
**Purpose**: Handle big projects that break down into smaller subtasks

**Layout**: Two-lane system
- **Controller Lane**: Dump area for miscellaneous tasks before organization
- **Main Task List**: Organized tasks with titles and metadata

**Features**:
- Task metadata: dates, custom tags
- Filtering: by date and custom tags
- Focus mode: Stay on current task until "Focus Major Task/Project" is pressed
- Task navigation within the focus area

#### 4. Daily Tasks Area (within each card)
**Purpose**: Quick tasks organized by time duration

**Layout**: Two-lane system
- **Controller Lane**: Dump area for small tasks before organization  
- **Main Task List**: Organized by time categories (10, 15, 30 minutes)

**Features**:
- Time-based categorization
- Quick task completion tracking

### Technical Stack

#### Backend: FastAPI
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication
- **API Design**: RESTful endpoints with OpenAPI documentation

#### Frontend: React
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand or Redux Toolkit
- **UI Library**: Custom components with Glassmorphism effects
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion for card interactions

### Design System

#### Color Palette
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)  
- **Accent**: Golden Yellow (#FFD700)
- **Background**: Subtle gradients with transparency

#### UI Style
- **Inspiration**: Basecamp's clean, functional design
- **Effects**: Glassmorphism with backdrop blur
- **Typography**: Clean, readable fonts
- **Spacing**: Generous whitespace following Basecamp principles

### Data Models

#### Card
```
- id: UUID
- title: String
- description: String
- position: Integer
- status: Enum (active, paused, completed)
- pause_until: DateTime (optional)
- created_at: DateTime
- updated_at: DateTime
- user_id: UUID (foreign key)
```

#### Focus Task
```
- id: UUID
- title: String
- description: String
- card_id: UUID (foreign key)
- lane: Enum (controller, main)
- status: Enum (pending, active, completed)
- date: Date (optional)
- tags: Array[String]
- position: Integer
- created_at: DateTime
- updated_at: DateTime
```

#### Daily Task
```
- id: UUID
- title: String
- card_id: UUID (foreign key)
- lane: Enum (controller, main)
- duration: Enum (10min, 15min, 30min)
- status: Enum (pending, completed)
- position: Integer
- created_at: DateTime
- updated_at: DateTime
```

### User Stories

#### Epic 1: Card Management
- As a user, I can create and arrange cards by importance
- As a user, I can enter arrange mode to reorder my cards
- As a user, I can view my cards as a stack after arrangement
- As a user, I can click the top card to reveal its content
- As a user, I can navigate between any card in my stack

#### Epic 2: Focus Area Management
- As a user, I can dump miscellaneous tasks in the controller lane
- As a user, I can organize tasks in the main task list
- As a user, I can add dates and custom tags to tasks
- As a user, I can filter tasks by date and tags
- As a user, I can focus on one task until I choose to switch

#### Epic 3: Daily Task Management
- As a user, I can add quick tasks categorized by time duration
- As a user, I can move tasks from controller to organized lists
- As a user, I can track completion of daily tasks

#### Epic 4: Card-Level Operations
- As a user, I can pause a major task/card for a specific time period
- As a user, I can switch between different cards while maintaining context

### Success Metrics
- User engagement: Daily active usage
- Task completion rate
- Time spent in focus mode
- Card arrangement frequency
- User retention after 30 days

### Technical Requirements

#### Performance
- Card flip animations: < 200ms
- Task filtering: < 100ms response time
- Real-time updates across sessions

#### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

#### Security
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints

### Implementation Phases

#### Phase 1: Core Infrastructure
- FastAPI backend setup with basic models
- React frontend with routing
- Authentication system
- Basic CRUD operations

#### Phase 2: Card System
- Card creation and arrangement
- Stack view implementation
- Card reveal animations
- Basic navigation

#### Phase 3: Task Management
- Focus area with two-lane system
- Daily tasks implementation
- Task filtering and tagging
- Focus mode functionality

#### Phase 4: Advanced Features
- Pause/resume functionality
- Enhanced animations and transitions
- Performance optimizations
- Mobile responsiveness

#### Phase 5: Polish
- Glassmorphism effects refinement
- Accessibility improvements
- User testing and feedback integration
- Documentation and deployment