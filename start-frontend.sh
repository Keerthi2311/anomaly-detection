#!/bin/bash

# Banking System - Frontend Startup Script

echo "🚀 Starting Banking System Frontend..."
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if lsof -i :8080 | grep LISTEN > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8080"
else
    echo "⚠️  Backend is not running on port 8080"
    echo "   Please start the backend first:"
    echo "   ./start-backend.sh"
    echo ""
    echo "   Continuing anyway..."
fi
echo ""

# Navigate to frontend directory
cd proj

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Start the frontend
echo "🚀 Starting Vite development server..."
echo "   Frontend will be available at: http://localhost:5173"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev

