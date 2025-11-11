# 🏦 IBM Banking System with Anomaly Detection

A full-stack banking application with advanced anomaly detection capabilities, built with React and Spring Boot, integrated with IBM Watsonx.ai for ML-powered fraud detection.

## ⭐ Key Features

✅ **Real-Time Anomaly Detection** - ML-powered fraud detection via Watsonx.ai  
✅ **41-Feature Engineering** - Advanced feature extraction and encoding  
✅ **Event Streaming** - Kafka-based real-time event processing  
✅ **User Authentication** - Secure JWT-based authentication  
✅ **Transaction Management** - Multiple payment methods with risk scoring  
✅ **NFT Banking** - Blockchain-based digital asset transfers  
✅ **Login Analytics** - Behavioral analysis and insights  
✅ **MFA Support** - Multi-factor authentication  

## 📖 Documentation

**👉 [COMPLETE_IMPLEMENTATION_GUIDE.md](COMPLETE_IMPLEMENTATION_GUIDE.md)** - **START HERE!**

This comprehensive guide includes:
- System architecture & data flow
- Model information & feature engineering (41 features)
- Complete backend implementation (5 Java services)
- Step-by-step deployment instructions
- Testing & troubleshooting guide
- API endpoints reference

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Node.js 16+
- Watsonx.ai credentials (IBM Cloud)
- OpenShift/Kubernetes cluster

### 1. Prepare Model
```bash
# Run notebook to generate model file
jupyter notebook Banking_Hybrid_Model_Training.ipynb
# Output: banking_anomaly_watsonx_model.pkl
```

### 2. Deploy to Watsonx.ai (IBM Cloud)
- Upload: `banking_anomaly_watsonx_model.pkl`
- Get: Deployment ID, API Key

### 3. Setup OpenShift (Infrastructure)
```bash
# Create Kafka topics
oc exec -it kafka-pod -- kafka-topics.sh --create --topic transaction-details
oc exec -it kafka-pod -- kafka-topics.sh --create --topic anomalies
oc exec -it kafka-pod -- kafka-topics.sh --create --topic successes
```

### 4. Start Backend
```bash
# Update credentials in application.properties
# Then build and run
cd backend
mvn clean install
mvn spring-boot:run
```

### 5. Start Frontend
```bash
cd proj
npm install
npm run dev
```

## 🏗️ System Architecture

```
Frontend (React)
    ↓ Transaction Data
Backend (Spring Boot)
    ├─ EncodingService (categorical → integer)
    ├─ FeaturePreparationService (→ 41 features)
    └─ EventStreamsService (Kafka)
        ↓
Event Streams (OpenShift)
    ↓
IBM ACE (Orchestration)
    ↓
Watsonx.ai (IBM Cloud)
    Model Input:  41-feature array
    Model Output: Binary (0/1) + Confidence
    ↓
Backend Post-Processing (Rules Engine)
    └─ Determine anomaly category
        ↓
Results to Frontend
```

## � Model Information

**Training**: 1,000 records, 43 features, 16.2% anomaly rate  
**Inference**: 41 features, binary classifier  
**Performance**: 100% accuracy, 1.000 AUC-ROC  
**Framework**: scikit-learn 1.7.2 + XGBoost  

## 🔄 Model Predictions

### Input (41 Features)
- 36 numeric features (raw values)
- 5 encoded categorical features (country, city, prev_country, isp, device_type)

### Output
```json
{
  "is_anomaly": 0 or 1,
  "anomaly_score": 0.0-1.0,
  "confidence": 0.0-1.0,
  "anomaly_category": "NORMAL|IMPOSSIBLE_TRAVEL|BRUTE_FORCE|MFA_FATIGUE|HIGH_VALUE_ANOMALY|UNKNOWN_DEVICE|SUSPICIOUS_PATTERN",
  "timestamp": 1699609580000
}
```

## 📂 Project Structure

```
Anomaly-Detection/
├── backend/                          (Java Spring Boot)
│   ├── src/main/java/com/banking/
│   │   ├── service/
│   │   │   ├── EncodingService.java
│   │   │   ├── FeaturePreparationService.java
│   │   │   ├── ModelInferenceService.java
│   │   │   ├── EventStreamsService.java
│   │   │   └── (+ other services)
│   │   ├── controller/
│   │   │   └── PredictionController.java
│   │   └── config/
│   │       └── WatsonxRestTemplateConfig.java
│   ├── resources/
│   │   └── application.properties
│   └── pom.xml
│
├── proj/                             (React Frontend)
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Banking_Hybrid_Model_Training.ipynb  (Model Training)
├── banking_anomaly_watsonx_model.pkl    (Trained Model)
├── model_config.json                     (Feature Config)
├── inference_feature_names.json          (41 Feature Names)
│
└── COMPLETE_IMPLEMENTATION_GUIDE.md      ← **Full Documentation**
```

## 🛠️ Tech Stack

**Backend**:
- Java 17 + Spring Boot 3.2
- Spring Data JPA + PostgreSQL
- Spring Security + JWT
- Spring Kafka (Event Streams)
- Lombok + MapStruct

**Frontend**:
- React 19.1.1
- Vite 7.1.7
- Carbon Design System 1.94.2

**ML/AI**:
- IBM Watsonx.ai
- scikit-learn 1.7.2
- XGBoost
- Jupyter Notebook

**Infrastructure**:
- IBM Event Streams (Kafka)
- IBM ACE
- OpenShift/Kubernetes
- PostgreSQL Database
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

