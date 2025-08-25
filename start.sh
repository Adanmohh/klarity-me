#!/bin/bash

echo "Starting Focus Cards Application..."
echo "================================="
echo ""

# Start Backend
echo "Starting Backend on port 8080..."
cd backend
uvicorn main:app --reload --port 8080 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend on port 5174..."
cd ../frontend

# Detect OS and run appropriate command
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    npm run start:win &
else
    npm start &
fi
FRONTEND_PID=$!

echo ""
echo "================================="
echo "Application started successfully!"
echo "Frontend: http://localhost:5174"
echo "Backend API: http://localhost:8080"
echo "API Docs: http://localhost:8080/docs"
echo "================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
wait $BACKEND_PID $FRONTEND_PID