export interface Vector2 {
  x: number;
  z: number;
}

export interface RideDestination {
  position: Vector2;
  radius?: number;
  description: string;
}

export interface RideStart {
  position: Vector2;
  heading?: number;
}

export interface Ride {
  id: string;
  name: string;
  dialogues: string[];
  pay: number;
  decision?: boolean;
  start?: RideStart;
  destination: RideDestination;
}

export type DecisionOption = 'field' | 'police';

export interface RideMetrics {
  startTime: number | null;
  elapsed: number;
  speed: number;
  angle: number;
  crashes: number;
}

export interface TaxiGameUIState {
  dialogue: string;
  timer: number;
  crashes: number;
  rideInProgress: boolean;
  showDecision: boolean;
  decisionMade: DecisionOption | null;
  gameEnded: boolean;
  statusMessage: string | null;
  earnings: number;
}
