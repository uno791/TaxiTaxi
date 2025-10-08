import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import {
  MAX_UPGRADE_LEVEL,
  baseMaxBoost,
  brakeIncreasePerLevel,
  brakeUpgradePrice,
  boostCapacityIncreasePerLevel,
  boostForceIncreasePerLevel,
  boostUpgradePrice,
  speedIncreasePerLevel,
  speedUpgradePrice,
} from "./constants/upgrades";

type GameContextType = {
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  kilometers: number;
  setKilometers: React.Dispatch<React.SetStateAction<number>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  boost: number;
  setBoost: React.Dispatch<React.SetStateAction<number>>;
  maxBoost: number;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  speedLevel: number;
  brakeLevel: number;
  boostLevel: number;
  speedMultiplier: number;
  brakeMultiplier: number;
  boostForceMultiplier: number;
  upgradeSpeed: () => void;
  upgradeBrakes: () => void;
  upgradeBoost: () => void;
  speedUpgradePrice: number;
  brakeUpgradePrice: number;
  boostUpgradePrice: number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [money, setMoney] = useState(1000);
  const [kilometers, setKilometers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [boost, setBoost] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(0);
  const [brakeLevel, setBrakeLevel] = useState(0);
  const [boostLevel, setBoostLevel] = useState(0);

  const speedMultiplier = 1 + speedLevel * speedIncreasePerLevel;
  const brakeMultiplier = 1 + brakeLevel * brakeIncreasePerLevel;
  const boostForceMultiplier = 1 + boostLevel * boostForceIncreasePerLevel;
  const maxBoost =
    baseMaxBoost * (1 + boostLevel * boostCapacityIncreasePerLevel);

  const upgradeSpeed = () => {
    setSpeedLevel((previous) => {
      if (previous >= MAX_UPGRADE_LEVEL) return previous;

      let applied = false;
      setMoney((currentMoney) => {
        if (currentMoney < speedUpgradePrice) return currentMoney;
        applied = true;
        return currentMoney - speedUpgradePrice;
      });

      if (!applied) return previous;
      return previous + 1;
    });
  };

  const upgradeBrakes = () => {
    setBrakeLevel((previous) => {
      if (previous >= MAX_UPGRADE_LEVEL) return previous;

      let applied = false;
      setMoney((currentMoney) => {
        if (currentMoney < brakeUpgradePrice) return currentMoney;
        applied = true;
        return currentMoney - brakeUpgradePrice;
      });

      if (!applied) return previous;
      return previous + 1;
    });
  };

  const upgradeBoost = () => {
    setBoostLevel((previous) => {
      if (previous >= MAX_UPGRADE_LEVEL) return previous;

      let applied = false;
      setMoney((currentMoney) => {
        if (currentMoney < boostUpgradePrice) return currentMoney;
        applied = true;
        return currentMoney - boostUpgradePrice;
      });

      if (!applied) return previous;
      return previous + 1;
    });
  };

  return (
    <GameContext.Provider
      value={{
        money,
        setMoney,
        kilometers,
        setKilometers,
        speed,
        setSpeed,
        boost,
        setBoost,
        maxBoost,
        gameOver,
        setGameOver,
        speedLevel,
        brakeLevel,
        boostLevel,
        speedMultiplier,
        brakeMultiplier,
        boostForceMultiplier,
        upgradeSpeed,
        upgradeBrakes,
        upgradeBoost,
        speedUpgradePrice,
        brakeUpgradePrice,
        boostUpgradePrice,
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
