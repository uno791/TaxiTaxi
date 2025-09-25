import React, { useRef } from 'react';
import DecisionPanel from './DecisionPanel';
import DialoguePanel from './DialoguePanel';
import EndingPanel from './EndingPanel';
import HudPanel from './HudPanel';
import { useTaxiGame } from '../hooks/useTaxiGame';

const containerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: '#050505',
  fontFamily: '"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const canvasHostStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const loadingStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#f1efe6',
  letterSpacing: '0.2em',
  background: 'rgba(5, 5, 8, 0.92)',
};

const TaxiGame: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const game = useTaxiGame(sceneRef);

  return (
    <div style={containerStyle}>
      <div ref={sceneRef} style={canvasHostStyle} />

      <HudPanel
        rideName={game.currentRide.name}
        timer={game.timer}
        crashes={game.crashes}
        speed={game.speed}
        earnings={game.earnings}
        distance={game.distanceToDestination}
        destinationHint={game.currentRide.destination.description}
        mode={game.interactionMode}
        statusMessage={game.statusMessage}
        showStatus={!game.gameEnded && Boolean(game.statusMessage)}
      />

      <DialoguePanel
        dialogue={game.dialogue}
        speaker={game.currentRide.name}
        visible={!game.gameEnded}
      />

      {game.showDecision && <DecisionPanel onChoose={game.chooseDecision} />}

      {!game.ready && (
        <div style={loadingStyle}>
          <div>Loading Night Shift…</div>
        </div>
      )}

      {game.gameEnded && <EndingPanel dialogue={game.dialogue} earnings={game.earnings} />}
    </div>
  );
};

export default TaxiGame;
