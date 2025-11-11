import { useState, useEffect } from 'react';
import './FeatureCollection.css';

const FeatureCollection = () => {
  const [features, setFeatures] = useState({
    user_id: '',
    session_id: '',
    timestamp: '',
    country: '',
    city: '',
    prev_country: '',
    ip_address: '',
    isp: '',
    is_vpn: false,
    is_tor: false,
    is_proxy: false,
    is_datacenter_ip: false,
    ip_reputation_score: 0,
    device_fingerprint: '',
    device_type: '',
    time_since_last_login_hours: 0,
    distance_from_last_login_km: 0,
    login_attempts: 0,
    failed_attempts: 0,
    password_correct: false,
    time_to_login_seconds: 0,
    is_breached_credential: false,
    mfa_required: false,
    mfa_method: '',
    mfa_attempts: 0,
    mfa_success: false,
    mfa_time_taken_seconds: 0,
    mfa_method_changed: false,
    push_notification_count: 0,
    hour_of_day: 0,
    day_of_week: 0,
    is_weekend: false,
    is_unusual_time: false,
    typing_speed_chars_per_min: 0,
    mouse_movement_entropy: 0,
    concurrent_sessions: 0,
    session_duration_last_minutes: 0,
    velocity_score: 0,
    device_trust_score: 0,
    location_trust_score: 0,
    risk_score: 0,
    is_anomaly: false,
    anomaly_category: ''
  });

  useEffect(() => {
    // Mock data generation for demonstration
    const generateMockData = () => {
      setFeatures({
        user_id: 'user123',
        session_id: 'session456',
        timestamp: new Date().toISOString(),
        country: 'USA',
        city: 'New York',
        prev_country: 'UK',
        ip_address: '192.168.1.1',
        isp: 'Comcast',
        is_vpn: false,
        is_tor: false,
        is_proxy: false,
        is_datacenter_ip: false,
        ip_reputation_score: 95,
        device_fingerprint: 'fingerprint789',
        device_type: 'Desktop',
        time_since_last_login_hours: 12,
        distance_from_last_login_km: 500,
        login_attempts: 1,
        failed_attempts: 0,
        password_correct: true,
        time_to_login_seconds: 5,
        is_breached_credential: false,
        mfa_required: true,
        mfa_method: 'SMS',
        mfa_attempts: 1,
        mfa_success: true,
        mfa_time_taken_seconds: 10,
        mfa_method_changed: false,
        push_notification_count: 2,
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
        is_weekend: new Date().getDay() === 0 || new Date().getDay() === 6,
        is_unusual_time: new Date().getHours() < 6 || new Date().getHours() > 22,
        typing_speed_chars_per_min: 300,
        mouse_movement_entropy: 0.8,
        concurrent_sessions: 1,
        session_duration_last_minutes: 30,
        velocity_score: 0.1,
        device_trust_score: 0.9,
        location_trust_score: 0.8,
        risk_score: 0.2,
        is_anomaly: false,
        anomaly_category: 'None'
      });
    };

    generateMockData();
  }, []);

  const sendToEventStream = () => {
    const eventStreamUrl = '/api/event-stream/proxy';
    const payload = {
      records: [
        {
          value: features
        }
      ]
    };

    fetch(eventStreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.kafka.json.v2+json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Successfully sent to event stream:', data);
      alert('Data sent to event stream successfully!');
    })
    .catch(error => {
      console.error('Error sending to event stream:', error);
      alert('Error sending data to event stream.');
    });
  };

  return (
    <div className="feature-collection-container">
      <h2>Feature Collection</h2>
      <div className="features-grid">
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="feature-item">
            <label>{key.replace(/_/g, ' ')}:</label>
            <input type="text" value={value.toString()} readOnly />
          </div>
        ))}
      </div>
      <button onClick={sendToEventStream}>Send to Event Stream</button>
    </div>
  );
};

export default FeatureCollection;
