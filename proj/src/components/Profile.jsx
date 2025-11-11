import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Column,
  Stack,
  Heading,
  Tile,
  Button,
  TextInput,
  Select,
  SelectItem,
  InlineNotification,
  Tag,
  Loading,
} from '@carbon/react'
import { ArrowLeft, Edit, Save, Close } from '@carbon/icons-react'
import { getCurrentUser, updateUser, getCurrentUserAccount } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [accountInfo, setAccountInfo] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    email: '',
    phone_number: '',
    country: '',
    city: '',
    state: '',
    occupation: '',
    income_range: '',
    preferred_language: 'en',
    registered_device_list: [],
    last_password_change_timestamp: '',
  })

  const languages = [
    { value: 'en', text: 'English' },
    { value: 'es', text: 'Spanish' },
    { value: 'fr', text: 'French' },
    { value: 'de', text: 'German' },
    { value: 'hi', text: 'Hindi' },
    { value: 'zh', text: 'Chinese' },
  ]

  const incomeOptions = [
    { value: '0-25000', text: '$0 - $25,000' },
    { value: '25001-50000', text: '$25,001 - $50,000' },
    { value: '50001-100000', text: '$50,001 - $100,000' },
    { value: '100001-200000', text: '$100,001 - $200,000' },
    { value: '200001+', text: '$200,001+' },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to fetch from backend first
        const userData = await getCurrentUser()
        setUser(userData)
        
        // Get account info from localStorage or use defaults
        const accountData = localStorage.getItem('account_info')
        if (accountData) {
          setAccountInfo(JSON.parse(accountData))
        }
        
        // Initialize profile data from backend user data
        setProfileData({
          email: userData.email || '',
          phone_number: userData.phoneNumber || userData.phone_number || '',
          country: userData.country || '',
          city: userData.city || '',
          state: userData.state || '',
          occupation: userData.occupation || '',
          income_range: userData.incomeRange || userData.income_range || '',
          preferred_language: userData.preferredLanguage || userData.preferred_language || 'en',
          registered_device_list: userData.registered_device_list || ['DEV1234', 'DEV5678'],
          last_password_change_timestamp: userData.lastPasswordChange || userData.last_password_change_timestamp || new Date().toISOString(),
        })
        
        // Fetch account information
        try {
          const accountData = await getCurrentUserAccount()
          setAccountInfo({
            account_number: accountData.accountNumber || 'N/A',
            balance: accountData.accountBalance ? parseFloat(accountData.accountBalance).toFixed(2) : '0.00',
            account_type: accountData.accountType || 'N/A',
          })
        } catch (accountError) {
          console.error('Failed to fetch account:', accountError)
          // Use localStorage fallback
          const accountData = localStorage.getItem('account_info')
          if (accountData) {
            setAccountInfo(JSON.parse(accountData))
          }
        }
        
        // Update localStorage for consistency
        localStorage.setItem('current_user', JSON.stringify(userData))
      } catch (error) {
        console.error('Failed to fetch user data from backend:', error)
        
        // Fallback to localStorage
        const currentUserJson = localStorage.getItem('current_user')
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson)
          setUser(currentUser)
          
          // Get account info from localStorage
          const accountData = localStorage.getItem('account_info')
          if (accountData) {
            setAccountInfo(JSON.parse(accountData))
          }
          
          // Initialize profile data
          setProfileData({
            email: currentUser.email || '',
            phone_number: currentUser.phoneNumber || currentUser.phone_number || '',
            country: currentUser.country || '',
            city: currentUser.city || '',
            state: currentUser.state || '',
            occupation: currentUser.occupation || '',
            income_range: currentUser.incomeRange || currentUser.income_range || '',
            preferred_language: currentUser.preferredLanguage || currentUser.preferred_language || 'en',
            registered_device_list: currentUser.registered_device_list || ['DEV1234', 'DEV5678'],
            last_password_change_timestamp: currentUser.lastPasswordChange || currentUser.last_password_change_timestamp || new Date().toISOString(),
          })
        } else {
          navigate('/signin')
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [navigate])

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original data
    const currentUserJson = localStorage.getItem('current_user')
    if (currentUserJson) {
      const currentUser = JSON.parse(currentUserJson)
      setProfileData({
        email: currentUser.email || '',
        phone_number: currentUser.phoneNumber || currentUser.phone_number || '',
        country: currentUser.country || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        occupation: currentUser.occupation || '',
        income_range: currentUser.incomeRange || currentUser.income_range || '',
        preferred_language: currentUser.preferredLanguage || currentUser.preferred_language || 'en',
        registered_device_list: currentUser.registered_device_list || ['DEV1234', 'DEV5678'],
        last_password_change_timestamp: currentUser.lastPasswordChange || currentUser.last_password_change_timestamp || new Date().toISOString(),
      })
    }
  }

  const handleSave = async () => {
    try {
      // Update backend first
      const updatedUser = {
        ...user,
        ...profileData,
      }
      
      await updateUser(updatedUser)
      
      // Update localStorage for consistency
      localStorage.setItem('current_user', JSON.stringify(updatedUser))
      
      // Update users list in storage
      const users = JSON.parse(localStorage.getItem('banking_users') || '[]')
      const updatedUsers = users.map((u) => 
        u.user_id === user.user_id ? updatedUser : u
      )
      localStorage.setItem('banking_users', JSON.stringify(updatedUsers))
      
      setUser(updatedUser)
      setIsEditing(false)
      setShowSuccess(true)
      
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update user profile:', error)
      // Fallback to localStorage only
      const updatedUser = {
        ...user,
        ...profileData,
      }
      localStorage.setItem('current_user', JSON.stringify(updatedUser))
      
      // Update users list in storage
      const users = JSON.parse(localStorage.getItem('banking_users') || '[]')
      const updatedUsers = users.map((u) => 
        u.user_id === user.user_id ? updatedUser : u
      )
      localStorage.setItem('banking_users', JSON.stringify(updatedUsers))
      
      setUser(updatedUser)
      setIsEditing(false)
      setShowSuccess(true)
      
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const handleChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loading description="Loading profile..." withOverlay={false} />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Stack gap={4}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Button kind="ghost" size="sm" onClick={handleBack} renderIcon={ArrowLeft}>
                Back
              </Button>
              <Heading>Profile</Heading>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} renderIcon={Edit}>
                Edit Profile
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button kind="secondary" onClick={handleCancel} renderIcon={Close}>
                  Cancel
                </Button>
                <Button kind="primary" onClick={handleSave} renderIcon={Save}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          {/* Success Notification */}
          {showSuccess && (
            <InlineNotification
              kind="success"
              title="Profile Updated"
              subtitle="Your profile has been updated successfully."
              lowContrast
              onClose={() => setShowSuccess(false)}
            />
          )}

          {/* Name Display */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Name</h3>
            <p style={{ fontSize: '0.9375rem', color: '#6f6f6f' }}>
              {user.firstName || user.first_name || ''} {user.lastName || user.last_name || ''}
            </p>
          </Tile>

          {/* User ID Display */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>User ID</h3>
            <p style={{ fontSize: '0.9375rem', color: '#6f6f6f' }}>{user.userId || user.user_id || 'N/A'}</p>
          </Tile>

          {/* Account Information */}
          {accountInfo && (
            <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Account Information</Heading>
              <Grid narrow>
                <Column lg={16} md={8} sm={4}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                      Account Number
                    </label>
                    <p style={{ fontSize: '0.9375rem', color: '#6f6f6f', margin: 0 }}>{accountInfo.account_number || 'N/A'}</p>
                  </div>
                </Column>
                <Column lg={16} md={8} sm={4}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                      Account Balance
                    </label>
                    <p style={{ fontSize: '0.9375rem', color: '#6f6f6f', margin: 0 }}>${accountInfo.balance || '0.00'}</p>
                  </div>
                </Column>
                <Column lg={16} md={8} sm={4}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                      Account Type
                    </label>
                    <p style={{ fontSize: '0.9375rem', color: '#6f6f6f', margin: 0 }}>{accountInfo.account_type || 'Checking'}</p>
                  </div>
                </Column>
              </Grid>
            </Tile>
          )}

          {/* Contact Information */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Contact Information</Heading>
            <Grid narrow>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="email"
                  labelText="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="phone_number"
                  labelText="Phone Number"
                  type="tel"
                  value={profileData.phone_number || user.phoneNumber || user.phone_number || ''}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  disabled={!isEditing}
                />
              </Column>
            </Grid>
          </Tile>

          {/* Address */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Address</Heading>
            <Grid narrow>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="country"
                  labelText="Country"
                  value={profileData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  disabled={!isEditing}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="city"
                  labelText="City"
                  value={profileData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="state"
                  labelText="State"
                  value={profileData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={!isEditing}
                />
              </Column>
            </Grid>
          </Tile>

          {/* Professional Information */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Professional Information</Heading>
            <Grid narrow>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="occupation"
                  labelText="Occupation"
                  value={profileData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  disabled={!isEditing}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <Select
                  id="income_range"
                  labelText="Income Range"
                  value={profileData.income_range || user.incomeRange || user.income_range || ''}
                  onChange={(e) => handleChange('income_range', e.target.value)}
                  disabled={!isEditing}
                >
                  <SelectItem value="" text="Select income range" />
                  {incomeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} text={option.text} />
                  ))}
                </Select>
              </Column>
            </Grid>
          </Tile>

          {/* Preferences */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Preferences</Heading>
            <Grid narrow>
              <Column lg={16} md={8} sm={4}>
                <Select
                  id="preferred_language"
                  labelText="Preferred Language"
                  value={profileData.preferred_language}
                  onChange={(e) => handleChange('preferred_language', e.target.value)}
                  disabled={!isEditing}
                >
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} text={lang.text} />
                  ))}
                </Select>
              </Column>
            </Grid>
          </Tile>

          {/* Security Information */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Security</Heading>
            <Grid narrow>
              <Column lg={16} md={8} sm={4}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Registered Devices
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {profileData.registered_device_list.map((device, idx) => (
                      <Tag key={idx} type="blue">{device}</Tag>
                    ))}
                  </div>
                </div>
                <TextInput
                  id="last_password_change"
                  labelText="Last Password Change"
                  type="text"
                  value={new Date(profileData.last_password_change_timestamp).toLocaleString()}
                  disabled
                />
              </Column>
            </Grid>
          </Tile>
        </Stack>
      </div>
    </div>
  )
}


