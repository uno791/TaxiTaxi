import React from 'react';

interface DialoguePanelProps {
  dialogue: string;
  speaker: string;
  visible: boolean;
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '24px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(8, 0, 0, 0.82)',
  color: '#f5f2e8',
  padding: '18px 28px',
  borderRadius: '12px',
  width: 'min(640px, 90vw)',
  fontSize: '1.05rem',
  lineHeight: 1.4,
  boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
  border: '1px solid rgba(255,255,255,0.12)',
};

const speakerStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '8px',
  color: '#ffdd9b',
};

const DialoguePanel: React.FC<DialoguePanelProps> = ({ dialogue, speaker, visible }) => {
  if (!visible || !dialogue) {
    return null;
  }

  return (
    <div style={panelStyle}>
      <div style={speakerStyle}>{speaker}</div>
      <div>{dialogue}</div>
    </div>
  );
};

export default DialoguePanel;
