import React from 'react';
import styles from './DialoguePanel.module.css';

interface DialoguePanelProps {
  dialogue: string;
  speaker: string;
  visible: boolean;
}

const DialoguePanel: React.FC<DialoguePanelProps> = ({ dialogue, speaker, visible }) => {
  if (!visible || !dialogue) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.speaker}>{speaker}</div>
      <div>{dialogue}</div>
    </div>
  );
};

export default DialoguePanel;
