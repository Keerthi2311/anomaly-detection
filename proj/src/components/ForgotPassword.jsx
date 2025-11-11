import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stack,
  Heading,
  Tile,
  Button,
  TextInput,
  InlineNotification,
  Form,
} from '@carbon/react'
import { ArrowLeft, Email } from '@carbon/icons-react'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendResetEmail = async (toEmail, resetLink, userName) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      throw new Error('EmailJS not configured')
    }

    const expiry = new Date(Date.now() + 60 * 60 * 1000).toLocaleString() // 1 hour from now

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        user_name: userName,
        reset_link: resetLink,
        expiry_time: expiry,
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      // Step 1: Call backend to generate token
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link')
      }

      // Step 2: If token was created, get it and send email via EmailJS
      // Note: For security, backend should return the token only in development
      // In production, backend should send the email directly
      if (data.token) {
        const resetLink = `http://localhost:5173/reset-password?token=${data.token}`
        const userName = data.userName || 'User'
        
        // Send email via EmailJS
        await sendResetEmail(email, resetLink, userName)
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ 
      backgroundColor: '#f4f4f4', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <Tile style={{ padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ArrowLeft}
            onClick={() => navigate('/signin')}
            style={{ marginBottom: '1.5rem' }}
          >
            Back to Sign In
          </Button>

          <Heading style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#393939' }}>
            Forgot Password
          </Heading>
          <p style={{ fontSize: '0.875rem', color: '#6f6f6f', marginBottom: '2rem' }}>
            Enter your email address and we'll send you a link to reset your password
          </p>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              lowContrast
              hideCloseButton
              style={{ marginBottom: '1.5rem' }}
            />
          )}

          {success && (
            <InlineNotification
              kind="success"
              title="Email Sent!"
              subtitle="If an account exists with this email, you will receive a password reset link shortly. Please check your email (and spam folder)."
              lowContrast
              hideCloseButton
              style={{ marginBottom: '1.5rem' }}
            />
          )}

          <Form onSubmit={handleSubmit}>
            <Stack gap={5}>
              <TextInput
                id="email"
                labelText="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                renderIcon={Email}
                disabled={success}
              />

              <Button
                type="submit"
                kind="primary"
                size="lg"
                disabled={isSubmitting || success}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {isSubmitting ? 'Sending...' : success ? 'Email Sent!' : 'Send Reset Link'}
              </Button>

              {success && (
                <p style={{ fontSize: '0.875rem', color: '#6f6f6f', textAlign: 'center', marginTop: '1rem' }}>
                  Didn't receive the email?{' '}
                  <Button 
                    kind="ghost" 
                    size="sm" 
                    onClick={() => { setSuccess(false); setEmail(''); }}
                    style={{ padding: 0, textDecoration: 'underline' }}
                  >
                    Try again
                  </Button>
                </p>
              )}
            </Stack>
          </Form>
        </Tile>
      </div>
    </div>
  )
}
