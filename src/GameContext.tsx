import { createContext, useContext, useCallback, useState } from "react";
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

type EconomyState = {
  money: number;
  speedLevel: number;
  brakeLevel: number;
  boostLevel: number;
};

const initialEconomyState: EconomyState = {
  money: 1000,
  speedLevel: 0,
  brakeLevel: 0,
  boostLevel: 0,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [economy, setEconomy] = useState<EconomyState>(initialEconomyState);
  const [kilometers, setKilometers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [boost, setBoost] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const { money, speedLevel, brakeLevel, boostLevel } = economy;

  const setMoney = useCallback(
    (update: React.SetStateAction<number>) => {
      setEconomy((previous) => {
        const nextMoney =
          typeof update === "function"
            ? (update as (value: number) => number)(previous.money)
            : update;
        if (nextMoney === previous.money) return previous;
        return { ...previous, money: nextMoney };
      });
    },
    [setEconomy]
  );

  const speedMultiplier = 1 + speedLevel * speedIncreasePerLevel;
  const brakeMultiplier = 1 + brakeLevel * brakeIncreasePerLevel;
  const boostForceMultiplier = 1 + boostLevel * boostForceIncreasePerLevel;
  const maxBoost =
    baseMaxBoost * (1 + boostLevel * boostCapacityIncreasePerLevel);

  const upgradeSpeed = () => {
    setEconomy((previous) => {
      if (
        previous.speedLevel >= MAX_UPGRADE_LEVEL ||
        previous.money < speedUpgradePrice
      ) {
        return previous;
      }

      return {
        ...previous,
        speedLevel: previous.speedLevel + 1,
        money: previous.money - speedUpgradePrice,
      };
    });
  };

  const upgradeBrakes = () => {
    setEconomy((previous) => {
      if (
        previous.brakeLevel >= MAX_UPGRADE_LEVEL ||
        previous.money < brakeUpgradePrice
      ) {
        return previous;
      }

      return {
        ...previous,
        brakeLevel: previous.brakeLevel + 1,
        money: previous.money - brakeUpgradePrice,
      };
    });
  };

  const upgradeBoost = () => {
    setEconomy((previous) => {
      if (
        previous.boostLevel >= MAX_UPGRADE_LEVEL ||
        previous.money < boostUpgradePrice
      ) {
        return previous;
      }

      return {
        ...previous,
        boostLevel: previous.boostLevel + 1,
        money: previous.money - boostUpgradePrice,
      };
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
