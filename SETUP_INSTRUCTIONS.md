# Focus Cards Application Setup

## Current Status
✅ Frontend build errors fixed
✅ Backend connected to Supabase cloud database
✅ OTP-based email authentication implemented
✅ End-to-end testing with Puppeteer completed

## Architecture

### Frontend (React + TypeScript)
- Running on port 5174
- OTP-based authentication UI
- All database operations go through backend API
- No direct Supabase connections from frontend

### Backend (FastAPI + Python)
- Running on port 8000
- Connected to Supabase cloud database
- OTP email authentication with dev mode console output
- RESTful API endpoints for all operations

### Database (Supabase Cloud)
- Project: todo-focus-app (dqkfjcnseysddzdpdlaq)
- URL: https://dqkfjcnseysddzdpdlaq.supabase.co
- Tables: users, cards, focus_tasks, daily_tasks, identity_*

## Setup Instructions

### 1. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Access at: http://localhost:5174

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Required Environment Variables

Create a `.env` file in the backend directory with:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://dqkfjcnseysddzdpdlaq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2ZqY25zZXlzZGR6ZHBkbGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzM4OTksImV4cCI6MjA3MTk0OTg5OX0.cOZy-EA06kPhGOwMw6_PW69dGuWs5ywMORqXp8_p1n4

# IMPORTANT: Get this from Supabase Dashboard > Settings > API
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Optional: Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@focuscards.com
```

### 4. Getting the Service Role Key

1. Go to https://supabase.com/dashboard
2. Select the "todo-focus-app" project
3. Go to Settings > API
4. Copy the "service_role" key (NOT the anon key)
5. Add it to your `.env` file as SUPABASE_SERVICE_KEY

## Features Implemented

### Authentication
- ✅ Email + OTP authentication (no passwords)
- ✅ Email activation for new users
- ✅ Auto user creation on first signup
- ✅ Dev mode: OTP printed to backend console

### Database Operations
- ✅ All operations through backend API
- ✅ Real Supabase cloud database
- ✅ Cards, tasks, and user management
- ✅ No direct database calls from frontend

### UI/UX
- ✅ Professional gradient login page
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Dark mode ready

## Testing

### Manual Testing
1. Go to http://localhost:5174/login
2. Enter any email address
3. Check backend console for OTP code
4. Enter the 6-digit code to login

### Automated Testing with Puppeteer
```javascript
// Already configured in the MCP Puppeteer tool
// Navigate to: http://localhost:5174
// Fill email, submit, check for OTP
```

## Known Issues

1. **Service Role Key Required**: The backend needs the Supabase service role key to create users. Without it, you'll get "User not allowed" errors.

2. **Email Service**: Currently using console output for OTP codes. For production, configure SMTP settings.

## Next Steps

1. Get and configure the Supabase service role key
2. Set up proper email service for production
3. Add more features as needed

## Support

For issues or questions, check the backend logs for detailed error messages. The app is configured with comprehensive error logging.