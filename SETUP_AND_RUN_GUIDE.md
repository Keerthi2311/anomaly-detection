# Complete Setup and Run Guide - Banking System with Anomaly Detection

This guide will help you set up and run the complete banking application with database persistence.

## Prerequisites

Before starting, ensure you have the following installed:

1. **Java 17 or higher** - [Download here](https://www.oracle.com/java/technologies/downloads/)
2. **Maven 3.6+** - [Download here](https://maven.apache.org/download.cgi)
3. **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)
4. **Node.js 16+** - [Download here](https://nodejs.org/)
5. **npm or yarn** - Comes with Node.js

## Step 1: Database Setup

### 1.1 Install and Start PostgreSQL

**On macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**On Windows:**
- Download and install PostgreSQL from the official website
- Start PostgreSQL service from Services panel

**On Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 1.2 Create Database

Open PostgreSQL command line:

```bash
# On macOS/Linux
psql postgres

# On Windows
psql -U postgres
```

Then run:

```sql
CREATE DATABASE banking_db;
\q
```

### 1.3 Run Database Setup Script

```bash
# From the project root directory
psql -U postgres -d banking_db -f database_setup.sql
```

Or manually connect and run:

```bash
psql -U postgres -d banking_db
```

Then copy and paste the contents of `database_setup.sql`.

### 1.4 Update Database Credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/banking_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password.

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Build the Project

```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the Java code
- Run tests
- Create a JAR file

### 2.3 Run the Backend

**Option 1: Using Maven (Recommended for Development)**
```bash
mvn spring-boot:run
```

**Option 2: Using JAR file**
```bash
java -jar target/anomaly-detection-banking-1.0.0.jar
```

### 2.4 Verify Backend is Running

You should see output like:
```
Started BankingApplication in X.XXX seconds
```

The backend API will be available at: **http://localhost:8080**

Test it by visiting: http://localhost:8080/api/auth/signup (should return 405 Method Not Allowed for GET, which is correct)

## Step 3: Frontend Setup

### 3.1 Open a New Terminal

Keep the backend running in the first terminal, and open a new terminal for the frontend.

### 3.2 Navigate to Frontend Directory

```bash
cd proj
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React
- Carbon Design System
- React Router
- React Hook Form
- Yup validation

### 3.4 Run the Frontend

```bash
npm run dev
```

The frontend will be available at: **http://localhost:5173**

## Step 4: Test the Application

### 4.1 Open Browser

Navigate to: **http://localhost:5173**

### 4.2 Sign Up

1. Click on "Sign Up" or navigate to the signup page
2. Fill in all required fields:
   - First Name
   - Last Name
   - Email (e.g., test@example.com)
   - Password (min 8 chars, with uppercase, lowercase, and number)
   - Phone Number (10 digits)
   - Date of Birth
   - Gender
   - Country, State, City
   - Postal Code (6 digits)
   - Account Type
   - Currency Preference
   - Occupation
   - Income Range

3. Click "Create Account"
4. You should see a success message and be redirected to sign in

### 4.3 Verify Database Entry

Check if the user was created in the database:

```bash
psql -U postgres -d banking_db
```

```sql
SELECT user_id, email, first_name, last_name, phone_number, created_at FROM users;
```

You should see your newly created user!

### 4.4 Sign In

1. Enter your email or phone number
2. Enter your password
3. Complete the MFA verification (OTP will be shown in console for testing)
4. You should be logged in and redirected to the dashboard

### 4.5 Verify Login Features

Check if login features were recorded:

```sql
SELECT * FROM login_features ORDER BY timestamp DESC LIMIT 1;
SELECT * FROM mfa_features ORDER BY timestamp DESC LIMIT 1;
```

## Troubleshooting

### Backend Issues

**Problem: "Connection refused" or database connection error**
- Solution: Make sure PostgreSQL is running
  ```bash
  # macOS
  brew services list
  
  # Linux
  sudo systemctl status postgresql
  ```

**Problem: "Port 8080 already in use"**
- Solution: Kill the process using port 8080 or change the port in `application.properties`
  ```bash
  # Find process
  lsof -i :8080
  
  # Kill process
  kill -9 <PID>
  ```

**Problem: "Table does not exist"**
- Solution: Run the database setup script again
  ```bash
  psql -U postgres -d banking_db -f database_setup.sql
  ```

### Frontend Issues

**Problem: "CORS error" in browser console**
- Solution: Make sure backend is running and CORS is configured correctly in `SecurityConfig.java`

**Problem: "Network error" when signing up/in**
- Solution: 
  1. Check if backend is running on http://localhost:8080
  2. Check browser console for exact error
  3. Verify API endpoint in `proj/src/services/api.js`

**Problem: "Port 5173 already in use"**
- Solution: Kill the process or use a different port
  ```bash
  # Kill process
  lsof -i :5173
  kill -9 <PID>
  ```

### Database Issues

**Problem: "Password authentication failed"**
- Solution: Update the password in `application.properties` to match your PostgreSQL password

**Problem: "Database does not exist"**
- Solution: Create the database manually
  ```sql
  CREATE DATABASE banking_db;
  ```

## API Endpoints

### Authentication (No token required)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Management (Requires JWT token)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Transactions (Requires JWT token)
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction

### Login Features (Requires JWT token)
- `GET /api/login-features` - Get login features
- `POST /api/login-features` - Save login features

### MFA Features (Requires JWT token)
- `GET /api/mfa-features` - Get MFA features
- `POST /api/mfa-features` - Save MFA features

### Anomalies (Requires JWT token)
- `GET /api/anomalies` - Get user anomalies
- `POST /api/anomalies` - Save anomaly

## Development Tips

1. **Backend Logs**: Check the terminal running the backend for detailed logs
2. **Frontend Logs**: Check browser console (F12) for frontend errors
3. **Database Logs**: Check PostgreSQL logs for database issues
4. **Hot Reload**: Both frontend and backend support hot reload during development

## Production Deployment

Before deploying to production:

1. Update JWT secret in `application.properties`
2. Configure proper CORS origins
3. Set up SSL/TLS certificates
4. Use environment variables for sensitive data
5. Set up proper database backups
6. Configure email service for OTP delivery
7. Add rate limiting and additional security measures

## Support

If you encounter any issues not covered in this guide:

1. Check the backend logs for detailed error messages
2. Check the browser console for frontend errors
3. Verify all prerequisites are installed correctly
4. Ensure all ports are available (8080 for backend, 5173 for frontend, 5432 for PostgreSQL)

Happy coding! 🚀

