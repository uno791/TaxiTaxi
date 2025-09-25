import React from 'react';
import type { DecisionOption } from '../types';

interface DecisionPanelProps {
  onChoose: (choice: DecisionOption) => void;
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '140px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(32, 0, 0, 0.86)',
  color: '#f4f0de',
  padding: '24px 32px',
  borderRadius: '12px',
  maxWidth: '520px',
  textAlign: 'center',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 18px 38px rgba(0,0,0,0.45)',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 18px',
  margin: '0 8px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.95rem',
  cursor: 'pointer',
  fontWeight: 600,
};

const DecisionPanel: React.FC<DecisionPanelProps> = ({ onChoose }) => (
  <div style={containerStyle}>
    <div style={{ marginBottom: '14px', fontSize: '1.05rem' }}>
      Do you trust the stranger and drive to the empty field, or do you turn toward the police station?
    </div>
    <div>
      <button
        type="button"
        style={{ ...buttonStyle, background: '#401919', color: '#f7d6c0' }}
        onClick={() => onChoose('field')}
      >
        Go to the Field
      </button>
      <button
        type="button"
        style={{ ...buttonStyle, background: '#1a2f40', color: '#c6e6ff' }}
        onClick={() => onChoose('police')}
      >
        Go to the Police
      </button>
    </div>
  </div>
);

export default DecisionPanel;
