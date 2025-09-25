import React from 'react';

interface HudPanelProps {
  rideName: string;
  timer: number;
  crashes: number;
  speed: number;
  earnings: number;
  distance: number;
  destinationHint: string;
  mode: 'drive' | 'walk';
  statusMessage: string | null;
  showStatus: boolean;
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '24px',
  left: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  color: '#f1efe2',
  fontSize: '0.95rem',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(12, 0, 0, 0.72)',
  borderRadius: '10px',
  padding: '14px 18px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
  minWidth: '220px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#ff9966',
  marginBottom: '6px',
};

const HudPanel: React.FC<HudPanelProps> = ({
  rideName,
  timer,
  crashes,
  speed,
  earnings,
  distance,
  destinationHint,
  mode,
  statusMessage,
  showStatus,
}) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <div style={headingStyle}>Shift</div>
      <div>Passenger: {rideName}</div>
      <div>Timer: {timer.toFixed(1)} s</div>
      <div>Speed: {speed} km/h</div>
      <div>Crashes: {crashes}</div>
      <div>Earnings: THB {earnings.toFixed(0)}</div>
      <div>Mode: {mode === 'drive' ? 'Driving' : 'On Foot'}</div>
      <div>Distance: {Number.isFinite(distance) ? `${distance.toFixed(1)} m` : '---'}</div>
      <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '4px' }}>Route: {destinationHint}</div>
    </div>
    {showStatus && statusMessage && (
      <div style={{ ...cardStyle, background: 'rgba(24, 3, 3, 0.82)' }}>
        <div style={{ ...headingStyle, color: '#f3cd92' }}>Status</div>
        <div>{statusMessage}</div>
      </div>
    )}
  </div>
);

export default HudPanel;
