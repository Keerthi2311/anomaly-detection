import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Heading, Tile, Button, Grid, Column } from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'

const fields = [
  'prev_country',
  'ip_reputation_score',
  'time_since_last_login_hours',
  'distance_from_last_login_km',
  'is_breached_credential',
  'mfa_method',
  'mfa_method_changed',
  'push_notification_count',
  'concurrent_sessions',
  'session_duration_last_minutes',
  'velocity_score',
  'device_trust_score',
  'location_trust_score',
  'risk_score',
  'is_anomaly',
  'anomaly_category',
]

export default function AdvancedFeatures() {
  const navigate = useNavigate()

  // derive metrics from stored login/mfa data
  const data = useMemo(() => {
    let out = {}
    try {
      const lf = JSON.parse(localStorage.getItem('last_login_features') || 'null')
      const mf = JSON.parse(localStorage.getItem('last_mfa_features') || 'null')
      const user = JSON.parse(localStorage.getItem('current_user') || 'null')

      const now = Date.now()
      const loginTs = lf?.timestamp ? new Date(lf.timestamp).getTime() : now
      const hoursSinceLogin = (now - loginTs) / (1000 * 60 * 60)

      // prev_country from history if available
      let prevCountry = null
      if (lf?.user_id) {
        try {
          const hist = JSON.parse(localStorage.getItem(`login_country_history_${lf.user_id}`) || '{}')
          prevCountry = hist.previousCountry || null
        } catch {}
      }

      // ip reputation: simple score 0-100 lowered by risk flags
      let ipScore = 100
      if (lf) {
        if (lf.is_vpn) ipScore -= 30
        if (lf.is_proxy) ipScore -= 20
        if (lf.is_datacenter_ip) ipScore -= 25
        if (/aws|amazon|gcp|google|azure|cloudflare/i.test(lf.isp || '')) ipScore -= 10
      }
      ipScore = Math.max(0, Math.min(100, ipScore))

      // distance from last login: unavailable → 0 (no prior coords stored)
      const distanceKm = 0

      const breached = false
      const mfaMethod = 'email_otp'
      const mfaChanged = 0
      const pushCount = 0
      const concurrentSessions = 1
      const sessionDurationMin = (Number(lf?.time_to_login_seconds || 0) + Number(mf?.mfa_time_taken_seconds || 0)) / 60

      // velocity score: based on failed attempts and time to login
      let velocity = 50
      if (lf) {
        velocity += Math.min(40, (lf.failed_attempts || 0) * 5)
        velocity += Math.min(10, Math.max(0, 30 - (lf.typing_speed_chars_per_min || 0)) / 3)
      }
      velocity = Math.max(0, Math.min(100, velocity))

      // device trust score: lower if datacenter, proxy, vpn
      let deviceTrust = 100
      if (lf) {
        if (lf.is_datacenter_ip) deviceTrust -= 50
        if (lf.is_proxy) deviceTrust -= 20
        if (lf.is_vpn) deviceTrust -= 20
      }
      deviceTrust = Math.max(0, Math.min(100, deviceTrust))

      // location trust score: lower if unusual time or weekend or country changed
      let locationTrust = 100
      if (lf) {
        if (lf.is_unusual_time) locationTrust -= 30
        if (lf.is_weekend) locationTrust -= 10
        if (prevCountry && prevCountry !== lf.country) locationTrust -= 30
      }
      locationTrust = Math.max(0, Math.min(100, locationTrust))

      // risk score combine
      // Higher risk if low trust or high velocity or low ip reputation
      const risk = Math.max(0, Math.min(100, Math.round((
        (100 - deviceTrust) * 0.35 +
        (100 - locationTrust) * 0.25 +
        (100 - ipScore) * 0.25 +
        velocity * 0.15
      ))))

      const isAnomaly = risk >= 60 ? 1 : 0
      let category = 'normal'
      if (isAnomaly) {
        if ((100 - deviceTrust) >= 40) category = 'device'
        else if ((100 - locationTrust) >= 40) category = 'location'
        else if (velocity >= 70) category = 'velocity'
        else if ((100 - ipScore) >= 50) category = 'ip_reputation'
        else category = 'mixed'
      }

      out = {
        prev_country: prevCountry || '-',
        ip_reputation_score: Math.round(ipScore),
        time_since_last_login_hours: Number(hoursSinceLogin.toFixed(2)),
        distance_from_last_login_km: distanceKm,
        is_breached_credential: breached ? 1 : 0,
        mfa_method: mfaMethod,
        mfa_method_changed: mfaChanged,
        push_notification_count: pushCount,
        concurrent_sessions: concurrentSessions,
        session_duration_last_minutes: Number(sessionDurationMin.toFixed(2)),
        velocity_score: Math.round(velocity),
        device_trust_score: Math.round(deviceTrust),
        location_trust_score: Math.round(locationTrust),
        risk_score: risk,
        is_anomaly: isAnomaly,
        anomaly_category: category,
      }
    } catch {
      out = {}
    }
    return out
  }, [])

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
            <Heading>Advanced Features</Heading>
          </div>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Grid narrow>
              {fields.map((f) => (
                <Column key={f} lg={8} md={4} sm={4}>
                  <KeyValue label={f} value={data[f]} />
                </Column>
              ))}
            </Grid>
          </Tile>
        </Stack>
      </div>
    </div>
  )
}


