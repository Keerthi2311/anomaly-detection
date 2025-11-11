import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Stack,
  Heading,
  Tile,
  Button,
  TextInput,
  InlineNotification,
  Form,
  Loading,
} from '@carbon/react'
import { Checkmark, WarningAlt } from '@carbon/icons-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token')
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:8080/api/auth/validate-reset-token?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setTokenValid(true)
        } else {
          setError('This reset link is invalid or has expired')
        }
      } catch (err) {
        setError('Failed to validate reset link')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      setSuccess(true)

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        navigate('/signin')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidating) {
    return (
      <div style={{ 
        backgroundColor: '#f4f4f4', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <Loading description="Validating reset link..." withOverlay={false} />
      </div>
    )
  }

  if (!tokenValid) {
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
          <Tile style={{ padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <WarningAlt size={48} style={{ color: '#da1e28', marginBottom: '1rem' }} />
            <Heading style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#393939' }}>
              Invalid Reset Link
            </Heading>
            <p style={{ fontSize: '0.875rem', color: '#6f6f6f', marginBottom: '2rem' }}>
              {error || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <Button
              kind="primary"
              size="lg"
              onClick={() => navigate('/forgot-password')}
              style={{ width: '100%' }}
            >
              Request New Link
            </Button>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => navigate('/signin')}
              style={{ marginTop: '1rem' }}
            >
              Back to Sign In
            </Button>
          </Tile>
        </div>
      </div>
    )
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
          <Heading style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#393939' }}>
            Reset Your Password
          </Heading>
          <p style={{ fontSize: '0.875rem', color: '#6f6f6f', marginBottom: '2rem' }}>
            Enter your new password below
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
              title="Success!"
              subtitle="Your password has been reset successfully. Redirecting to sign in..."
              lowContrast
              hideCloseButton
              style={{ marginBottom: '1.5rem' }}
            />
          )}

          <Form onSubmit={handleSubmit}>
            <Stack gap={5}>
              <TextInput.PasswordInput
                id="new_password"
                labelText="New Password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={success}
              />

              <TextInput.PasswordInput
                id="confirm_password"
                labelText="Confirm Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={success}
              />

              <Button
                type="submit"
                kind="primary"
                size="lg"
                disabled={isSubmitting || success}
                renderIcon={success ? Checkmark : undefined}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {isSubmitting ? 'Resetting Password...' : success ? 'Password Reset!' : 'Reset Password'}
              </Button>
            </Stack>
          </Form>
        </Tile>
      </div>
    </div>
  )
}
