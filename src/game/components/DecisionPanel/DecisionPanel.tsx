import React from 'react';
import type { DecisionOption } from '../../types';
import styles from './DecisionPanel.module.css';

interface DecisionPanelProps {
  onChoose: (choice: DecisionOption) => void;
}

const DecisionPanel: React.FC<DecisionPanelProps> = ({ onChoose }) => (
  <div className={styles.container}>
    <div className={styles.message}>
      Do you trust the stranger and drive to the empty field, or do you turn toward the police station?
    </div>
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.button} ${styles.fieldButton}`}
        onClick={() => onChoose('field')}
      >
        Go to the Field
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.policeButton}`}
        onClick={() => onChoose('police')}
      >
        Go to the Police
      </button>
    </div>
  </div>
);

export default DecisionPanel;
