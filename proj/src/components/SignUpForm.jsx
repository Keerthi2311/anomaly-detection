import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import {
  TextInput,
  PasswordInput,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  Button,
  Form,
  Grid,
  Column,
  Stack,
  Heading,
  Tile,
  Loading,
  InlineNotification,
} from '@carbon/react'
import { signup } from '../services/api'
import { buildIncomeOptions, getCurrencySymbol } from '../utils/currency'

// Validation schema with real-time validation
const validationSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone_number: yup
    .string()
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  date_of_birth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  postal_code: yup
    .string()
    .matches(/^\d{6}$/, 'Postal code must be exactly 6 digits')
    .required('Postal code is required'),
  account_type: yup.string().required('Account type is required'),
  currency_preference: yup.string().required('Currency preference is required'),
  occupation: yup.string().required('Occupation is required'),
  income_range: yup.string().required('Income range is required'),
  preferred_language: yup.string().required('Preferred language is required'),
})

const currencyOptions = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']

const languageOptions = [
  { value: 'en', text: 'English' },
  { value: 'es', text: 'Spanish' },
  { value: 'fr', text: 'French' },
  { value: 'de', text: 'German' },
  { value: 'hi', text: 'Hindi' },
  { value: 'zh', text: 'Chinese' },
  { value: 'ar', text: 'Arabic' },
  { value: 'pt', text: 'Portuguese' },
  { value: 'ru', text: 'Russian' },
  { value: 'ja', text: 'Japanese' },
]

