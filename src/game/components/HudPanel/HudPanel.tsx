import React from 'react';
import styles from './HudPanel.module.css';

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
  <div className={styles.container}>
    <div className={styles.card}>
      <div className={styles.heading}>Shift</div>
      <div>Passenger: {rideName}</div>
      <div>Timer: {timer.toFixed(1)} s</div>
      <div>Speed: {speed} km/h</div>
      <div>Crashes: {crashes}</div>
      <div>Earnings: THB {earnings.toFixed(0)}</div>
      <div>Mode: {mode === 'drive' ? 'Driving' : 'On Foot'}</div>
      <div>Distance: {Number.isFinite(distance) ? `${distance.toFixed(1)} m` : '---'}</div>
      <div className={styles.route}>Route: {destinationHint}</div>
    </div>
    {showStatus && statusMessage && (
      <div className={`${styles.card} ${styles.statusCard}`}>
        <div className={`${styles.heading} ${styles.statusHeading}`}>Status</div>
        <div>{statusMessage}</div>
      </div>
    )}
  </div>
);

export default HudPanel;
