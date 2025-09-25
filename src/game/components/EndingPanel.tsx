import React from 'react';

interface EndingPanelProps {
  dialogue: string;
  earnings: number;
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#f0ede2',
  padding: '32px',
  textAlign: 'center',
  gap: '16px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: '#f79b62',
};

const EndingPanel: React.FC<EndingPanelProps> = ({ dialogue, earnings }) => (
  <div style={overlayStyle}>
    <div style={titleStyle}>Shift Complete</div>
    <div style={{ maxWidth: '600px', lineHeight: 1.6 }}>{dialogue}</div>
    <div style={{ fontSize: '1rem', opacity: 0.8 }}>Total Earnings: THB {earnings.toFixed(0)}</div>
  </div>
);

export default EndingPanel;
