# Banking System Backend

Spring Boot backend with PostgreSQL for anomaly detection banking system.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

## Database Setup

1. Install PostgreSQL if not already installed
2. Create database:
```sql
CREATE DATABASE banking_db;
```

3. Update `application.properties` with your PostgreSQL credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Running the Application

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

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user (requires JWT token)
- `PUT /api/users/me` - Update current user (requires JWT token)

### Transactions
- `GET /api/transactions` - Get user transactions (requires JWT token)
- `POST /api/transactions` - Create transaction (requires JWT token)

### Login Features
- `GET /api/login-features/latest` - Get latest login features (requires JWT token)
- `GET /api/login-features` - Get all login features (requires JWT token)
- `POST /api/login-features` - Save login features (requires JWT token)

### MFA Features
- `GET /api/mfa-features/latest` - Get latest MFA features (requires JWT token)
- `GET /api/mfa-features` - Get all MFA features (requires JWT token)
- `POST /api/mfa-features` - Save MFA features (requires JWT token)

### Anomalies
- `GET /api/anomalies` - Get user anomalies (requires JWT token)
- `POST /api/anomalies` - Save anomaly (requires JWT token)

## JWT Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-token>
```

## Database Schema

The application uses JPA/Hibernate with `ddl-auto=update`, so tables will be created automatically on first run.

Tables created:
- `users` - User accounts
- `transactions` - Transaction history
- `login_features` - Login behavior analytics
- `mfa_features` - MFA analytics
- `anomalies` - Anomaly detection results


