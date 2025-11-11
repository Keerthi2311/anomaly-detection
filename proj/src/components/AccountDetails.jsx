import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Column,
  Stack,
  Heading,
  Tile,
  Button,
  Loading,
} from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'
import { getCurrentUser, getCurrentUserAccount } from '../services/api'

export default function AccountDetails() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [accountInfo, setAccountInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
        
        try {
          const accountData = await getCurrentUserAccount()
          setAccountInfo({
            account_balance: accountData.accountBalance ? parseFloat(accountData.accountBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            account_number: accountData.accountNumber || 'N/A',
            account_type: accountData.accountType || 'N/A',
            currency_preference: accountData.currencyPreference || 'USD',
            last_login_timestamp: new Date().toISOString(),
          })
        } catch (accountError) {
          console.error('Failed to fetch account:', accountError)
          const storedAccountNumber = localStorage.getItem('account_number')
          const storedBalance = localStorage.getItem('account_balance')
          setAccountInfo({
            account_balance: storedBalance ? parseFloat(storedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            account_number: storedAccountNumber || 'N/A',
            account_type: 'N/A',
            currency_preference: 'USD',
            last_login_timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        navigate('/signin')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [navigate])

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
        <Loading description="Loading account details..." withOverlay={false} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f62fe 0%, #0043ce 100%)', 
        padding: '2rem 1rem', 
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
            style={{ color: 'white', marginBottom: '1rem' }}
          >
            Back to Dashboard
          </Button>
          <Heading style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
            Account Details
          </Heading>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
            View your account information and settings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Grid narrow>
          <Column lg={8} md={6} sm={4}>
            <Stack gap={6}>
              {/* Personal Information */}
              <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#393939' }}>Personal Information</h3>
                <Stack gap={4}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {user?.firstName || user?.first_name || ''} {user?.lastName || user?.last_name || ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {user?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {user?.phoneNumber || user?.phone_number || 'N/A'}
                    </p>
                  </div>
                </Stack>
              </Tile>

              {/* Account Information */}
              <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#393939' }}>Account Information</h3>
                <Stack gap={4}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Number</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {accountInfo?.account_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Type</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {accountInfo?.account_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Balance</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f62fe' }}>
                      ${accountInfo?.account_balance || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Currency</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {accountInfo?.currency_preference || 'USD'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Login</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#393939' }}>
                      {accountInfo ? formatTimestamp(accountInfo.last_login_timestamp) : 'N/A'}
                    </p>
                  </div>
                </Stack>
              </Tile>
            </Stack>
          </Column>
        </Grid>
      </div>
    </div>
  )
}
