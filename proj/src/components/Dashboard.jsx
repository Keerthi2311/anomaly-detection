import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Column,
  Stack,
  Heading,
  Tile,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  InlineNotification,
  Tag,
} from '@carbon/react'
import { View, ViewOff, Send, Receipt, Finance, QrCode, OverflowMenuVertical } from '@carbon/icons-react'
import { transactionService } from '../services/transactions'
import { getCurrentUser, getUserTransactions, getCurrentUserAccount, createTransaction } from '../services/api'
import { Modal, NumberInput, TextInput, Select, SelectItem, Loading } from '@carbon/react'

// Mock transaction data generator
const generateMockTransactions = () => {
  const merchants = ['Amazon', 'Walmart', 'Starbucks', 'Shell', 'McDonald\'s', 'Target', 'Best Buy', 'AT&T']
  const channels = ['web', 'app', 'ATM', 'POS']
  const statuses = ['success', 'failed', 'pending']
  const transactionTypes = ['credit', 'debit']
  const countries = ['USA', 'India', 'UK', 'Canada']
  const cities = ['New York', 'Mumbai', 'London', 'Toronto']
  const fraudFlags = [true, false]
  
  const transactions = []
  for (let i = 1; i <= 10; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    transactions.push({
      id: `TXN${String(i).padStart(6, '0')}`,
      timestamp: timestamp.toISOString(),
      transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      merchant_category: merchants[Math.floor(Math.random() * merchants.length)],
      amount: (Math.random() * 5000 + 10).toFixed(2),
      currency: 'USD',
      device_id: `DEV${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      transaction_country: countries[Math.floor(Math.random() * countries.length)],
      transaction_city: cities[Math.floor(Math.random() * cities.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fraud_flag: Math.random() > 0.7,
    })
  }
  return transactions
}

const headers = [
  { key: 'timestamp', header: 'Timestamp' },
  { key: 'transaction_type', header: 'Type' },
  { key: 'merchant_category', header: 'Merchant' },
  { key: 'amount', header: 'Amount' },
  { key: 'currency', header: 'Currency' },
  { key: 'device_id', header: 'Device ID' },
  { key: 'transaction_city', header: 'City' },
  { key: 'channel', header: 'Channel' },
  { key: 'status', header: 'Status' },
  { key: 'fraud_flag', header: 'Fraud Flag' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [accountInfo, setAccountInfo] = useState(null)
  const [showBalance, setShowBalance] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendForm, setSendForm] = useState({ merchant_name: '', amount: 0, currency: 'USD' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Load any cached transactions immediately to avoid empty UI
    const cachedTransactions = localStorage.getItem('recent_transactions')
    if (cachedTransactions) {
      try {
        const parsed = JSON.parse(cachedTransactions)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed)
        }
      } catch (err) {
        console.warn('Failed to parse cached transactions:', err)
      }
    }

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userData = await getCurrentUser()
        setUser(userData)
        
        // Store user data in localStorage for consistency
        localStorage.setItem('current_user', JSON.stringify(userData))
        
        // Fetch account information
        try {
          const accountData = await getCurrentUserAccount()
          setAccountInfo({
            account_balance: accountData.accountBalance ? parseFloat(accountData.accountBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            account_number: accountData.accountNumber || 'N/A',
            account_type: accountData.accountType || 'N/A',
            currency_preference: accountData.currencyPreference || 'USD',
            last_login_timestamp: new Date().toISOString(),
          })
          // Store account number for consistency
          if (accountData.accountNumber) {
            localStorage.setItem('account_number', accountData.accountNumber)
          }
        } catch (accountError) {
          console.error('Failed to fetch account:', accountError)
          // Fallback to localStorage
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
        
        // Fetch user transactions
        const userTransactions = await getUserTransactions()
        if (Array.isArray(userTransactions) && userTransactions.length > 0) {
          const normalized = userTransactions.map((t) => ({
            ...t,
            transaction_type: t.transaction_type || t.transactionType,
            merchant_name: t.merchant_name || t.merchantName,
            merchant_category: t.merchant_category || t.merchantCategory,
            device_id: t.device_id || t.deviceId,
            transaction_country: t.transaction_country || t.transactionCountry,
            transaction_city: t.transaction_city || t.transactionCity,
            fraud_flag: t.fraud_flag ?? t.fraudFlag ?? false,
          }))
          setTransactions(normalized)
          localStorage.setItem('recent_transactions', JSON.stringify(normalized))
        } else {
          const stored = localStorage.getItem('recent_transactions')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTransactions(parsed)
              }
            } catch (err) {
              console.warn('Failed to parse stored transactions:', err)
            }
          } else {
            // Seed with sample transactions to keep UI populated
            const seeded = generateMockTransactions()
            transactionService.saveAll(seeded)
            setTransactions(seeded)
            localStorage.setItem('recent_transactions', JSON.stringify(seeded))
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        // Fallback to localStorage data if API fails
        const currentUserJson = localStorage.getItem('current_user')
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson)
          setUser(currentUser)
          
          // Use mock data as fallback
          const acc = transactionService.getAccount()
          setAccountInfo({
            account_balance: Number(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            account_number: `${String(Math.floor(Math.random() * 9999999999)).padStart(10, '0')}`,
            last_login_timestamp: new Date().toISOString(),
          })
          
          const existing = transactionService.getAll()
          if (existing.length === 0) {
            const seeded = generateMockTransactions()
            transactionService.saveAll(seeded)
            setTransactions(seeded)
            localStorage.setItem('recent_transactions', JSON.stringify(seeded))
          } else {
            setTransactions(existing)
            localStorage.setItem('recent_transactions', JSON.stringify(existing))
          }
        } else {
          navigate('/signin')
        }
      }
    }
    
    fetchUserData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('current_user')
    navigate('/signin')
  }

  const handleProfile = () => {
    navigate('/profile')
  }

  const goTransactions = () => {
    navigate('/transactions')
  }

  const getStatusTag = (status) => {
    const kindMap = {
      success: 'green',
      failed: 'red',
      pending: 'blue',
    }
    return (
      <Tag type={kindMap[status] || 'gray'} size="sm">
        {status.toUpperCase()}
      </Tag>
    )
  }

  const getFraudTag = (flag) => {
    return flag ? (
      <Tag type="red" size="sm">PREDICTED</Tag>
    ) : (
      <Tag type="green" size="sm">SAFE</Tag>
    )
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!user) {
    return null
  }

  const transactionsWithFlags = transactions.some((t) => t.fraud_flag)

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Top Banner with Balance */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f62fe 0%, #0043ce 100%)', 
        padding: '2rem 1rem 3rem', 
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Welcome back</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                {user.firstName || user.first_name || ''} {user.lastName || user.last_name || ''}
              </h2>
            </div>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Menu"
              style={{
                position: 'fixed', top: '24px', right: '24px', zIndex: 10002,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                cursor: 'pointer', transition: 'transform 0.2s', backdropFilter: 'blur(4px)'
              }}
            >
              <div style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <OverflowMenuVertical size={24} />
              </div>
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'fixed', top: '72px', right: '24px', zIndex: 10002,
                background: 'rgba(0,0,0,0.4)', color: '#ffffff',
                backdropFilter: 'blur(6px)',
                borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                overflow: 'hidden', minWidth: '240px', border: '1px solid rgba(255,255,255,0.18)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.25rem 0' }}>
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile') }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9375rem', color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/account-details') }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9375rem', color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Account Details
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/login-insights') }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9375rem', color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Security & Analytics
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', margin: '0.25rem 0' }} />
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout() }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9375rem', color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Balance Display */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Available Balance</p>
              <Button kind="ghost" size="md" onClick={() => setShowBalance((v) => !v)} renderIcon={showBalance ? ViewOff : View} style={{ color: 'white' }}>
                {showBalance ? 'Hide' : 'Show'}
              </Button>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1, filter: showBalance ? 'none' : 'blur(8px)' }}>
              {showBalance ? `$${accountInfo ? accountInfo.account_balance : '0.00'}` : 'XXX,XXX.XX'}
            </p>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Account: {accountInfo ? accountInfo.account_number : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1rem',
        pointerEvents: isProcessing ? 'none' : 'auto'
      }}>
        <Stack gap={4}>
          <SendMoneyModal
            open={sendOpen}
            onClose={() => setSendOpen(false)}
            user={user}
            onCreateTxn={async (txn) => {
              setIsProcessing(true)
              
              // Wait 4-5 seconds before processing (loading icon only)
              const delay = 4000 + Math.random() * 1000 // 4000-5000ms
              await new Promise(resolve => setTimeout(resolve, delay))
              
              try {
                // Create transaction via API
                const newTxn = await createTransaction(txn)
                
                // Update account balance
                const acc = transactionService.getAccount()
                const delta = txn.transaction_type === 'debit' ? -Number(txn.amount) : Number(txn.amount)
                const nextBalance = (Number(acc.balance) + delta)
                transactionService.setAccount({ ...acc, balance: nextBalance })
                setAccountInfo((prev) => ({
                  ...prev,
                  account_balance: nextBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }))
                
                // Refresh transactions list from backend
                const updatedTransactions = await getUserTransactions()
                const normalizedUpdated = updatedTransactions.map((t) => ({
                  ...t,
                  transaction_type: t.transaction_type || t.transactionType,
                  merchant_name: t.merchant_name || t.merchantName,
                  merchant_category: t.merchant_category || t.merchantCategory,
                  device_id: t.device_id || t.deviceId,
                  transaction_country: t.transaction_country || t.transactionCountry,
                  transaction_city: t.transaction_city || t.transactionCity,
                  fraud_flag: t.fraud_flag ?? t.fraudFlag ?? false,
                }))
                setTransactions(normalizedUpdated)
                localStorage.setItem('recent_transactions', JSON.stringify(normalizedUpdated))
              } catch (error) {
                console.error('Failed to create transaction (server):', error)
              } finally {
                // Hide overlay immediately after processing
                setIsProcessing(false)
              }
            }}
          />
          {/* Fraud alert intentionally removed as requested */}

          {/* Processing Overlay */}
          {isProcessing && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003
            }}>
              <div style={{
                background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', minWidth: '320px',
                maxWidth: '400px',
                filter: 'none', // Ensure content is not blurred
                backdropFilter: 'none', // Ensure content is not blurred
                position: 'relative', // Ensure proper stacking
                zIndex: 10004, // Higher than backdrop
                isolation: 'isolate', // Create new stacking context to isolate from parent blur
                transform: 'translateZ(0)', // Force hardware acceleration and new layer
                willChange: 'auto' // Optimize rendering
              }}>
                <Loading description="Processing transaction..." withOverlay={false} />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#393939' }}>Quick Actions</h3>
            <Grid narrow>
              <Column lg={4} md={2} sm={2}>
                <div style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: '8px' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                     onClick={() => setSendOpen(true)}>
                  <div style={{ 
                    width: '56px', height: '56px', margin: '0 auto 0.5rem', borderRadius: '50%', background: '#0f62fe15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f62fe'
                  }}>
                    <Send size={24} />
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Send Money</p>
                </div>
              </Column>
              <Column lg={4} md={2} sm={2}>
                <div style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: '8px' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                     onClick={() => alert('Pay Bills feature coming soon')}>
                  <div style={{ 
                    width: '56px', height: '56px', margin: '0 auto 0.5rem', borderRadius: '50%', background: '#24a14815',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#24a148'
                  }}>
                    <Receipt size={24} />
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Pay Bills</p>
                </div>
              </Column>
              <Column lg={4} md={2} sm={2}>
                <div style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: '8px' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                     onClick={goTransactions}>
                  <div style={{ 
                    width: '56px', height: '56px', margin: '0 auto 0.5rem', borderRadius: '50%', background: '#da1e2815',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#da1e28'
                  }}>
                    <Finance size={24} />
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Transactions</p>
                </div>
              </Column>
              <Column lg={4} md={2} sm={2}>
                <div style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: '8px' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                     onClick={() => alert('Scan & Pay feature coming soon')}>
                  <div style={{ 
                    width: '56px', height: '56px', margin: '0 auto 0.5rem', borderRadius: '50%', background: '#8a3ffc15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a3ffc'
                  }}>
                    <QrCode size={24} />
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Scan & Pay</p>
                </div>
              </Column>
              <Column lg={4} md={2} sm={2}>
                <div style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: '8px' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                     onClick={() => navigate('/nft-banking')}>
                  <div style={{ 
                    width: '56px', height: '56px', margin: '0 auto 0.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Pay via NFT</p>
                </div>
              </Column>
            </Grid>
          </Tile>

          {/* Security & Analytics section moved to header menu */}

          {/* Recent Activity - Stationary */}
          <Tile style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Heading style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Transactions</Heading>
            <div>
              {transactions.slice(0, 3).map((row, idx) => (
                <div key={row.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem',
                  borderBottom: idx < 2 ? '1px solid #e5e5e5' : 'none',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: row.transaction_type === 'credit' ? '#24a14820' : '#da1e2820',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {row.transaction_type === 'credit' ? '⬇️' : '⬆️'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>{row.merchant_name || row.merchant_category}</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6f6f6f' }}>
                        {formatTimestamp(row.timestamp).split(',')[0]} • {row.channel.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: 600, 
                      color: row.transaction_type === 'credit' ? '#24a148' : '#da1e28'
                    }}>
                      {row.transaction_type === 'credit' ? '+' : '-'}${parseFloat(row.amount).toFixed(2)}
                    </p>
                    {/* fraud flag hidden per requirement */}
                  </div>
                </div>
              ))}
            </div>
            {transactions.length > 3 && (
              <div style={{ textAlign: 'center', paddingTop: '0.75rem' }}>
                <Button kind="ghost" size="sm" onClick={goTransactions}>Show more</Button>
              </div>
            )}
          </Tile>

          {/* Bottom Logout removed; now in header menu */}
        </Stack>
      </div>
    </div>
  )
}

// Send Money Modal
function SendMoneyModal({ open, onClose, user, onCreateTxn }) {
  const [paymentMethod, setPaymentMethod] = useState('within_bank')
  const [recipientName, setRecipientName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [upiId, setUpiId] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [notes, setNotes] = useState('')
  const [upiValid, setUpiValid] = useState(false)
  const [mobileValid, setMobileValid] = useState(false)
  const [mobileUser, setMobileUser] = useState(null)

  // Handle amount change - remove leading zeros and limit decimals
  const handleAmountChange = (value) => {
    if (value === '' || value === null || value === undefined) {
      setAmount('')
      return
    }

    let text = String(value).replace(/[^\d.]/g, '')

    const parts = text.split('.')
    const wholePart = parts[0] ?? ''
    const fractionalPart = parts[1] ?? ''

    const normalizedWhole = wholePart.replace(/^0+(?!$)/, '') || (fractionalPart ? '0' : '')
    const limitedFractional = fractionalPart.slice(0, 2)

    if (text.includes('.')) {
      const trailingDot = text.endsWith('.') && limitedFractional.length === 0
      const combined = `${normalizedWhole || '0'}${limitedFractional.length > 0 ? `.${limitedFractional}` : trailingDot ? '.' : ''}`
      setAmount(combined)
    } else {
      setAmount(normalizedWhole)
    }
  }

  // Handle amount focus/click - clear placeholder zero
  const handleAmountFocus = (event) => {
    const current = amount
    if (!current || Number(current) === 0) {
      setAmount('')
      requestAnimationFrame(() => {
        if (event?.target) {
          event.target.value = ''
        }
      })
    } else {
      event?.target?.select()
    }
  }

  // Validate UPI ID format (e.g., name@paytm, 9876543210@ybl, etc.)
  const validateUpi = (value) => {
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/
    return upiPattern.test(value)
  }

  // Check if mobile number exists in user database
  const checkMobileUser = (mobile) => {
    try {
      const users = JSON.parse(localStorage.getItem('banking_users') || '[]')
      const found = users.find(u => u.phone_number === mobile)
      return found || null
    } catch {
      return null
    }
  }

  const handleUpiChange = (value) => {
    setUpiId(value)
    const valid = validateUpi(value)
    setUpiValid(valid)
    if (!valid) {
      setAmount('')
      setNotes('')
    }
  }

  const handleMobileChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(cleaned)
    if (cleaned.length === 10) {
      const foundUser = checkMobileUser(cleaned)
      setMobileValid(!!foundUser)
      setMobileUser(foundUser)
      if (!foundUser) {
        setAmount('')
      }
    } else {
      setMobileValid(false)
      setMobileUser(null)
      setAmount('')
    }
  }

  const submit = () => {
    const amountNum = Number(amount) || 0
    let merchantName = recipientName
    if (paymentMethod === 'upi') {
      if (!upiValid || !upiId || amountNum <= 0) return
      merchantName = upiId
    } else if (paymentMethod === 'mobile') {
      if (!mobileValid || !mobileNumber || amountNum <= 0) return
      merchantName = mobileUser ? `${mobileUser.first_name} ${mobileUser.last_name}` : mobileNumber
    } else {
      if (!merchantName || amountNum <= 0) return
      if (paymentMethod === 'outside_bank' && !ifscCode) return
    }

    const now = new Date()
    const txn = {
      id: `TXN${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`,
      timestamp: now.toISOString(),
      transaction_type: 'debit',
      merchant_name: merchantName,
      merchant_category: paymentMethod === 'within_bank' ? 'Within Bank' : paymentMethod === 'outside_bank' ? 'Outside Bank' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'mobile' ? 'Mobile' : 'Bank Transfer',
      amount: amountNum.toFixed(2),
      currency,
      device_id: `DEV${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      transaction_country: user?.country || 'India',
      transaction_city: user?.city || 'Mumbai',
      channel: 'app',
      status: 'success',
      fraud_flag: false,
    }
    onCreateTxn(txn)
    onClose()
    // Reset form
    setRecipientName('')
    setAccountNumber('')
    setIfscCode('')
    setUpiId('')
    setMobileNumber('')
    setAmount('')
    setNotes('')
    setPaymentMethod('within_bank')
    setUpiValid(false)
    setMobileValid(false)
    setMobileUser(null)
  }

  const handleClose = () => {
    // Reset all states
    setRecipientName('')
    setAccountNumber('')
    setIfscCode('')
    setUpiId('')
    setMobileNumber('')
    setAmount('')
    setNotes('')
    setPaymentMethod('within_bank')
    setUpiValid(false)
    setMobileValid(false)
    setMobileUser(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onRequestClose={handleClose}
      primaryButtonText="Send Money"
      secondaryButtonText="Cancel"
      onRequestSubmit={submit}
      modalHeading="Send Money"
      size="lg"
    >
      <div style={{ background: 'linear-gradient(135deg, #f4f4f4 0%, #ffffff 100%)', borderRadius: '12px', padding: '1.5rem' }}>
        <Stack gap={5}>
          {/* Payment Method Selection - Card Layout */}
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#393939' }}>Select Payment Method</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[
                { value: 'within_bank', label: 'Within Bank', icon: '🏦', description: 'Same bank transfer' },
                { value: 'outside_bank', label: 'Outside Bank', icon: '🏛️', description: 'Other bank transfer' },
                { value: 'upi', label: 'UPI ID', icon: '💳', description: 'UPI payment' },
                { value: 'mobile', label: 'Mobile Number', icon: '📱', description: 'Mobile transfer' }
              ].map(method => (
                <div
                  key={method.value}
                  onClick={() => {
                    setPaymentMethod(method.value)
                    if (method.value !== 'upi') { setUpiValid(false); setUpiId(''); }
                    if (method.value !== 'mobile') { setMobileValid(false); setMobileUser(null); setMobileNumber(''); }
                  }}
                  style={{
                    padding: '1.5rem 1rem',
                    borderRadius: '12px',
                    border: paymentMethod === method.value ? '2px solid #0f62fe' : '2px solid #e0e0e0',
                    background: paymentMethod === method.value ? '#0f62fe10' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    boxShadow: paymentMethod === method.value ? '0 4px 12px rgba(15, 98, 254, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                    transform: paymentMethod === method.value ? 'translateY(-2px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (paymentMethod !== method.value) {
                      e.currentTarget.style.borderColor = '#0f62fe80'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paymentMethod !== method.value) {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.transform = 'none'
                    }
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{method.icon}</div>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: 600, 
                    fontSize: '0.9375rem',
                    color: paymentMethod === method.value ? '#0f62fe' : '#393939',
                    marginBottom: '0.25rem'
                  }}>
                    {method.label}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.75rem', 
                    color: '#6f6f6f',
                    lineHeight: 1.3
                  }}>
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Within Bank Form */}
          {paymentMethod === 'within_bank' && (
            <Stack gap={4}>
              <TextInput id="recipient_name_wb" labelText="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Enter recipient name" />
              <TextInput 
                id="account_number_wb" 
                labelText="Account Number" 
                value={accountNumber} 
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '')
                  setAccountNumber(numericValue)
                }} 
                placeholder="Enter account number" 
              />
              <NumberInput
                id="amount_wb"
                label="Amount"
                step={10}
                min={0}
                allowEmpty
                placeholder="Enter amount"
                value={amount}
                onFocus={handleAmountFocus}
                onClick={handleAmountFocus}
                onChange={(event, state) => {
                  const val = state?.value ?? event?.target?.value ?? ''
                  handleAmountChange(val)
                }}
              />
              <Select id="currency_wb" labelText="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <SelectItem value="USD" text="USD" />
                <SelectItem value="INR" text="INR" />
                <SelectItem value="EUR" text="EUR" />
              </Select>
              <TextInput id="notes_wb" labelText="Notes (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note" />
            </Stack>
          )}

          {/* Outside Bank Form */}
          {paymentMethod === 'outside_bank' && (
            <Stack gap={4}>
              <TextInput id="recipient_name_ob" labelText="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Enter recipient name" />
              <TextInput 
                id="account_number_ob" 
                labelText="Account Number" 
                value={accountNumber} 
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '')
                  setAccountNumber(numericValue)
                }} 
                placeholder="Enter account number" 
              />
              <TextInput id="ifsc" labelText="IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} placeholder="Enter IFSC code" helperText="Required for outside bank transfers" />
              <NumberInput
                id="amount_ob"
                label="Amount"
                step={10}
                min={0}
                allowEmpty
                placeholder="Enter amount"
                value={amount}
                onFocus={handleAmountFocus}
                onClick={handleAmountFocus}
                onChange={(event, state) => {
                  const val = state?.value ?? event?.target?.value ?? ''
                  handleAmountChange(val)
                }}
              />
              <Select id="currency_ob" labelText="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <SelectItem value="USD" text="USD" />
                <SelectItem value="INR" text="INR" />
                <SelectItem value="EUR" text="EUR" />
              </Select>
              <TextInput id="notes_ob" labelText="Notes (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note" />
            </Stack>
          )}

          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <Stack gap={4}>
              <TextInput
                id="upi_id"
                labelText="UPI ID"
                value={upiId}
                onChange={(e) => handleUpiChange(e.target.value)}
                placeholder="example@paytm or 9876543210@ybl"
                helperText={upiValid ? 'Valid UPI ID' : 'Enter UPI ID (format: name@bank)'}
                invalid={upiId && !upiValid}
                invalidText={upiId && !upiValid ? 'Invalid UPI ID format' : ''}
              />
              {upiValid && (
                <>
                  <NumberInput
                    id="amount_upi"
                    label="Amount"
                    step={10}
                    min={0}
                    allowEmpty
                    placeholder="Enter amount"
                    value={amount}
                    onFocus={handleAmountFocus}
                    onClick={handleAmountFocus}
                    onChange={(event, state) => {
                      const val = state?.value ?? event?.target?.value ?? ''
                      handleAmountChange(val)
                    }}
                  />
                  <TextInput id="notes_upi" labelText="Notes (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note" />
                </>
              )}
            </Stack>
          )}

          {/* Mobile Number Form */}
          {paymentMethod === 'mobile' && (
            <Stack gap={4}>
              <TextInput
                id="mobile"
                labelText="Mobile Number"
                value={mobileNumber}
                onChange={(e) => handleMobileChange(e.target.value)}
                placeholder="10 digit mobile number"
                helperText={mobileValid ? (mobileUser ? `User found: ${mobileUser.first_name} ${mobileUser.last_name}` : 'Valid mobile number') : mobileNumber.length === 10 ? 'User not found' : 'Enter 10 digit mobile number'}
                invalid={mobileNumber.length === 10 && !mobileValid}
                invalidText={mobileNumber.length === 10 && !mobileValid ? 'No user found with this mobile number' : ''}
              />
              {mobileValid && (
                <NumberInput
                  id="amount_mob"
                  label="Amount"
                  step={10}
                  min={0}
                  allowEmpty
                  placeholder="Enter amount"
                  value={amount}
                  onFocus={handleAmountFocus}
                  onClick={handleAmountFocus}
                  onChange={(event, state) => {
                    const val = state?.value ?? event?.target?.value ?? ''
                    handleAmountChange(val)
                  }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </div>
    </Modal>
  )
}
