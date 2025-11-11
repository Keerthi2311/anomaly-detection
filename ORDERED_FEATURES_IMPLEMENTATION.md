# Ordered Features Implementation

## Changes Made

### Problem
1. Event stream message fields were in **random order** (HashMap doesn't preserve insertion order)
2. Fields didn't match the **dataset column order**
3. Missing **advanced features** (ip_reputation_score, velocity_score, device_trust_score, etc.)

### Solution

#### 1. Changed HashMap to LinkedHashMap
**File**: `backend/src/main/java/com/banking/service/EventStreamsService.java`

- `LinkedHashMap` preserves insertion order
- Fields are now added in the **exact order** of your dataset columns

#### 2. Implemented All Dataset Fields

**Dataset Column Order** (41 fields total):
```
1.  user_id
2.  session_id
3.  timestamp
4.  country
5.  city
6.  prev_country
7.  ip_address
8.  isp
9.  is_vpn
10. is_tor
11. is_proxy
12. is_datacenter_ip
13. ip_reputation_score          ← NEW (calculated)
14. device_fingerprint
15. device_type
16. time_since_last_login_hours  ← Placeholder (0.0)
17. distance_from_last_login_km  ← Placeholder (0.0)
18. login_attempts
19. failed_attempts
20. password_correct
21. time_to_login_seconds
22. is_breached_credential       ← Placeholder (0)
23. mfa_required
24. mfa_method                   ← NEW ("email_otp")
25. mfa_attempts
26. mfa_success
27. mfa_time_taken_seconds
28. mfa_method_changed           ← Placeholder (0)
29. push_notification_count      ← Placeholder (0)
30. hour_of_day
31. day_of_week
32. is_weekend
33. is_unusual_time
34. typing_speed_chars_per_min
35. mouse_movement_entropy
36. concurrent_sessions          ← Placeholder (1)
37. session_duration_last_minutes ← NEW (calculated)
38. velocity_score               ← NEW (calculated)
39. device_trust_score           ← NEW (calculated)
40. location_trust_score         ← NEW (calculated)
41. risk_score                   ← NEW (calculated)
```

#### 3. Added Calculated Advanced Features

**ip_reputation_score** (0-100):
- Starts at 100
- -30 if VPN detected
- -20 if proxy detected
- -25 if datacenter IP
- -10 if cloud provider ISP (AWS, GCP, Azure, etc.)

**session_duration_last_minutes**:
- `(time_to_login_seconds + mfa_time_taken_seconds) / 60`

**velocity_score** (0-100):
- Base: 50
- +5 per failed attempt (max +40)
- Increases if typing speed is slow

**device_trust_score** (0-100):
- Starts at 100
- -50 if datacenter IP
- -20 if proxy
- -20 if VPN

**location_trust_score** (0-100):
- Starts at 100
- -30 if unusual time
- -10 if weekend
- -30 if country changed from previous login

**risk_score** (0-100):
- Weighted combination:
  - 35% device trust (inverted)
  - 25% location trust (inverted)
  - 25% IP reputation (inverted)
  - 15% velocity score

## Event Stream Message Format

### Before (Random Order)
```json
{
  "records": [{
    "value": {
      "login_is_tor": 0,
      "mfa_session_id": "...",
      "balance_after": -34949.5,
      "failed_attempts": 0,
      ...
    }
  }]
}
```

### After (Ordered, Matching Dataset)
```json
{
  "records": [{
    "value": {
      "user_id": "831a8243-67e6-4a5e-9826-3694f4ba0c71",
      "session_id": "SESSION-562873f5-5066-428d-9318-5152b9a9a314",
      "timestamp": "2025-11-10T09:33:45.211",
      "country": "United States",
      "city": "New York",
      "prev_country": "United States",
      "ip_address": "192.168.1.100",
      "isp": "Comcast Cable",
      "is_vpn": 0,
      "is_tor": 0,
      "is_proxy": 0,
      "is_datacenter_ip": 0,
      "ip_reputation_score": 100,
      "device_fingerprint": "FP-1234567890",
      "device_type": "desktop",
      "time_since_last_login_hours": 0.0,
      "distance_from_last_login_km": 0.0,
      "login_attempts": 1,
      "failed_attempts": 0,
      "password_correct": 1,
      "time_to_login_seconds": 12.456,
      "is_breached_credential": 0,
      "mfa_required": 1,
      "mfa_method": "email_otp",
      "mfa_attempts": 1,
      "mfa_success": 1,
      "mfa_time_taken_seconds": 8.234,
      "mfa_method_changed": 0,
      "push_notification_count": 0,
      "hour_of_day": 9,
      "day_of_week": 1,
      "is_weekend": 0,
      "is_unusual_time": 0,
      "typing_speed_chars_per_min": 285.5,
      "mouse_movement_entropy": 0.823,
      "concurrent_sessions": 1,
      "session_duration_last_minutes": 0.345,
      "velocity_score": 50,
      "device_trust_score": 100,
      "location_trust_score": 100,
      "risk_score": 12
    }
  }]
}
```

## Data Types (No Quotes for Numbers)

JSON automatically handles proper formatting:
- **Strings**: `"user_id": "831a8243-..."`  ← Has quotes
- **Numbers**: `"is_vpn": 0`  ← No quotes
- **Decimals**: `"typing_speed_chars_per_min": 285.5`  ← No quotes
- **Booleans**: `"fraud_flag": false`  ← No quotes
- **Null**: `"prev_country": null`  ← No quotes

## Placeholder Fields

Some fields are placeholders (not yet tracked in the system):
- `time_since_last_login_hours`: 0.0
- `distance_from_last_login_km`: 0.0
- `is_breached_credential`: 0
- `mfa_method_changed`: 0
- `push_notification_count`: 0
- `concurrent_sessions`: 1

These can be enhanced later when the tracking is implemented.

## Testing

### Step 1: Login
1. Open http://localhost:5173
2. Sign in with credentials
3. Complete MFA

### Step 2: Create Transaction
1. Go to Dashboard
2. Create a new transaction

### Step 3: Check Event Stream
The message will now have:
- ✅ **Exact dataset column order**
- ✅ **All 41 fields**
- ✅ **Calculated advanced features**
- ✅ **Proper data types** (numbers without quotes)

### Step 4: Verify Order
Compare the event stream message field order with your dataset columns - they should match exactly!

## Benefits

1. **Consistent Order**: Fields always appear in the same order
2. **Dataset Compatible**: Can be directly imported into your ML pipeline
3. **Complete Features**: All 41 dataset columns included
4. **Calculated Metrics**: Advanced features computed from raw data
5. **Type Safety**: Numbers sent as numbers, not strings

## Files Modified

- `backend/src/main/java/com/banking/service/EventStreamsService.java`
  - Changed HashMap → LinkedHashMap
  - Reordered fields to match dataset
  - Added 6 calculated advanced features
  - Added 6 placeholder fields

## Status

✅ **IMPLEMENTED AND DEPLOYED**
- Backend reloaded successfully
- Field order matches dataset exactly
- All 41 fields included
- Advanced features calculated
- Ready for testing
