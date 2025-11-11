-- Database Setup Script for Banking System with Anomaly Detection
-- PostgreSQL Database

-- Create database (run this separately as postgres user)
-- CREATE DATABASE banking_db;

-- Connect to the database
-- \c banking_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS anomalies CASCADE;
DROP TABLE IF EXISTS mfa_features CASCADE;
DROP TABLE IF EXISTS login_features CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    occupation VARCHAR(100),
    income_range VARCHAR(50),
    preferred_language VARCHAR(50),
    date_of_birth TIMESTAMP,
    gender VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table
CREATE TABLE accounts (
    account_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_balance DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    account_type VARCHAR(50) NOT NULL,
    currency_preference VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_type VARCHAR(50) NOT NULL,
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(10),
    device_id VARCHAR(255),
    transaction_country VARCHAR(100),
    transaction_city VARCHAR(100),
    channel VARCHAR(50),
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- Create login_features table
CREATE TABLE login_features (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address VARCHAR(50),
    isp VARCHAR(255),
    is_vpn INTEGER DEFAULT 0,
    is_tor INTEGER DEFAULT 0,
    is_proxy INTEGER DEFAULT 0,
    is_datacenter_ip INTEGER DEFAULT 0,
    device_fingerprint VARCHAR(255),
    device_type VARCHAR(50),
    login_attempts INTEGER DEFAULT 0,
    failed_attempts INTEGER DEFAULT 0,
    password_correct INTEGER DEFAULT 0,
    hour_of_day INTEGER,
    day_of_week INTEGER,
    is_weekend INTEGER DEFAULT 0,
    is_unusual_time INTEGER DEFAULT 0,
    typing_speed_chars_per_min DOUBLE PRECISION,
    mouse_movement_entropy DOUBLE PRECISION,
    time_to_login_seconds DOUBLE PRECISION,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create mfa_features table
CREATE TABLE mfa_features (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mfa_required INTEGER DEFAULT 0,
    mfa_attempts INTEGER DEFAULT 0,
    mfa_success INTEGER DEFAULT 0,
    mfa_time_taken_seconds DOUBLE PRECISION,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create anomalies table
CREATE TABLE anomalies (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    previous_country VARCHAR(100),
    ip_reputation_score INTEGER,
    time_since_last_login_hours DOUBLE PRECISION,
    distance_from_last_login_km DOUBLE PRECISION,
    is_breached_credential INTEGER DEFAULT 0,
    mfa_method VARCHAR(50),
    mfa_method_changed INTEGER DEFAULT 0,
    push_notification_count INTEGER DEFAULT 0,
    concurrent_sessions INTEGER DEFAULT 0,
    session_duration_last_minutes DOUBLE PRECISION,
    velocity_score INTEGER,
    device_trust_score INTEGER,
    location_trust_score INTEGER,
    risk_score INTEGER,
    is_anomaly INTEGER DEFAULT 0,
    anomaly_category VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_login_features_user_id ON login_features(user_id);
CREATE INDEX idx_login_features_timestamp ON login_features(timestamp);
CREATE INDEX idx_mfa_features_user_id ON mfa_features(user_id);
CREATE INDEX idx_mfa_features_timestamp ON mfa_features(timestamp);
CREATE INDEX idx_anomalies_user_id ON anomalies(user_id);
CREATE INDEX idx_anomalies_timestamp ON anomalies(timestamp);
CREATE INDEX idx_anomalies_is_anomaly ON anomalies(is_anomaly);

-- Display table information
SELECT 'Database setup completed successfully!' AS status;
SELECT 'Tables created:' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

