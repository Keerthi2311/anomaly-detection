// Storage service for user data management
const USERS_KEY = 'banking_users'

export const storageService = {
  // Save user data
  saveUser: (userData) => {
    const users = storageService.getAllUsers()
    users.push(userData)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  },

  // Get all users
  getAllUsers: () => {
    const usersJson = localStorage.getItem(USERS_KEY)
    return usersJson ? JSON.parse(usersJson) : []
  },

  // Find user by email or phone
  findUserByEmailOrPhone: (emailOrPhone) => {
    const users = storageService.getAllUsers()
    return users.find((user) => user.email === emailOrPhone || user.phone_number === emailOrPhone)
  },

  // Verify credentials
  verifyCredentials: (emailOrPhone, password) => {
    const user = storageService.findUserByEmailOrPhone(emailOrPhone)
    if (!user) return null
    return user.password === password ? user : null
  },

  // Clear all users (for testing)
  clearAllUsers: () => {
    localStorage.removeItem(USERS_KEY)
  },
}


