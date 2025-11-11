# 🏦 IBM Banking System with Anomaly Detection

A full-stack banking application with advanced anomaly detection capabilities, built with React and Spring Boot. **Now with full database persistence!**

## ✨ Features

- ✅ **User Authentication** - Secure signup and signin with JWT tokens
- ✅ **Database Persistence** - All data stored in PostgreSQL
- ✅ **Transaction Management** - Multiple payment methods (Within Bank, Outside Bank, UPI, Mobile)
- ✅ **NFT Banking** - Blockchain-based digital asset transfers
- ✅ **Anomaly Detection** - Real-time fraud detection and risk scoring
- ✅ **Login Analytics** - Behavioral analysis and insights
- ✅ **MFA Support** - Two-factor authentication with OTP
- ✅ **Comprehensive Dashboard** - User profile and transaction history

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Node.js 16+

### 1. Start Backend (Terminal 1)
```bash
./start-backend.sh
```

### 2. Start Frontend (Terminal 2)
```bash
./start-frontend.sh
```

### 3. Open Browser
Navigate to: **http://localhost:5173**

## 📚 Documentation

- **[FINAL_SETUP_SUMMARY.md](FINAL_SETUP_SUMMARY.md)** - Complete setup guide and testing instructions
- **[SETUP_AND_RUN_GUIDE.md](SETUP_AND_RUN_GUIDE.md)** - Detailed setup and troubleshooting
- **[database_setup.sql](database_setup.sql)** - Database schema and setup script

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- Vite 7.1.7
- Carbon Design System 1.94.2
- React Router 7.9.5
- React Hook Form 7.65.0
- Yup validation

### Backend
- Spring Boot 3.2.0
- PostgreSQL (JDBC Driver)
- Spring Security 6.2.0
- JWT (jjwt 0.12.3)
- JPA/Hibernate 6.3.1
- Lombok 1.18.30

## 📊 Database Schema

- **users** - User accounts and profiles
- **transactions** - Transaction history
- **login_features** - Login behavior analytics
- **mfa_features** - MFA analytics
- **anomalies** - Anomaly detection results

## 🔐 Security

- BCrypt password encryption
- JWT token-based authentication
- CORS protection
- SQL injection prevention (JPA)
- MFA support

## 🧪 Testing

1. **Sign Up**: Create a new account at http://localhost:5173/signup
2. **Verify Database**: `psql -d banking_db -c "SELECT * FROM users;"`
3. **Sign In**: Login with your credentials
4. **Check Analytics**: View login features in database

## 📝 API Endpoints

### Authentication (No token required)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Management (Requires JWT)
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile

### Transactions (Requires JWT)
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction

### Analytics (Requires JWT)
- `GET /api/login-features` - Get login analytics
- `GET /api/mfa-features` - Get MFA analytics
- `GET /api/anomalies` - Get anomaly reports

## 🐛 Troubleshooting

### Backend won't start
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Database connection error
```bash
# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb banking_db
psql -d banking_db -f database_setup.sql
```

### Frontend can't connect
- Ensure backend is running on port 8080
- Check `proj/src/services/api.js` for correct API_BASE_URL

## 📁 Project Structure

```
Project 3/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/banking/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── repository/  # Data access
│   │       ├── entity/      # JPA entities
│   │       ├── dto/         # Data transfer objects
│   │       ├── config/      # Configuration
│   │       ├── filter/      # Security filters
│   │       └── util/        # Utilities
│   └── src/main/resources/
│       └── application.properties
├── proj/                    # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   └── services/        # API services
│   └── package.json
├── database_setup.sql       # Database schema
├── start-backend.sh         # Backend startup script
├── start-frontend.sh        # Frontend startup script
└── FINAL_SETUP_SUMMARY.md  # Complete guide
```

## 🎯 Current Status

- ✅ Database setup complete
- ✅ Backend running successfully
- ✅ Frontend API integration complete
- ✅ Signup stores data in PostgreSQL
- ✅ Signin authenticates against database
- ✅ JWT token management working
- ✅ All endpoints functional

## 🤝 Contributing

This is a project for IBM Banking System with Anomaly Detection.

## 📄 License

MIT

---

**Made with ❤️ using React, Spring Boot, and PostgreSQL**

