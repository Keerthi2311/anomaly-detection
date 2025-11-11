// API service for backend communication
const API_BASE_URL = '/api'

/**
 * Signup a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Response with token and user info
 */
export const signup = async (userData) => {
  try {
    // Validate required fields
    if (!userData.first_name || !userData.first_name.trim()) {
      throw new Error('First name is required')
    }
    if (!userData.last_name || !userData.last_name.trim()) {
      throw new Error('Last name is required')
    }
    if (!userData.email || !userData.email.trim()) {
      throw new Error('Email is required')
    }
    if (!userData.password) {
      throw new Error('Password is required')
    }
    if (!userData.phone_number || !userData.phone_number.trim()) {
      throw new Error('Phone number is required')
    }

    // Map frontend field names to backend entity field names (backend expects camelCase)
    const backendPayload = {
      email: userData.email.trim(),
      password: userData.password,
      firstName: userData.first_name.trim(),
      lastName: userData.last_name.trim(),
      phoneNumber: userData.phone_number,
      country: userData.country || '',
      state: userData.state || '',
      city: userData.city || '',
      postalCode: userData.postal_code || '',
      accountType: userData.account_type,
      currencyPreference: userData.currency_preference,
      occupation: userData.occupation || '',
      incomeRange: userData.income_range || '',
      dateOfBirth: (() => {
        if (!userData.date_of_birth) return null
        try {
          if (userData.date_of_birth instanceof Date) {
            return userData.date_of_birth.toISOString()
          }
          if (typeof userData.date_of_birth === 'string') {
            const date = new Date(userData.date_of_birth)
            if (isNaN(date.getTime())) {
              console.warn('Invalid date format:', userData.date_of_birth)
              return null
            }
            return date.toISOString()
          }
          // Handle Carbon DatePicker format (array of dates)
          if (Array.isArray(userData.date_of_birth) && userData.date_of_birth.length > 0) {
            const date = new Date(userData.date_of_birth[0])
            if (isNaN(date.getTime())) {
              console.warn('Invalid date in array:', userData.date_of_birth[0])
              return null
            }
            return date.toISOString()
          }
          return null
        } catch (e) {
          console.warn('Error parsing date:', e)
          return null
        }
      })(),
      gender: userData.gender || '',
      preferredLanguage: userData.preferred_language || '',
    }

    console.log('Signup payload being sent:', JSON.stringify(backendPayload, null, 2))
    
    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let response
    try {
      response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (networkError) {
      clearTimeout(timeoutId)
      console.error('Network error:', networkError)
      if (networkError.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.')
      }
      throw new Error('Failed to connect to server. Please make sure the backend is running on http://localhost:8080')
    }

    let data
    try {
      const text = await response.text()
      if (!text) {
        throw new Error('Empty response from server')
      }
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('Response parse error:', parseError)
      throw new Error('Invalid response from server. Please check the backend logs.')
    }

    if (!response.ok) {
      throw new Error(data.message || `Signup failed with status ${response.status}`)
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_id', data.userId)
      localStorage.setItem('user_email', data.email)
    }

    return data
  } catch (error) {
    console.error('Signup error:', error)
    // Provide a more user-friendly error message
    if (error.message) {
      throw error
    } else {
      throw new Error('Failed to create account. Please try again or check your connection.')
    }
  }
}
/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token')
}

// Duplicate getAuthToken function removed - already defined above

/**
 * Login user
 * @param {string} emailOrPhone - Email or phone number
 * @param {string} password - User password
 * @returns {Promise<Object>} Response with token and user info
 */
export const login = async (emailOrPhone, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: typeof emailOrPhone === 'string' ? emailOrPhone.trim() : emailOrPhone,
        password: typeof password === 'string' ? password.trim() : password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.userId);
      localStorage.setItem('user_email', data.email);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid credentials');
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

/**
 * Get current user account information
 * @returns {Promise<Object>} Account data
 */
