import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import {
  TextInput,
  PasswordInput,
  Button,
  Form,
  Grid,
  Column,
  Stack,
  Heading,
  Tile,
  InlineNotification,
  Modal,
} from '@carbon/react'
import { login, saveLoginFeatures, saveMFAFeatures } from '../services/api'

const validationSchema = yup.object().shape({
  email_or_phone: yup.string().required('Email or phone number is required'),
  password: yup.string().required('Password is required'),
})

// ---- NEW HELPERS FOR SESSION-SCOPED ATTEMPTS ----
const getSessionAttempts = () => {
  try {
    const a = sessionStorage.getItem('login_session_attempts')
    return a ? JSON.parse(a) : []
  } catch {
    return []
  }
}
const setSessionAttempts = (arr) => {
  try {
    sessionStorage.setItem('login_session_attempts', JSON.stringify(arr || []))
  } catch {}
}
const pushSessionAttempt = (attempt) => {
  const arr = getSessionAttempts()
  arr.push(attempt)
  setSessionAttempts(arr)
}

export default function SignIn() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const typingStartRef = useRef(null)
  const typedCharsRef = useRef(0)
  const lastKeyTimeRef = useRef(null)
  const mouseDirsRef = useRef([])
  const lastMouseRef = useRef(null)
  const mfaOpen = useState(false)
  const [isMfaOpen, setIsMfaOpen] = mfaOpen
  const [mfaInput, setMfaInput] = useState('')
  const [mfaAttempts, setMfaAttempts] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(null)
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0)
  const [otpNotice, setOtpNotice] = useState('')
  const [otpToast, setOtpToast] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendGrace, setResendGrace] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const mfaStartRef = useRef(null)
  const otpInputsRef = useRef([])
  const authedUserRef = useRef(null)
  const netDataRef = useRef(null)
  const mfaOtpRef = useRef('')
  const [otpSentTo, setOtpSentTo] = useState('')
  const [otpSendError, setOtpSendError] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const sendOtpEmail = async (toEmail, code) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    if (!serviceId || !templateId || !publicKey) {
      throw new Error('EmailJS not configured')
    }
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toLocaleString()
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        email: toEmail,
        passcode: code,
        time: expiry,
      },
    }
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`EmailJS failed: ${res.status} ${txt}`)
    }
  }

  const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000))

  // capture typing
  const handleKeyCapture = () => {
    const now = performance.now()
    if (typingStartRef.current == null) typingStartRef.current = now
    typedCharsRef.current += 1
    lastKeyTimeRef.current = now
  }

  // capture mouse movement
  useEffect(() => {
    const onMove = (e) => {
      const prev = lastMouseRef.current
      const cur = { x: e.clientX, y: e.clientY, t: performance.now() }
      if (prev) {
        const dx = cur.x - prev.x
        const dy = cur.y - prev.y
        const mag = Math.hypot(dx, dy)
        if (mag > 0) {
          const angle = Math.atan2(dy, dx)
          const bucket = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 8)
          mouseDirsRef.current.push(Math.min(7, Math.max(0, bucket)))
        }
      }
      lastMouseRef.current = cur
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const hashString = (s) => {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i)
      h |= 0
    }
    return Math.abs(h)
  }

  const computeDeviceFingerprint = () => {
    try {
      const nav = window.navigator || {}
      const scr = window.screen || {}
      const parts = [
        nav.userAgent || '',
        nav.platform || '',
        String(nav.language || ''),
        String(nav.deviceMemory || ''),
        String(nav.hardwareConcurrency || ''),
        `${scr.width || ''}x${scr.height || ''}@${window.devicePixelRatio || ''}`,
      ].join('|')
      const h = hashString(parts)
      return `FP_${String(h % 100000).padStart(5, '0')}`
    } catch {
      return 'FP_UNKNOWN'
    }
  }

  const computeDeviceType = () => {
    const ua = (navigator && navigator.userAgent) ? navigator.userAgent : ''
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    const isMac = /Macintosh/i.test(ua)
    const isWindows = /Windows/i.test(ua)
    const isLinux = /Linux/i.test(ua) && !isAndroid
    const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua)
    const isChrome = /Chrome\//.test(ua) || /CriOS\//.test(ua)
    const isFirefox = /Firefox\//.test(ua)
    if (isIOS && isSafari) return 'iOS-Safari'
    if (isAndroid && isChrome) return 'Android-Chrome'
    if (isMac && isSafari) return 'Mac-Safari'
    if (isWindows && isChrome) return 'Windows-Chrome'
    if (isLinux && isFirefox) return 'Linux-Firefox'
    return 'Unknown'
  }

  const getOrCreateSessionId = (userId) => {
    try {
      let sid = sessionStorage.getItem('session_id')
      if (!sid) {
        let startedAt = sessionStorage.getItem('session_started_at')
        if (!startedAt) {
          startedAt = String(Date.now())
          sessionStorage.setItem('session_started_at', startedAt)
        }
        const seed = hashString(`${userId || 'guest'}|${startedAt}`)
        sid = `SESSION_${String(seed % 1_000_000).padStart(6, '0')}`
        sessionStorage.setItem('session_id', sid)
      }
      return sid
    } catch {
      return 'SESSION_000000'
    }
  }

  const handleSignUp = () => navigate('/signup')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: { email_or_phone: '', password: '' },
  })

  const onSubmit = async (data) => {
    setError('')
    if (!sessionStorage.getItem('login_session_started_at')) {
      sessionStorage.setItem('login_session_started_at', String(Date.now()))
      setSessionAttempts([]) // new session = reset attempts
    }

    let user = null
    let loginSuccess = false

    try {
      // Call backend API to login
      const response = await login(data.email_or_phone, data.password)
      user = response
      loginSuccess = true
    } catch (err) {
      console.error('Login error:', err)
      loginSuccess = false
    }

    const timestampIso = new Date().toISOString()
    pushSessionAttempt({ t: timestampIso, success: loginSuccess })
    const sessionAttempts = getSessionAttempts()

    // typing & mouse metrics
    const now = performance.now()
    const start = typingStartRef.current ?? now
    const elapsedMin = Math.max(0.001, (now - start) / 60000)
    const charsPerMin = typedCharsRef.current / elapsedMin
    const counts = new Array(8).fill(0)
    mouseDirsRef.current.forEach((b) => { if (b >= 0 && b < 8) counts[b] += 1 })
    const total = counts.reduce((a, b) => a + b, 0)
    let entropy = 0
    if (total > 0) {
      for (let i = 0; i < 8; i++) {
        const p = counts[i] / total
        if (p > 0) entropy += -p * Math.log2(p)
      }
    }

    if (user && loginSuccess) {
      const fetchNet = async () => {
        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 3500)
          const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal })
          clearTimeout(timer)
          if (!res.ok) throw new Error('ipapi failed')
          return await res.json()
        } catch {
          return null
        }
      }

      const net = await fetchNet()
      netDataRef.current = net

      // Backend returns userId, not user_id
      const userId = user.userId || user.user_id
      const sessionId = getOrCreateSessionId(userId)
      const deviceFingerprint = computeDeviceFingerprint()
      const deviceType = computeDeviceType()
      const ip = net?.ip || ''
      const isp = (net?.org || net?.org_name || net?.asn || '') || 'Unknown'
      const country = net?.country_name || net?.country || ''
      const city = net?.city || ''
      const totalAttempts = sessionAttempts.length
      const failedAttempts = sessionAttempts.filter((a) => !a.success).length
      const loginEndNow = performance.now()
      const startNow = typingStartRef.current ?? loginEndNow
      const timeToLoginSec = (loginEndNow - startNow) / 1000

      const loginFeatures = {
        user_id: userId,
        session_id: sessionId,
        timestamp: timestampIso,
        country,
        city,
        ip_address: ip,
        isp,
        is_vpn: /vpn|warp|mullvad|pia|nord|express/i.test(isp) ? 1 : 0,
        is_tor: 0,
        is_proxy: /proxy|cloudflare/i.test(isp) ? 1 : 0,
        is_datacenter_ip: /aws|amazon|gcp|google|azure|microsoft|digitalocean|linode|ovh|hetzner|alibaba|oracle/i.test(isp) ? 1 : 0,
        device_fingerprint: deviceFingerprint,
        device_type: deviceType,
        login_attempts: totalAttempts,
        failed_attempts: failedAttempts,
        password_correct: 1,
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
        is_weekend: [0,6].includes(new Date().getDay()) ? 1 : 0,
        is_unusual_time: (() => { const h = new Date().getHours(); return (h > 1 && h < 6) ? 1 : 0 })(),
        typing_speed_chars_per_min: Number(charsPerMin.toFixed(2)),
        mouse_movement_entropy: Number(entropy.toFixed(3)),
        time_to_login_seconds: Number(timeToLoginSec.toFixed(3)),
      }
      localStorage.setItem('last_login_features', JSON.stringify(loginFeatures))
      
      // Save login features to backend database (non-blocking)
      saveLoginFeatures(loginFeatures).catch(err => console.warn('Failed to save login features:', err))

      authedUserRef.current = { user, timestampIso, charsPerMin, entropy, sessionAttempts }
      setMfaAttempts(0)
      setMfaInput('')
      mfaStartRef.current = performance.now()
      setIsMfaOpen(true)
      setOtpSendError('')
      setIsSendingOtp(true)
      const code = generateOtp()
      mfaOtpRef.current = code
      const destEmail = user.email
      const masked = destEmail ? destEmail.replace(/(^.).*(@.*$)/, (_, a, b) => `${a}***${b}`) : ''
      setOtpSentTo(masked || '')
      ;(async () => {
        try {
          if (destEmail) await sendOtpEmail(destEmail, code)
          else throw new Error('No email present')
        } catch {
          setOtpSendError('Could not send OTP automatically. Showing OTP for local testing.')
        } finally {
          setIsSendingOtp(false)
          // show a 1s grace period where resend is clickable, then start 30s cooldown
          setResendGrace(true)
          setResendCooldown(0)
          setTimeout(() => {
            setResendGrace(false)
            setResendCooldown(30)
          }, 1000)
        }
      })()
    } else {
      setError('Invalid credentials. Please check your email/phone and password.')
    }
  }

  const completeLoginAfterMfa = async () => {
    const ctx = authedUserRef.current
    if (!ctx) return
    const { user, timestampIso } = ctx
    const sessionAttempts = getSessionAttempts()
    // Backend returns userId, not user_id
    const userId = user.userId || user.user_id
    const sessionId = getOrCreateSessionId(userId)
    const deviceFingerprint = computeDeviceFingerprint()
    const deviceType = computeDeviceType()
    const net = netDataRef.current
    const ip = net?.ip || ''
    const isp = (net?.org || net?.org_name || net?.asn || '') || 'Unknown'
    const country = net?.country_name || net?.country || ''
    const city = net?.city || ''
    const totalAttempts = sessionAttempts.length
    const failedAttempts = sessionAttempts.filter((a) => !a.success).length

    const loginEnd = performance.now()
    const mfaTimeSec = mfaStartRef.current ? (loginEnd - mfaStartRef.current) / 1000 : 0

    const mfaFeatures = {
      user_id: userId,
      session_id: sessionId,
      timestamp: timestampIso,
      mfa_required: 1,
      mfa_attempts: mfaAttempts,
      mfa_success: 1,
      mfa_time_taken_seconds: Number(mfaTimeSec.toFixed(3)),
    }
    localStorage.setItem('last_mfa_features', JSON.stringify(mfaFeatures))
    localStorage.setItem('current_user', JSON.stringify(user))
    
    // Save MFA features to backend database (non-blocking)
    saveMFAFeatures(mfaFeatures).catch(err => console.warn('Failed to save MFA features:', err))
    
    // Store account number from login response
    if (user.accountNumber) {
      localStorage.setItem('account_number', user.accountNumber)
    }

    // optional: clear session attempts on success
    setSessionAttempts([])
    sessionStorage.removeItem('login_session_started_at')

    setIsMfaOpen(false)
    try { sessionStorage.setItem('show_adv_cta', '1') } catch {}
    navigate('/dashboard')
  }

  const handleMfaSubmit = async () => {
    const now = Date.now()
    const until = typeof lockoutUntil === 'number' ? lockoutUntil : Number(sessionStorage.getItem('mfa_lockout_until') || 0)
    if (until && now < until) return
    if (mfaInput.trim() === mfaOtpRef.current) {
      setIsVerifying(true)
      await new Promise((r) => setTimeout(r, 3500))
      await completeLoginAfterMfa()
    } else {
      setMfaAttempts((n) => n + 1)
      setWrongAttempts((w) => {
        const next = w + 1
        const remaining = Math.max(0, 5 - next)
        if (next >= 5) {
          const lockUntilTs = Date.now() + 5 * 60 * 1000
          setLockoutUntil(lockUntilTs)
          sessionStorage.setItem('mfa_lockout_until', String(lockUntilTs))
          setOtpToast('Too many incorrect attempts. Please wait 5 minutes')
        } else {
          setOtpToast(`Invalid OTP. Remaining attempts: ${remaining}`)
          setTimeout(() => setOtpToast(''), 1000)
        }
        // Clear inputs and refocus first box
        setMfaInput('')
        try {
          const first = otpInputsRef.current?.[0]
          first && first.focus()
        } catch {}
        return next
      })
    }
  }

  // countdown for lockout
  useEffect(() => {
    const readLockout = () => {
      const until = typeof lockoutUntil === 'number' ? lockoutUntil : Number(sessionStorage.getItem('mfa_lockout_until') || 0)
      const now = Date.now()
      const remain = Math.max(0, Math.floor((until - now) / 1000))
      setLockoutRemainingSec(remain)
      if (remain <= 0 && until) {
        setLockoutUntil(null)
        sessionStorage.removeItem('mfa_lockout_until')
        setWrongAttempts(0)
        setError('')
      }
      return remain
    }
    readLockout()
    const id = setInterval(() => {
      const remain = readLockout()
      if (remain <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [lockoutUntil, isMfaOpen])

  // resend OTP countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => {
      setResendCooldown((n) => (n > 0 ? n - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  const handleResendOtp = async () => {
    if ((!resendGrace && resendCooldown > 0) || lockoutRemainingSec > 0 || isSendingOtp) return
    setIsSendingOtp(true)
    const code = generateOtp()
    mfaOtpRef.current = code
    try {
      const destEmail = authedUserRef.current?.user?.email
      if (destEmail) await sendOtpEmail(destEmail, code)
      else throw new Error('No email present')
      setOtpToast('OTP resent')
      setTimeout(() => setOtpToast(''), 1000)
    } catch {
      setOtpToast('Resend failed. Try again later')
      setTimeout(() => setOtpToast(''), 1000)
    } finally {
      setIsSendingOtp(false)
      setResendGrace(false)
      setResendCooldown(30)
    }
  }

  return (
    <div style={{ padding: '3rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={6}>
            <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
              <Heading style={{ marginBottom: '0.5rem' }}>Sign In</Heading>
              <p style={{ color: '#6f6f6f', fontSize: '1rem' }}>
                Banking system - Anomaly Detection
              </p>
            </div>

            {error && (
              <InlineNotification
                kind="error"
                title="Sign in failed"
                subtitle={error}
                lowContrast
                onClose={() => setError('')}
              />
            )}

            <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <Stack gap={6}>
                <Grid narrow>
                  <Column lg={16} md={8} sm={4}>
                    <Controller
                      name="email_or_phone"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="email_or_phone"
                          labelText="Email or Phone Number"
                          type="text"
                          invalid={!!errors.email_or_phone}
                          invalidText={errors.email_or_phone?.message}
                          placeholder="Enter your email or phone number"
                          onChange={(e) => { field.onChange(e); handleKeyCapture() }}
                          onKeyDown={handleKeyCapture}
                        />
                      )}
                    />
                  </Column>

                  <Column lg={16} md={8} sm={4}>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <PasswordInput
                          {...field}
                          id="password"
                          labelText="Password"
                          invalid={!!errors.password}
                          invalidText={errors.password?.message}
                          placeholder="Enter your password"
                          onChange={(e) => { field.onChange(e); handleKeyCapture() }}
                          onKeyDown={handleKeyCapture}
                        />
                      )}
                    />
                  </Column>
                </Grid>
              </Stack>
            </Tile>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button kind="ghost" onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </Button>
              <Button type="submit" kind="primary" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <p style={{ color: '#6f6f6f' }}>
                Don't have an account?{' '}
                <Button kind="ghost" size="sm" onClick={() => navigate('/signup')} style={{ padding: 0, textDecoration: 'underline' }}>
                  Sign Up
                </Button>
              </p>
            </div>
          </Stack>
        </Form>

        <Modal
          open={isMfaOpen}
          modalHeading="Verify your identity"
          primaryButtonText="Verify"
          secondaryButtonText="Cancel"
          onRequestClose={() => setIsMfaOpen(false)}
          onRequestSubmit={handleMfaSubmit}
        >
          <div style={{ position: 'relative' }}>
            {isVerifying && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10001,
              }}>
                <div style={{
                  background: '#fff',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}>
                  Verifying…
                </div>
              </div>
            )}
            {otpToast && (
              <div style={{
                position: 'fixed',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#161616',
                color: '#fff',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 10000,
              }}>
                {otpToast}
              </div>
            )}
            <div style={{
              background: 'linear-gradient(135deg, #0f62fe 0%, #33b1ff 100%)',
              borderRadius: '16px',
              padding: '1px',
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                filter: isVerifying ? 'blur(2px)' : 'none',
              }}>
                <Stack gap={5}>
                  <div style={{ textAlign: 'center' }}>
                    <Heading style={{ marginBottom: '0.25rem' }}>Two‑step verification</Heading>
                    <div style={{ color: '#6f6f6f' }}>Enter the 4‑digit code sent to {otpSentTo || 'your email'}.</div>
                  </div>
                  {isSendingOtp && (
                    <div style={{
                      background: '#edf5ff',
                      color: '#0043ce',
                      border: '1px solid #d0e2ff',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}>Sending OTP…</div>
                  )}
                  {otpSendError && (
                    <div style={{
                      background: '#fff2f2',
                      color: '#da1e28',
                      border: '1px solid #ffd7d9',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}>{otpSendError}</div>
                  )}
                  {lockoutRemainingSec > 0 && (
                    <div style={{
                      background: '#fff2f2',
                      color: '#da1e28',
                      border: '1px solid #ffd7d9',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}>{`Try again in ${String(Math.floor(lockoutRemainingSec/60)).padStart(2,'0')}:${String(lockoutRemainingSec%60).padStart(2,'0')}`}</div>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {[0,1,2,3].map((i) => (
                      <input
                        key={i}
                        inputMode="numeric"
                        maxLength={1}
                        disabled={lockoutRemainingSec > 0}
                        ref={(el) => (otpInputsRef.current[i] = el)}
                        value={mfaInput[i] || ''}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 1)
                          const next = (mfaInput.substring(0, i) + v + (mfaInput.substring(i + 1) || '')).slice(0,4)
                          setMfaInput(next)
                          if (v && i < 3) {
                            const nextEl = e.currentTarget.parentElement?.querySelectorAll('input')[i + 1]
                            nextEl && nextEl.focus()
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !mfaInput[i] && i > 0) {
                            const prevEl = e.currentTarget.parentElement?.querySelectorAll('input')[i - 1]
                            prevEl && prevEl.focus()
                          }
                        }}
                        style={{
                          width: '3.25rem',
                          height: '3.5rem',
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          borderRadius: '10px',
                          border: '1px solid #e0e0e0',
                          outline: 'none',
                          background: lockoutRemainingSec > 0 ? '#f4f4f4' : '#fff',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      kind="ghost"
                      size="sm"
                      disabled={(!resendGrace && resendCooldown > 0) || lockoutRemainingSec > 0 || isSendingOtp}
                      onClick={handleResendOtp}
                      style={{ padding: 0, textDecoration: 'underline' }}
                    >
                      {resendGrace ? 'Resend OTP' : (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP')}
                    </Button>
                  </div>
                </Stack>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
