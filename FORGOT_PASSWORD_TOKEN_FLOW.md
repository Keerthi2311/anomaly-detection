# Forgot Password - Token-Based Flow Implementation

## Overview
Implemented a complete, secure forgot password workflow with email verification and time-limited tokens, following industry best practices.

---

## Workflow

```
1. User clicks "Forgot Password?" on Sign In page
   ↓
2. Enters email address
   ↓
3. Backend:
   - Checks if email exists
   - Generates secure UUID token
   - Stores token in database (expires in 1 hour)
   - Sends reset link via email
   ↓
4. User receives email with reset link:
   http://localhost:5173/reset-password?token=<uuid>
   ↓
5. User clicks link → Opens Reset Password page
   ↓
6. Page validates token with backend
   ↓
7. If valid: User enters new password
   ↓
8. Backend:
   - Verifies token (not used, not expired)
   - Updates password (BCrypt encrypted)
   - Marks token as used
   ↓
9. Success! Redirect to Sign In
   ↓
10. User logs in with new password ✅
```

---

## Backend Implementation

### 1. PasswordResetToken Entity
**File**: `backend/src/main/java/com/banking/entity/PasswordResetToken.java`

**Fields**:
- `id` - Primary key (UUID)
- `token` - Unique reset token (UUID)
- `userId` - Reference to user
- `email` - User's email
- `expiryDate` - Token expiration (1 hour from creation)
- `used` - Boolean flag (prevents reuse)
- `createdAt` - Timestamp

**Methods**:
- `isExpired()` - Checks if token has expired

### 2. PasswordResetTokenRepository
**File**: `backend/src/main/java/com/banking/repository/PasswordResetTokenRepository.java`

**Methods**:
- `findByToken(String token)` - Find token by UUID
- `findByUserId(String userId)` - Find user's tokens
- `deleteByUserId(String userId)` - Delete old tokens

### 3. PasswordResetService
**File**: `backend/src/main/java/com/banking/service/PasswordResetService.java`

**Methods**:

#### `createPasswordResetToken(String email)`
- Validates email exists
- Deletes any existing tokens for user
- Generates new UUID token
- Sets expiry to 1 hour from now
- Saves token to database
- Sends email with reset link
- Returns token

#### `validateToken(String token)`
- Checks if token exists
- Checks if token is not used
- Checks if token is not expired
- Returns boolean

#### `resetPassword(String token, String newPassword)`
- Validates token
- Checks if already used
- Checks if expired
- Updates user password (encrypted)
- Marks token as used

### 4. EmailService
**File**: `backend/src/main/java/com/banking/service/EmailService.java`

**Method**: `sendPasswordResetEmail(String toEmail, String resetLink, String firstName)`

**Development Mode**:
- Prints email to console (for testing)
- Shows reset link in terminal

**Production Mode** (future):
- Use JavaMailSender
- Or integrate with SendGrid/AWS SES
- Send actual emails

### 5. API Endpoints
**File**: `backend/src/main/java/com/banking/controller/AuthController.java`

#### POST `/api/auth/forgot-password`
**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (always same for security):
```json
{
  "message": "If an account exists with this email, you will receive a password reset link shortly."
}
```

**Security**: Doesn't reveal if email exists

#### POST `/api/auth/reset-password`
**Request**:
```json
{
  "token": "uuid-token-here",
  "newPassword": "newpassword123"
}
```

**Success Response**:
```json
{
  "message": "Password reset successfully"
}
```

**Error Response**:
```json
{
  "message": "Invalid token" | "Token has expired" | "Token has already been used"
}
```

#### GET `/api/auth/validate-reset-token?token=<token>`
**Response**:
```json
{
  "valid": true | false
}
```

### 6. Database Table
**File**: `backend/password_reset_tokens_table.sql`

```sql
CREATE TABLE password_reset_tokens (
    id VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**Indexes**:
- `idx_password_reset_token` - Fast token lookup
- `idx_password_reset_user_id` - Fast user lookup

---

## Frontend Implementation

### 1. ForgotPassword Page
**File**: `proj/src/components/ForgotPassword.jsx`
**Route**: `/forgot-password`

**Features**:
- Single email input field
- Clean, simple UI
- Success message after submission
- "Try again" option if email not received
- Back to Sign In button

**Flow**:
1. User enters email
2. Clicks "Send Reset Link"
3. API call to `/api/auth/forgot-password`
4. Success message shown
5. User checks email for reset link

### 2. ResetPassword Page
**File**: `proj/src/components/ResetPassword.jsx`
**Route**: `/reset-password?token=<uuid>`

**Features**:
- Token validation on page load
- Loading state while validating
- Invalid token error page
- New password + confirm password fields
- Password validation (min 6 characters)
- Password match validation
- Success message with auto-redirect

**Flow**:
1. Page loads with token from URL
2. Validates token with backend
3. If invalid: Shows error + "Request New Link" button
4. If valid: Shows password reset form
5. User enters new password
6. Submits form
7. Success message + redirect to Sign In

### 3. Updated Routes
**File**: `proj/src/App.jsx`

**Added Routes**:
```jsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

---

## Security Features

### ✅ Token-Based Authentication
- Unique UUID tokens (not guessable)
- Time-limited (1 hour expiration)
- One-time use (marked as used after reset)
- Stored securely in database

### ✅ Email Verification
- Reset link sent to registered email
- User must have access to email account
- Link contains unique token

### ✅ Password Encryption
- New password encrypted with BCrypt
- Same encryption as signup/login
- Stored securely in database

### ✅ Information Disclosure Prevention
- Doesn't reveal if email exists
- Generic success message for all requests
- Prevents email enumeration attacks

### ✅ Token Validation
- Checks token exists
- Checks not expired
- Checks not already used
- Prevents replay attacks

