import React from 'react';
import styles from './EndingPanel.module.css';

interface EndingPanelProps {
  dialogue: string;
  earnings: number;
}

const EndingPanel: React.FC<EndingPanelProps> = ({ dialogue, earnings }) => (
  <div className={styles.overlay}>
    <div className={styles.title}>Shift Complete</div>
    <div className={styles.summary}>{dialogue}</div>
    <div className={styles.earnings}>Total Earnings: THB {earnings.toFixed(0)}</div>
  </div>
);

export default EndingPanel;