export default function SignUpForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignIn = () => {
    navigate('/signin')
  }

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone_number: '',
      date_of_birth: '',
      gender: '',
      country: '',
      state: '',
      city: '',
      postal_code: '',
      account_type: '',
      currency_preference: '',
      occupation: '',
      income_range: '',
      preferred_language: '',
    },
  })

  const currencyPreference = watch('currency_preference')
  const incomeRange = watch('income_range')
  const previousCurrencyRef = useRef('')

  useEffect(() => {
    if (currencyPreference && currencyPreference !== previousCurrencyRef.current) {
      setValue('income_range', '')
    }
    previousCurrencyRef.current = currencyPreference || ''
  }, [currencyPreference, setValue])

  useEffect(() => {
    if (!currencyPreference && incomeRange) {
      setValue('income_range', '')
    }
  }, [currencyPreference, incomeRange, setValue])

  const incomeOptions = useMemo(
    () => buildIncomeOptions(currencyPreference || 'USD'),
    [currencyPreference]
  )

  const currencySymbol = currencyPreference ? getCurrencySymbol(currencyPreference) : null

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Call backend API to create user
      await signup(data)

      setSuccess('Account created successfully! Redirecting to sign in...')

      // Wait a moment to show success message
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Navigate to signin page
      navigate('/signin')
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', padding: '3rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', transition: 'filter 0.3s ease' }}>
        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(3px)',
          }}>
            <Loading description="Creating account..." withOverlay={false} />
          </div>
        )}
        
        <div style={{ filter: loading ? 'blur(5px)' : 'none', pointerEvents: loading ? 'none' : 'auto' }}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={8}>
              {/* Header */}
              <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                <Heading style={{ marginBottom: '0.5rem' }}>Create Your Account</Heading>
                <p style={{ color: '#6f6f6f', fontSize: '1rem' }}>
                  Banking system registration for anomaly detection
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <InlineNotification
                  kind="error"
                  title="Signup failed"
                  subtitle={error}
                  lowContrast
                  onClose={() => setError('')}
                />
              )}

              {/* Success Notification */}
              {success && (
                <InlineNotification
                  kind="success"
                  title="Success"
                  subtitle={success}
                  lowContrast
                  onClose={() => setSuccess('')}
                />
              )}

              {/* Personal Information Section */}
              <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <Stack gap={6}>
                  <Heading style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Personal Information
                  </Heading>
                  <Grid narrow>
                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="first_name"
                            labelText="First Name"
                            invalid={!!errors.first_name}
                            invalidText={errors.first_name?.message}
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="last_name"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="last_name"
                            labelText="Last Name"
                            invalid={!!errors.last_name}
                            invalidText={errors.last_name?.message}
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="email"
                            labelText="Email"
                            type="email"
                            invalid={!!errors.email}
                            invalidText={errors.email?.message}
                            helperText="e.g., user@example.com"
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="phone_number"
                            labelText="Phone Number"
                            type="tel"
                            invalid={!!errors.phone_number}
                            invalidText={errors.phone_number?.message}
                            helperText="Enter exactly 10 digits"
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="date_of_birth"
                        control={control}
                        render={({ field: { onChange, value, ...field } }) => (
                          <DatePicker datePickerType="single" onChange={(dates) => onChange(dates?.[0])}>
                            <DatePickerInput
                              {...field}
                              id="date_of_birth"
                              labelText="Date of Birth"
                              placeholder="mm/dd/yyyy"
                              invalid={!!errors.date_of_birth}
                              invalidText={errors.date_of_birth?.message}
                            />
                          </DatePicker>
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="gender"
                            labelText="Gender"
                            invalid={!!errors.gender}
                            invalidText={errors.gender?.message}
                          >
                            <SelectItem value="" text="Select gender" />
                            <SelectItem value="Male" text="Male" />
                            <SelectItem value="Female" text="Female" />
                            <SelectItem value="Other" text="Other" />
                            <SelectItem value="Prefer not to say" text="Prefer not to say" />
                          </Select>
                        )}
                      />
                    </Column>
                  </Grid>
                </Stack>
              </Tile>

              {/* Security Section */}
              <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <Stack gap={6}>
                  <Heading style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Security & Authentication
                  </Heading>
                  <Grid narrow>
                    <Column lg={8} md={4} sm={4}>
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
                            helperText="Min 8 characters with uppercase, lowercase, and number"
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="confirm_password"
                        control={control}
                        render={({ field }) => (
                          <PasswordInput
                            {...field}
                            id="confirm_password"
                            labelText="Confirm Password"
                            invalid={!!errors.confirm_password}
                            invalidText={errors.confirm_password?.message}
                          />
                        )}
                      />
                    </Column>
                  </Grid>
                </Stack>
              </Tile>

              {/* Address Section */}
              <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <Stack gap={6}>
                  <Heading style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Address Information
                  </Heading>
                  <Grid narrow>
                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="country"
                            labelText="Country"
                            invalid={!!errors.country}
                            invalidText={errors.country?.message}
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="state"
                            labelText="State"
                            invalid={!!errors.state}
                            invalidText={errors.state?.message}
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="city"
                            labelText="City"
                            invalid={!!errors.city}
                            invalidText={errors.city?.message}
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="postal_code"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="postal_code"
                            labelText="Postal Code"
                            invalid={!!errors.postal_code}
                            invalidText={errors.postal_code?.message}
                            helperText="Enter exactly 6 digits"
                          />
                        )}
                      />
                    </Column>
                  </Grid>
                </Stack>
              </Tile>

              {/* Account Details Section */}
              <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <Stack gap={6}>
                  <Heading style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Account Details
                  </Heading>
                  <Grid narrow>
                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="account_type"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="account_type"
                            labelText="Account Type"
                            invalid={!!errors.account_type}
                            invalidText={errors.account_type?.message}
                          >
                            <SelectItem value="" text="Select account type" />
                            <SelectItem value="Savings" text="Savings" />
                            <SelectItem value="Current" text="Current" />
                            <SelectItem value="Credit" text="Credit" />
                          </Select>
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="currency_preference"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="currency_preference"
                            labelText="Currency Preference"
                            invalid={!!errors.currency_preference}
                            invalidText={errors.currency_preference?.message}
                          >
                            <SelectItem value="" text="Select currency" />
                            {currencyOptions.map((currency) => (
                              <SelectItem key={currency} value={currency} text={currency} />
                            ))}
                          </Select>
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="occupation"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="occupation"
                            labelText="Occupation"
                            invalid={!!errors.occupation}
                            invalidText={errors.occupation?.message}
                          />
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="income_range"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="income_range"
                            labelText="Income Range"
                            helperText={currencyPreference ? `Income ranges displayed in ${currencySymbol}` : 'Select a currency preference first'}
                            disabled={!currencyPreference}
                            invalid={!!errors.income_range}
                            invalidText={errors.income_range?.message}
                          >
                            <SelectItem value="" text="Select income range" />
                            {incomeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} text={option.text} />
                            ))}
                          </Select>
                        )}
                      />
                    </Column>

                    <Column lg={8} md={4} sm={4}>
                      <Controller
                        name="preferred_language"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="preferred_language"
                            labelText="Preferred Language"
                            invalid={!!errors.preferred_language}
                            invalidText={errors.preferred_language?.message}
                          >
                            <SelectItem value="" text="Select language" />
                            {languageOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} text={option.text} />
                            ))}
                          </Select>
                        )}
                      />
                    </Column>
                  </Grid>
                </Stack>
              </Tile>

              {/* Submit Button */}
              <div style={{ paddingTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Button type="submit" kind="primary" size="lg" disabled={loading || isSubmitting} style={{ minWidth: '200px' }}>
                  {loading || isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              {/* Sign In Link */}
              <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                <p style={{ color: '#6f6f6f' }}>
                  Already have an account?{' '}
                  <Button kind="ghost" size="sm" onClick={handleSignIn} style={{ padding: 0, textDecoration: 'underline' }}>
                    Sign In
                  </Button>
                </p>
              </div>
            </Stack>
          </Form>
        </div>
      </div>
    </div>
  )
}
