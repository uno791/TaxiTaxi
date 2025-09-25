import React from 'react';
import TaxiGame from './game/components/TaxiGame';

const appStyle: React.CSSProperties = {
  width: '100%',
  height: '100vh',
  margin: 0,
};

const App: React.FC = () => (
  <div style={appStyle}>
    <TaxiGame />
  </div>
);

export default App;
