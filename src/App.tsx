import React from 'react';
import TaxiGame from './game/components/TaxiGame';
import styles from './App.module.css';

const App: React.FC = () => (
  <div className={styles.app}>
    <TaxiGame />
  </div>
);

export default App;
