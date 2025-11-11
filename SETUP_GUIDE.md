# Complete Setup Guide

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd proj
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Backend Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

### Database Setup

1. Install PostgreSQL if not already installed

2. Create the database:
```sql
CREATE DATABASE banking_db;
```

3. Update `backend/src/main/resources/application.properties` with your PostgreSQL credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Build and run:
```bash
mvn spring-boot:run
```

Or build first:
```bash
mvn clean install
java -jar target/anomaly-detection-banking-1.0.0.jar
```

The API will be available at `http://localhost:8080`

## Database Schema

The application uses JPA/Hibernate with `ddl-auto=update`, so tables will be created automatically on first run:

- `users` - User accounts and profile information
- `transactions` - Transaction history
- `login_features` - Login behavior analytics
- `mfa_features` - MFA analytics
- `anomalies` - Anomaly detection results

## API Endpoints

### Authentication (No token required)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users (Requires JWT token)
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

### Transactions (Requires JWT token)
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction

### Login Features (Requires JWT token)
- `GET /api/login-features/latest` - Get latest login features
- `GET /api/login-features` - Get all login features
- `POST /api/login-features` - Save login features

### MFA Features (Requires JWT token)
- `GET /api/mfa-features/latest` - Get latest MFA features
- `GET /api/mfa-features` - Get all MFA features
- `POST /api/mfa-features` - Save MFA features

### Anomalies (Requires JWT token)
- `GET /api/anomalies` - Get user anomalies
- `POST /api/anomalies` - Save anomaly

## JWT Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-token>
```

## Features

1. **User Management**: Registration, login, profile management
2. **Transaction Management**: Send money via multiple methods (Within Bank, Outside Bank, UPI, Mobile)
3. **NFT Banking**: Transfer digital assets via blockchain
4. **Anomaly Detection**: Track login patterns, MFA behavior, and risk scores
5. **Analytics**: Login insights and advanced features tracking

## Next Steps

1. Update JWT secret in `application.properties` for production
2. Configure CORS origins for your frontend domain
3. Set up proper database backups
4. Configure email service for OTP delivery
5. Add rate limiting and additional security measures


