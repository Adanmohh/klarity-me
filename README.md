# Focus Cards - Task Management System

A card-based task management system with a unique stack interface that combines project-level focus with daily task execution. Features a Basecamp-inspired design with Glassmorphism effects in a black/white/golden yellow color scheme.

## Features

### Core Functionality
- **Card Stack Interface**: Arrange cards by importance, view as stack with backs visible
- **Card Reveal**: Top card shows upside down, click to flip and reveal content
- **Pause/Resume**: Pause major tasks/cards for specific time periods
- **Two Work Areas**: Focus Area for big projects, Daily Tasks for quick actions
- **Two-Lane System**: Controller lane for dumping tasks, Main lane for organized work

### Focus Area
- Project-level task management with subtasks
- Task metadata: dates, custom tags, descriptions
- Filtering by date and tags
- Focus mode: Stay on current task until switching
- Task status tracking (pending, active, completed)

### Daily Tasks Area
- Time-based task categorization (10, 15, 30 minutes)
- Quick task completion tracking
- Duration-based organization
- Controller to Main lane workflow

## Tech Stack

### Backend
- **FastAPI** with Python 3.11+
- **PostgreSQL** with async SQLAlchemy ORM
- **JWT authentication**
- **RESTful API** with OpenAPI documentation

### Frontend
- **React 18** with TypeScript
- **Zustand** for state management
- **Framer Motion** for animations
- **Tailwind CSS** with Glassmorphism effects
- **React Router** for navigation

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL 13+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE focuscards;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE focuscards TO postgres;
   ```

5. **Run the server**
   ```bash
   uvicorn main:app --reload --port 8080
   ```

   The API will be available at `http://localhost:8080`
   API docs at `http://localhost:8080/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   # On Windows:
   npm run start:win
   
   # On Linux/Mac:
   npm start
   ```

   The app will be available at `http://localhost:5174`

## Usage

### Getting Started
1. Register a new account or login
2. Create your first focus card
3. Use arrange mode to organize cards by importance
4. Click the top card to reveal and start working

### Working with Cards
- **Arrange Mode**: Toggle to rearrange cards by importance
- **Card Stack**: Cards display as stack with backs visible after arrangement
- **Pause/Resume**: Set time-based pauses for major tasks
- **Navigation**: Switch between any card in your stack

### Focus Area Workflow
1. Dump miscellaneous tasks in Controller lane
2. Organize important tasks in Main lane
3. Add dates, tags, and descriptions
4. Use filters to find specific tasks
5. Focus on one task until completion

### Daily Tasks Workflow
1. Add quick tasks to Controller lane
2. Assign time duration (10/15/30 minutes)
3. Move organized tasks to appropriate duration lanes
4. Complete tasks within time blocks

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

### Cards
- `GET /api/v1/cards/` - List user's cards
- `POST /api/v1/cards/` - Create new card
- `GET /api/v1/cards/{id}` - Get card with tasks
- `PUT /api/v1/cards/{id}` - Update card
- `DELETE /api/v1/cards/{id}` - Delete card

### Focus Tasks
- `GET /api/v1/focus-tasks/card/{card_id}` - Get card's focus tasks
- `POST /api/v1/focus-tasks/` - Create focus task
- `PUT /api/v1/focus-tasks/{id}` - Update focus task
- `DELETE /api/v1/focus-tasks/{id}` - Delete focus task

### Daily Tasks
- `GET /api/v1/daily-tasks/card/{card_id}` - Get card's daily tasks
- `POST /api/v1/daily-tasks/` - Create daily task
- `PUT /api/v1/daily-tasks/{id}` - Update daily task
- `DELETE /api/v1/daily-tasks/{id}` - Delete daily task

## Design System

### Colors
- **Primary Black**: `#000000`
- **Primary White**: `#FFFFFF`
- **Golden Yellow**: `#FFD700`
- **Glass Effects**: Transparent overlays with backdrop blur

### Components
- **Glassmorphism**: Transparent cards with blur effects
- **Basecamp Style**: Clean, functional design with generous whitespace
- **Animations**: Smooth transitions and card flip effects
- **Responsive**: Mobile-first design approach

## Development

### Project Structure
```
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core functionality
│   │   ├── crud/         # Database operations
│   │   ├── db/           # Database configuration
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   ├── main.py           # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand stores
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── public/
│   └── package.json
│
└── PRD.md               # Product Requirements Document
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For issues and questions, please open an issue on the GitHub repository.