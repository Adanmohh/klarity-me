# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Focus Cards is a card-based task management system with a unique stack interface that combines project-level focus with daily task execution. It features a Basecamp-inspired design with Glassmorphism effects in a black/white/golden yellow color scheme.

## Tech Stack

### Backend (FastAPI + PostgreSQL)
- **FastAPI** with Python 3.11+ for REST API
- **PostgreSQL** with async SQLAlchemy ORM
- **JWT** authentication with OTP support
- **Supabase** integration for auth and database
- **Pydantic** for data validation
- **Alembic** for database migrations

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Zustand** for state management (stores in `/frontend/src/store/`)
- **Framer Motion** for animations
- **Tailwind CSS** with Glassmorphism effects
- **React Router** v6 for navigation
- **Axios** for API communication

## Development Commands

### Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server (port 8001)
python -m uvicorn app.main:app --port 8001 --reload

# Run with specific settings
DEV_MODE=true python -m uvicorn app.main:app --port 8001 --reload
```

### Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server (port 5174 on Windows)
npm run start:win

# Start on other platforms
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

### Backend Structure
- `/backend/app/api/api_v1/endpoints/` - API endpoints organized by domain
  - `auth_otp.py` - OTP authentication system
  - `cards_supabase.py` - Card management with Supabase
  - `focus_tasks_dev.py` - Focus tasks (DEV_MODE version with in-memory store)
  - `focus_tasks.py` - Focus tasks (production version)
  - `daily_tasks.py` - Daily task management
- `/backend/app/core/` - Core configurations and security
  - `config.py` - Settings with DEV_MODE flag
  - `security.py` - JWT and password handling
- `/backend/app/services/` - Service layer
  - `supabase_client.py` - Supabase integration
  - `otp_service.py` - OTP generation and validation
  - `token_service.py` - JWT token management
- `/backend/app/db/` - Database models and sessions
  - `dev_store.py` - In-memory store for development (DEV_MODE)

### Frontend Structure
- `/frontend/src/store/` - Zustand stores
  - `authStore.ts` - Authentication state and session management
  - `cardStore.ts` - Card management
  - `dailyTaskStore.ts` - Daily task state
- `/frontend/src/services/` - API service layers
  - `authApi.ts` - Authentication API calls
  - `api.ts` - General API configuration
- `/frontend/src/components/` - React components
  - `/auth/` - Authentication components (OTPAuth, ProtectedRoute)
  - `/cards/` - Card-related components
  - `/workspace/` - Workspace and task management
  - `/identity/` - Identity evolution features
- `/frontend/src/pages/` - Main page components
  - `FocusPage.tsx` - Main focus area dashboard
  - `Dashboard.tsx` - Overview dashboard
  - `Analytics.tsx` - Analytics and insights

## Key Features & Patterns

### Authentication Flow
1. OTP-based authentication through `/api/v1/auth-otp/`
2. JWT tokens stored in localStorage as both 'token' and 'access_token'
3. Protected routes using `ProtectedRoute` component
4. Session persistence with refresh tokens

### Development Mode (DEV_MODE)
- When `DEV_MODE=true` in backend config:
  - Uses in-memory store instead of database for focus tasks
  - Simplified authentication for testing
  - Mock data available for development

### API Communication
- Backend runs on port 8001
- Frontend proxies API calls through React's proxy configuration
- All API calls go through `/api/v1/` prefix
- CORS configured for localhost:5174, 5173, 3000

### State Management
- Zustand stores handle global state
- Each store is domain-specific (auth, cards, tasks)
- Stores persist critical data to localStorage
- API calls update stores directly

## Important Notes

### Current Development Status
- Backend has multiple auth implementations (Supabase, OTP, simple)
- DEV_MODE flag switches between in-memory and database storage
- Focus tasks use `focus_tasks_dev.py` in DEV_MODE
- Some features are in transition (Identity Evolution, AI Coach)

### Environment Variables
Backend requires `.env` file with:
- Database credentials (when not in DEV_MODE)
- JWT secret key
- Supabase credentials (optional)
- Email service keys (optional)

### Common Issues & Solutions
1. **Port conflicts**: Backend uses 8001, frontend uses 5174 (Windows) or 3000 (default)
2. **CORS errors**: Check `BACKEND_CORS_ORIGINS` in backend config
3. **Auth issues**: Verify JWT secret key matches between services
4. **DEV_MODE**: Toggle based on whether using database or in-memory store

### Testing Approach
- Frontend: React Testing Library with Jest
- Backend: pytest with async support
- E2E: Playwright tests available in frontend

## Quick Start for New Features

### Adding a New API Endpoint
1. Create endpoint file in `/backend/app/api/api_v1/endpoints/`
2. Add router to `/backend/app/api/api_v1/api.py`
3. Create corresponding service in `/frontend/src/services/`
4. Update relevant Zustand store
5. Add UI components as needed

### Adding New Card Type or Task Feature
1. Update models in backend if needed
2. Create/modify endpoints
3. Update card/task store in frontend
4. Add UI components in appropriate directory
5. Update routing if new pages needed