export const getCurrentUserAccount = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/me/account`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch account information')
    }

    return await response.json()
  } catch (error) {
    console.error('Get current user account error:', error)
    throw error
  }
}

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userData) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Failed to update user profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Update user error:', error)
    throw error
  }
}

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
}

/**
 * Get user transactions
 * @returns {Promise<Array>} User transactions
 */
export const getUserTransactions = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }

    return await response.json()
  } catch (error) {
    console.error('Get user transactions error:', error)
    throw error
  }
}

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Map possible snake_case keys to backend camelCase entity fields
    const payload = {
      transactionType: transactionData.transactionType || transactionData.transaction_type,
      merchantName: transactionData.merchantName || transactionData.merchant_name,
      merchantCategory: transactionData.merchantCategory || transactionData.merchant_category,
      amount: typeof transactionData.amount === 'number' ? transactionData.amount : Number(transactionData.amount),
      currency: transactionData.currency,
      deviceId: transactionData.deviceId || transactionData.device_id,
      transactionCountry: transactionData.transactionCountry || transactionData.transaction_country,
      transactionCity: transactionData.transactionCity || transactionData.transaction_city,
      channel: transactionData.channel,
      status: transactionData.status || 'success',
      fraudFlag: transactionData.fraud_flag ?? transactionData.fraudFlag ?? false,
      timestamp: transactionData.timestamp || undefined,
    }

    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to create transaction')
    }

    return await response.json()
  } catch (error) {
    console.error('Create transaction error:', error)
    throw error
  }
}

/**
 * Get stored auth token
 * @returns {string|null} Auth token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

/**
 * Save login features to backend
 * @param {Object} loginFeatures - Login features data
 * @returns {Promise<Object>} Saved login features
 */
export const saveLoginFeatures = async (loginFeatures) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Map snake_case to camelCase for backend
    const payload = {
      sessionId: loginFeatures.session_id,
      timestamp: loginFeatures.timestamp,
      country: loginFeatures.country,
      city: loginFeatures.city,
      ipAddress: loginFeatures.ip_address,
      isp: loginFeatures.isp,
      isVpn: loginFeatures.is_vpn,
      isTor: loginFeatures.is_tor,
      isProxy: loginFeatures.is_proxy,
      isDatacenterIp: loginFeatures.is_datacenter_ip,
      deviceFingerprint: loginFeatures.device_fingerprint,
      deviceType: loginFeatures.device_type,
      loginAttempts: loginFeatures.login_attempts,
      failedAttempts: loginFeatures.failed_attempts,
      passwordCorrect: loginFeatures.password_correct,
      hourOfDay: loginFeatures.hour_of_day,
      dayOfWeek: loginFeatures.day_of_week,
      isWeekend: loginFeatures.is_weekend,
      isUnusualTime: loginFeatures.is_unusual_time,
      typingSpeedCharsPerMin: loginFeatures.typing_speed_chars_per_min,
      mouseMovementEntropy: loginFeatures.mouse_movement_entropy,
      timeToLoginSeconds: loginFeatures.time_to_login_seconds,
      previousCountry: loginFeatures.prev_country || loginFeatures.country,
    }

    const response = await fetch(`${API_BASE_URL}/login-features`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to save login features')
    }

    return await response.json()
  } catch (error) {
    console.error('Save login features error:', error)
    // Don't throw - make it non-blocking
    return null
  }
}

/**
 * Save MFA features to backend
 * @param {Object} mfaFeatures - MFA features data
 * @returns {Promise<Object>} Saved MFA features
 */
export const saveMFAFeatures = async (mfaFeatures) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Map snake_case to camelCase for backend
    const payload = {
      sessionId: mfaFeatures.session_id,
      timestamp: mfaFeatures.timestamp,
      mfaRequired: mfaFeatures.mfa_required,
      mfaAttempts: mfaFeatures.mfa_attempts,
      mfaSuccess: mfaFeatures.mfa_success,
      mfaTimeTakenSeconds: mfaFeatures.mfa_time_taken_seconds,
    }

    const response = await fetch(`${API_BASE_URL}/mfa-features`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to save MFA features')
    }

    return await response.json()
  } catch (error) {
    console.error('Save MFA features error:', error)
    // Don't throw - make it non-blocking
    return null
  }
}