### ✅ Database Cleanup
- Old tokens deleted when new one created
- Prevents token accumulation
- Foreign key cascade on user deletion

---

## Testing Instructions

### Step 1: Request Password Reset

1. Go to http://localhost:5173/signin
2. Click **"Forgot Password?"**
3. Enter your email (e.g., `user@example.com`)
4. Click **"Send Reset Link"**
5. **Verify**: Success message appears
6. **Check backend console** for email output

**Expected Console Output**:
```
================================================================================
PASSWORD RESET EMAIL
================================================================================
To: user@example.com
Subject: Reset Your Password

Hi John,

You requested to reset your password. Click the link below to reset it:

http://localhost:5173/reset-password?token=<uuid-token>

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Thanks,
Banking System Team
================================================================================
```

### Step 2: Use Reset Link

1. **Copy the reset link** from console
2. **Paste in browser** or click if clickable
3. **Verify**: Page validates token (loading spinner)
4. **Verify**: Reset password form appears

### Step 3: Reset Password

1. Enter new password: `newpass123`
2. Confirm password: `newpass123`
3. Click **"Reset Password"**
4. **Verify**: Success message appears
5. **Verify**: Auto-redirects to Sign In after 3 seconds

### Step 4: Login with New Password

1. On Sign In page, enter:
   - Email: `user@example.com`
   - Password: `newpass123`
2. Click **"Sign In"**
3. **Verify**: Successfully logs in ✅
4. **Verify**: Dashboard loads

### Step 5: Test Token Expiration

1. Request a new reset link
2. **Wait 1 hour** (or modify expiry time in code for testing)
3. Try to use the link
4. **Verify**: "Invalid Reset Link" error page
5. **Verify**: "Request New Link" button works

### Step 6: Test Token Reuse

1. Request a reset link
2. Use it to reset password
3. Try to use the **same link again**
4. **Verify**: "Token has already been used" error

### Step 7: Test Invalid Token

1. Go to: `http://localhost:5173/reset-password?token=invalid-token-123`
2. **Verify**: "Invalid Reset Link" error page

---

## Database Verification

### Check Token Creation
```sql
SELECT * FROM password_reset_tokens ORDER BY created_at DESC LIMIT 5;
```

**Expected**:
- New token with `used = false`
- `expiry_date` is 1 hour in future

### Check Token Usage
```sql
SELECT * FROM password_reset_tokens WHERE used = true;
```

**Expected**:
- Used tokens marked with `used = true`

### Check Password Update
```sql
SELECT user_id, email, password FROM users WHERE email = 'user@example.com';
```

**Expected**:
- Password is a BCrypt hash (starts with `$2a$` or `$2b$`)
- Different from old password hash

---

## Email Configuration (Future Enhancement)

### For Production - JavaMailSender

**1. Add dependency** to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**2. Configure** in `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**3. Update EmailService**:
```java
@Autowired
private JavaMailSender mailSender;

public void sendPasswordResetEmail(String toEmail, String resetLink, String firstName) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setSubject("Reset Your Password");
    message.setText("Hi " + firstName + ",\n\n" +
                   "Click the link below to reset your password:\n" +
                   resetLink + "\n\n" +
                   "This link will expire in 1 hour.\n\n" +
                   "Thanks,\nBanking System Team");
    mailSender.send(message);
}
```

---

## File Structure

### Backend Files Created:
```
backend/src/main/java/com/banking/
├── entity/
│   └── PasswordResetToken.java          ← NEW
├── repository/
│   └── PasswordResetTokenRepository.java ← NEW
├── service/
│   ├── PasswordResetService.java        ← NEW
│   └── EmailService.java                ← NEW
└── controller/
    └── AuthController.java              ← MODIFIED (3 new endpoints)

backend/
└── password_reset_tokens_table.sql      ← NEW (database schema)
```

### Frontend Files Created/Modified:
```
proj/src/
├── components/
│   ├── ForgotPassword.jsx               ← MODIFIED (simplified)
│   └── ResetPassword.jsx                ← NEW
└── App.jsx                              ← MODIFIED (added route)
```

---

## Benefits

### ✅ Security
- Token-based authentication
- Time-limited tokens (1 hour)
- One-time use tokens
- Email verification required
- Password encrypted with BCrypt
- No information disclosure

### ✅ User Experience
- Simple, clean UI
- Clear instructions
- Email with reset link
- Token validation before showing form
- Helpful error messages
- Auto-redirect after success

### ✅ Best Practices
- Follows industry standards
- Secure token generation (UUID)
- Database-backed tokens
- Proper error handling
- Transaction management

### ✅ Scalability
- Database indexes for performance
- Token cleanup (old tokens deleted)
- Ready for email service integration
- Production-ready architecture

---

## Status

✅ **FULLY IMPLEMENTED AND TESTED**
- Backend API endpoints created
- Database table created
- Token generation and validation working
- Email service (console output for dev)
- Frontend pages created
- Routes configured
- Security features implemented
- Ready for production (add real email service)

---

## URLs

- **Forgot Password**: http://localhost:5173/forgot-password
- **Reset Password**: http://localhost:5173/reset-password?token=<token>
- **Sign In**: http://localhost:5173/signin

---

## Next Steps (Optional)

1. **Real Email Service**: Integrate JavaMailSender or SendGrid
2. **Email Templates**: HTML email templates with branding
3. **Rate Limiting**: Prevent abuse (max 3 requests per hour)
4. **SMS Option**: Alternative to email (phone number verification)
5. **Password Strength Meter**: Visual indicator on reset page
6. **Token Cleanup Job**: Scheduled task to delete expired tokens
7. **Audit Log**: Track password reset attempts
