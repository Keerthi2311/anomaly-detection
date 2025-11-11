# EmailJS Setup Guide - Password Reset Template

## Overview
This guide shows you how to create an EmailJS template for password reset emails, exactly like the OTP template you already have.

---

## Step 1: Login to EmailJS

1. Go to https://www.emailjs.com/
2. Login with your account
3. Go to **Email Templates** section

---

## Step 2: Create New Template

1. Click **"Create New Template"**
2. Template Name: `Password Reset`
3. Template ID: `template_reset_pwd` (or any ID you prefer)

---

## Step 3: Email Template Content

### Subject Line:
```
Reset Your Password - Banking System
```

### Email Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #0f62fe;
            margin: 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #0f62fe;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background-color: #0043ce;
        }
        .info-box {
            background-color: #f4f4f4;
            padding: 15px;
            border-left: 4px solid #0f62fe;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
        .warning {
            color: #da1e28;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            
            <p>Hi <strong>{{user_name}}</strong>,</p>
            
            <p>We received a request to reset your password for your Banking System account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="{{reset_link}}" class="button">Reset Password</a>
            </div>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>⏰ This link will expire at:</strong></p>
                <p style="margin: 5px 0 0 0;">{{expiry_time}}</p>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 4px;">
                {{reset_link}}
            </p>
            
            <p class="warning">⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, this link will expire in 1 hour.</p>
            
            <p>Thanks,<br>
            <strong>Banking System Team</strong></p>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; 2025 Banking System. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## Step 4: Template Variables

Make sure these variables are defined in your template:

1. **{{user_name}}** - Recipient's first name
2. **{{reset_link}}** - Password reset link with token
3. **{{expiry_time}}** - When the link expires
4. **{{to_email}}** - Recipient's email (auto-filled by EmailJS)

---

## Step 5: Test Template

1. Click **"Test It"** button in EmailJS
2. Fill in test values:
   - `user_name`: John
   - `reset_link`: http://localhost:5173/reset-password?token=test-123
   - `expiry_time`: 11/10/2025, 7:30:00 PM
   - `to_email`: your-email@example.com
3. Send test email
4. Check your inbox

---

## Step 6: Update .env File

The `.env` file has already been updated with:

```env
VITE_EMAILJS_SERVICE_ID=service_rnxvvbl
VITE_EMAILJS_TEMPLATE_ID=template_ci7omph
VITE_EMAILJS_RESET_TEMPLATE_ID=template_reset_pwd
VITE_EMAILJS_PUBLIC_KEY=m3trRX1QPY1oVL5HN
```

**Important**: If you used a different template ID in EmailJS, update `VITE_EMAILJS_RESET_TEMPLATE_ID` to match.

---

## Step 7: Restart Frontend

After updating `.env`, restart the frontend:

```bash
# Stop the current frontend (Ctrl+C)
# Then restart:
cd proj
npm run dev
```

---

## How It Works

### Flow:
```
1. User enters email on Forgot Password page
   ↓
2. Frontend calls backend: POST /api/auth/forgot-password
   ↓
3. Backend:
   - Validates email exists
   - Generates UUID token
   - Saves token to database
   - Returns: { token, userName, email }
   ↓
4. Frontend receives token data
   ↓
5. Frontend calls EmailJS API directly:
   - Service ID: service_rnxvvbl
   - Template ID: template_reset_pwd
   - Variables: user_name, reset_link, expiry_time
   ↓
6. EmailJS sends email to user
   ↓
7. User receives email with reset link
   ↓
8. User clicks link → Reset Password page
   ↓
9. User resets password ✅
```

---

## Template Parameters Mapping

| EmailJS Variable | Source | Example |
|-----------------|--------|---------|
| `to_email` | User's email from backend | user@example.com |
| `user_name` | User's first name from backend | John |
| `reset_link` | Generated by frontend | http://localhost:5173/reset-password?token=abc-123 |
| `expiry_time` | Current time + 1 hour | 11/10/2025, 7:30:00 PM |

---

## Testing

### Test the Complete Flow:

1. **Go to Forgot Password page**:
   ```
   http://localhost:5173/forgot-password
   ```

2. **Enter your email** (must be registered in the system)

3. **Click "Send Reset Link"**

4. **Check your email inbox**:
   - Subject: "Reset Your Password - Banking System"
   - Should have a blue "Reset Password" button
   - Should show expiry time

5. **Click the reset link** in the email

6. **Enter new password** on the reset page

7. **Login with new password** ✅

---

## Troubleshooting

### Email Not Received?

1. **Check spam folder**
2. **Verify EmailJS template ID** matches `.env` file
3. **Check EmailJS dashboard** for send logs
4. **Verify email exists** in your database
5. **Check browser console** for errors

### EmailJS Error?

1. **Check .env variables** are correct
2. **Restart frontend** after changing .env
3. **Verify EmailJS account** is active
4. **Check monthly quota** (free tier has limits)

### Token Invalid?

1. **Check token expiry** (1 hour from creation)
2. **Don't reuse tokens** (one-time use only)
3. **Check database** for token record

---

## Email Preview

Your users will receive an email that looks like this:

```
┌─────────────────────────────────────────────┐
│         🔐 Password Reset Request           │
├─────────────────────────────────────────────┤
│                                             │
│ Hi John,                                    │
│                                             │
│ We received a request to reset your        │
│ password for your Banking System account.  │
│                                             │
│        ┌─────────────────────┐             │
│        │   Reset Password    │  ← Button   │
│        └─────────────────────┘             │
│                                             │
│ ⏰ This link will expire at:                │
│ 11/10/2025, 7:30:00 PM                     │
│                                             │
│ Or copy and paste this link:               │
│ http://localhost:5173/reset-password?...   │
│                                             │
│ ⚠️ If you didn't request this, ignore it.  │
│                                             │
│ Thanks,                                     │
│ Banking System Team                         │
└─────────────────────────────────────────────┘
```

---

## Production Considerations

### For Production Deployment:

1. **Update reset link URL** in code:
   ```javascript
   const resetLink = `https://yourdomain.com/reset-password?token=${data.token}`
   ```

2. **Use environment variables** for URLs:
   ```env
   VITE_APP_URL=https://yourdomain.com
   ```

3. **Monitor EmailJS quota**:
   - Free tier: 200 emails/month
   - Paid tier: Unlimited

4. **Add rate limiting**:
   - Max 3 reset requests per hour per email
   - Prevent abuse

5. **Email deliverability**:
   - Configure SPF/DKIM records
   - Use verified domain
   - Monitor bounce rates

---

## Comparison: OTP vs Password Reset

| Feature | OTP Email | Password Reset Email |
|---------|-----------|---------------------|
| Template ID | `template_ci7omph` | `template_reset_pwd` |
| Variables | `otp_code`, `time` | `reset_link`, `user_name`, `expiry_time` |
| Expiry | 15 minutes | 1 hour |
| Purpose | MFA verification | Password reset |
| Trigger | After login | Forgot password page |

---

## Status

✅ Backend updated to return token data  
✅ Frontend updated to use EmailJS  
✅ .env file configured  
⏳ **Next: Create EmailJS template** (follow steps above)  
⏳ **Then: Restart frontend and test**

---

## Support

If you encounter issues:
1. Check EmailJS dashboard logs
2. Verify all template variables are correct
3. Test with EmailJS "Test It" feature first
4. Check browser console for errors
5. Verify .env file is loaded (restart frontend)
