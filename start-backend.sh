#!/bin/bash

# Banking System - Backend Startup Script

echo "🚀 Starting Banking System Backend..."
echo ""

# Set Java 17 as the Java home
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

echo "✅ Using Java version:"
java -version
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL..."
if psql -l > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running!"
    echo "   Please start PostgreSQL first:"
    echo "   brew services start postgresql@14"
    exit 1
fi
echo ""

# Check if database exists
echo "🔍 Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw banking_db; then
    echo "✅ Database 'banking_db' exists"
else
    echo "❌ Database 'banking_db' does not exist!"
    echo "   Creating database..."
    createdb banking_db
    echo "   Running database setup script..."
    psql -d banking_db -f database_setup.sql
    echo "✅ Database created and initialized"
fi
echo ""

# Navigate to backend directory
cd backend

# Start the backend
echo "🚀 Starting Spring Boot application..."
echo "   Backend will be available at: http://localhost:8080"
echo "   Press Ctrl+C to stop"
echo ""

mvn spring-boot:run

