import React, { useRef } from 'react';
import DecisionPanel from '../DecisionPanel';
import DialoguePanel from '../DialoguePanel';
import EndingPanel from '../EndingPanel';
import HudPanel from '../HudPanel';
import { useTaxiGame } from '../../hooks/useTaxiGame';
import styles from './TaxiGame.module.css';

const TaxiGame: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const game = useTaxiGame(sceneRef);

  return (
    <div className={styles.container}>
      <div ref={sceneRef} className={styles.canvasHost} />

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
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingText}>Loading Night Shift...</div>
        </div>
      )}

      {game.gameEnded && <EndingPanel dialogue={game.dialogue} earnings={game.earnings} />}
    </div>
  );
};

export default TaxiGame;
