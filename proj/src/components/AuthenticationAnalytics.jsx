import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Heading, Tile, Button, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'

export default function AuthenticationAnalytics() {
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

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Stack gap={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button kind="ghost" size="sm" onClick={() => navigate('/dashboard')} renderIcon={ArrowLeft}>
              Back
            </Button>
            <Heading>Authentication Analytics</Heading>
          </div>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>Login Features (computed)</Heading>
            {loginFeatures ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[
                        'user_id','session_id','timestamp','country','city','ip_address','isp','is_vpn','is_tor','is_proxy','is_datacenter_ip','device_fingerprint','device_type','login_attempts','failed_attempts','password_correct','hour_of_day','day_of_week','is_weekend','is_unusual_time','typing_speed_chars_per_min','mouse_movement_entropy','time_to_login_seconds',
                      ].map((h) => (
                        <TableHeader key={h}>{h}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{loginFeatures.user_id}</TableCell>
                      <TableCell>{loginFeatures.session_id}</TableCell>
                      <TableCell>{new Date(loginFeatures.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{loginFeatures.country}</TableCell>
                      <TableCell>{loginFeatures.city}</TableCell>
                      <TableCell>{loginFeatures.ip_address}</TableCell>
                      <TableCell>{loginFeatures.isp}</TableCell>
                      <TableCell>{loginFeatures.is_vpn}</TableCell>
                      <TableCell>{loginFeatures.is_tor}</TableCell>
                      <TableCell>{loginFeatures.is_proxy}</TableCell>
                      <TableCell>{loginFeatures.is_datacenter_ip}</TableCell>
                      <TableCell>{loginFeatures.device_fingerprint}</TableCell>
                      <TableCell>{loginFeatures.device_type}</TableCell>
                      <TableCell>{loginFeatures.login_attempts}</TableCell>
                      <TableCell>{loginFeatures.failed_attempts}</TableCell>
                      <TableCell>{loginFeatures.password_correct}</TableCell>
                      <TableCell>{loginFeatures.hour_of_day}</TableCell>
                      <TableCell>{loginFeatures.day_of_week}</TableCell>
                      <TableCell>{loginFeatures.is_weekend}</TableCell>
                      <TableCell>{loginFeatures.is_unusual_time}</TableCell>
                      <TableCell>{loginFeatures.typing_speed_chars_per_min}</TableCell>
                      <TableCell>{loginFeatures.mouse_movement_entropy}</TableCell>
                      <TableCell>{loginFeatures.time_to_login_seconds}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <p>No login features recorded yet. Sign in once to populate.</p>
            )}
          </Tile>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '0.75rem' }}>MFA Features (computed)</Heading>
            {mfaFeatures ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['user_id','session_id','timestamp','mfa_required','mfa_attempts','mfa_success','mfa_time_taken_seconds'].map((h) => (
                        <TableHeader key={h}>{h}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{mfaFeatures.user_id}</TableCell>
                      <TableCell>{mfaFeatures.session_id}</TableCell>
                      <TableCell>{new Date(mfaFeatures.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{mfaFeatures.mfa_required}</TableCell>
                      <TableCell>{mfaFeatures.mfa_attempts}</TableCell>
                      <TableCell>{mfaFeatures.mfa_success}</TableCell>
                      <TableCell>{mfaFeatures.mfa_time_taken_seconds}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <p>No MFA features recorded yet.</p>
            )}
          </Tile>
        </Stack>
      </div>
    </div>
  )
}


