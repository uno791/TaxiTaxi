import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type GameContextType = {
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  kilometers: number;
  setKilometers: React.Dispatch<React.SetStateAction<number>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [money, setMoney] = useState(1000);
  const [kilometers, setKilometers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  return (
    <GameContext.Provider
      value={{
        money,
        setMoney,
        kilometers,
        setKilometers,
        speed,
        setSpeed,
        gameOver,
        setGameOver,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
