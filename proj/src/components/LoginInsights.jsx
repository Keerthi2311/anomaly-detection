import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Heading, Tile, Button, Grid, Column, Tag } from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'

export default function LoginInsights() {
  const navigate = useNavigate()

  const loginFeatures = useMemo(() => {
    try {
      const json = localStorage.getItem('last_login_features')
      if (json) return JSON.parse(json)
    } catch {}
    return null
  }, [])

  const mfaFeatures = useMemo(() => {
    try {
      const json = localStorage.getItem('last_mfa_features')
      if (json) return JSON.parse(json)
    } catch {}
    return null
  }, [])

  const previousCountry = useMemo(() => {
    try {
      const userId = loginFeatures?.user_id
      if (!userId) return null
      const hist = JSON.parse(localStorage.getItem(`login_country_history_${userId}`) || '{}')
      return hist.previousCountry || null
    } catch {
      return null
    }
  }, [loginFeatures])

  const KeyValue = ({ label, value }) => (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', background: '#fff', height: '100%' }}>
      <div style={{ color: '#6f6f6f', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{value ?? '-'}</div>
    </div>
  )

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Stack gap={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button kind="ghost" size="sm" onClick={() => navigate('/dashboard')} renderIcon={ArrowLeft}>
              Back
            </Button>
            <Heading>Login Insights</Heading>
            <div style={{ marginLeft: 'auto' }}>
              <Button
                kind="primary"
                size="sm"
                onClick={() => navigate('/advanced-features')}
                style={{
                  background: 'linear-gradient(135deg, #0f62fe 0%, #33b1ff 100%)',
                  border: 'none',
                }}
              >
                Advanced Features
              </Button>
            </div>
          </div>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>Session</Heading>
            {loginFeatures ? (
              <Grid narrow>
                <Column lg={8} md={4} sm={4}><KeyValue label="User ID" value={loginFeatures.user_id} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Session ID" value={loginFeatures.session_id} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Timestamp" value={new Date(loginFeatures.timestamp).toLocaleString()} /></Column>
              </Grid>
            ) : (
              <p>No session data yet. Sign in to populate.</p>
            )}
          </Tile>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>Network</Heading>
            {loginFeatures ? (
              <Grid narrow>
                <Column lg={8} md={4} sm={4}><KeyValue label="Country (Current)" value={loginFeatures.country} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Country (Previous)" value={previousCountry} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="City" value={loginFeatures.city} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="IP Address" value={loginFeatures.ip_address} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="ISP" value={loginFeatures.isp} /></Column>
                <Column lg={8} md={4} sm={4}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Tag type={loginFeatures.is_vpn ? 'red' : 'gray'}>VPN: {loginFeatures.is_vpn ? 'Yes' : 'No'}</Tag>
                    <Tag type={loginFeatures.is_tor ? 'red' : 'gray'}>TOR: {loginFeatures.is_tor ? 'Yes' : 'No'}</Tag>
                    <Tag type={loginFeatures.is_proxy ? 'red' : 'gray'}>Proxy: {loginFeatures.is_proxy ? 'Yes' : 'No'}</Tag>
                    <Tag type={loginFeatures.is_datacenter_ip ? 'red' : 'gray'}>Datacenter IP: {loginFeatures.is_datacenter_ip ? 'Yes' : 'No'}</Tag>
                  </div>
                </Column>
              </Grid>
            ) : (
              <p>No network data yet.</p>
            )}
          </Tile>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>Device</Heading>
            {loginFeatures ? (
              <Grid narrow>
                <Column lg={8} md={4} sm={4}><KeyValue label="Device Fingerprint" value={loginFeatures.device_fingerprint} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Device Type" value={loginFeatures.device_type} /></Column>
              </Grid>
            ) : (
              <p>No device data yet.</p>
            )}
          </Tile>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>Behavior</Heading>
            {loginFeatures ? (
              <Grid narrow>
                <Column lg={8} md={4} sm={4}><KeyValue label="Login Attempts" value={loginFeatures.login_attempts} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Failed Attempts" value={loginFeatures.failed_attempts} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Password Correct" value={loginFeatures.password_correct ? 'Yes' : 'No'} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Typing Speed (cpm)" value={loginFeatures.typing_speed_chars_per_min} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Mouse Entropy" value={loginFeatures.mouse_movement_entropy} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Time to Login (s)" value={loginFeatures.time_to_login_seconds} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Hour of Day" value={loginFeatures.hour_of_day} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Day of Week" value={loginFeatures.day_of_week} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Weekend" value={loginFeatures.is_weekend ? 'Yes' : 'No'} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Unusual Time" value={loginFeatures.is_unusual_time ? 'Yes' : 'No'} /></Column>
              </Grid>
            ) : (
              <p>No behavior data yet.</p>
            )}
          </Tile>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>MFA</Heading>
            {mfaFeatures ? (
              <Grid narrow>
                <Column lg={8} md={4} sm={4}><KeyValue label="User ID" value={mfaFeatures.user_id} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Session ID" value={mfaFeatures.session_id} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="Timestamp" value={new Date(mfaFeatures.timestamp).toLocaleString()} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="MFA Required" value={mfaFeatures.mfa_required ? 'Yes' : 'No'} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="MFA Attempts" value={mfaFeatures.mfa_attempts} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="MFA Success" value={mfaFeatures.mfa_success ? 'Yes' : 'No'} /></Column>
                <Column lg={8} md={4} sm={4}><KeyValue label="MFA Time (s)" value={mfaFeatures.mfa_time_taken_seconds} /></Column>
              </Grid>
            ) : (
              <p>No MFA data yet.</p>
            )}
          </Tile>
        </Stack>
      </div>
    </div>
  )
}


