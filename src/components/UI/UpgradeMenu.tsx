import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "../../GameContext";
import upgradeIcon from "../../assets/upgrade-svgrepo-com.svg";
import {
  MAX_UPGRADE_LEVEL,
  brakeIncreasePerLevel,
  brakeUpgradePrice,
  boostCapacityIncreasePerLevel,
  boostForceIncreasePerLevel,
  boostUpgradePrice,
  speedIncreasePerLevel,
  speedUpgradePrice,
} from "../../constants/upgrades";

type UpgradeEntry = {
  key: "speed" | "brakes" | "boost";
  label: string;
  level: number;
  cost: number;
  onUpgrade: () => void;
  descriptor: string;
  disabled: boolean;
};

const levelBoxes = Array.from(
  { length: MAX_UPGRADE_LEVEL },
  (_, index) => index
);

export default function UpgradeMenu() {
  const [open, setOpen] = useState(false);
  const levelUpSoundRef = useRef<HTMLAudioElement | null>(null);
  const {
    money,
    speedLevel,
    brakeLevel,
    boostLevel,
    upgradeSpeed,
    upgradeBrakes,
    upgradeBoost,
    missionFinderCharges,
    missionFinderPrice,
    purchaseMissionFinder,
  } = useGame();

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio("sounds/level-up.wav");
    audio.preload = "auto";
    audio.volume = 0.7;
    levelUpSoundRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      levelUpSoundRef.current = null;
    };
  }, []);

  const playUpgradeSound = useCallback(() => {
    const base = levelUpSoundRef.current;
    if (!base) return;

    const clone = base.cloneNode(true) as HTMLAudioElement;
    const cleanup = () => {
      clone.pause();
      clone.removeEventListener("ended", cleanup);
      clone.src = "";
    };
    clone.addEventListener("ended", cleanup, { once: true });
    const start = () => {
      clone.currentTime = 0;
      clone.volume = base.volume;
      clone.muted = false;
      void clone.play().catch(() => undefined);
    };

    if (clone.readyState >= 2) {
      start();
      return;
    }

    clone.addEventListener("canplaythrough", start, { once: true });
    clone.load();
  }, []);

  const upgrades: UpgradeEntry[] = [
    {
      key: "speed",
      label: "Speed",
      level: speedLevel,
      cost: speedUpgradePrice,
      onUpgrade: upgradeSpeed,
      descriptor: `+${Math.round(speedIncreasePerLevel * 100)}% engine force`,
      disabled: speedLevel >= MAX_UPGRADE_LEVEL || money < speedUpgradePrice,
    },
    {
      key: "brakes",
      label: "Brakes",
      level: brakeLevel,
      cost: brakeUpgradePrice,
      onUpgrade: upgradeBrakes,
      descriptor: `+${Math.round(brakeIncreasePerLevel * 100)}% braking`,
      disabled: brakeLevel >= MAX_UPGRADE_LEVEL || money < brakeUpgradePrice,
    },
    {
      key: "boost",
      label: "Boost",
      level: boostLevel,
      cost: boostUpgradePrice,
      onUpgrade: upgradeBoost,
      descriptor: `+${Math.round(
        boostForceIncreasePerLevel * 100
      )}% power / +${Math.round(
        boostCapacityIncreasePerLevel * 100
      )}% capacity`,
      disabled: boostLevel >= MAX_UPGRADE_LEVEL || money < boostUpgradePrice,
    },
  ];

  const missionFinderDisabled = money < missionFinderPrice;
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 48,
          height: 48,
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          background: open
            ? "linear-gradient(145deg, rgba(255, 215, 64, 0.95), rgba(255, 145, 0, 0.9))"
            : "#ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          boxShadow: open
            ? "0 6px 16px rgba(255, 145, 0, 0.35)"
            : "0 6px 16px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(3px)",
        }}
        title="Open car upgrades"
      >
        <img
          src={upgradeIcon}
          alt="Upgrades"
          style={{ width: "100%", height: "100%" }}
        />
      </button>

      {open ? (
        <div
          style={{
            width: 280,
            padding: "16px 18px",
            borderRadius: 16,
            background: "rgba(18, 20, 26, 0.93)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.45)",
            color: "#f5f5f5",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            <span>Upgrades</span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Wallet: R{money.toFixed(0)}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {upgrades.map(
              ({
                key,
                label,
                level,
                cost,
                onUpgrade,
                descriptor,
                disabled,
              }) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        {descriptor}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        playUpgradeSound();
                        onUpgrade();
                      }}
                      disabled={disabled}
                      style={{
                        border: "none",
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: disabled ? "not-allowed" : "pointer",
                        color: disabled ? "rgba(255,255,255,0.4)" : "#1c1304",
                        background: disabled
                          ? "rgba(255,255,255,0.12)"
                          : "linear-gradient(135deg, #ffca28, #ff8f00)",
                        boxShadow: disabled
                          ? "none"
                          : "0 4px 12px rgba(255, 138, 0, 0.35)",
                        transition: "transform 0.1s ease",
                      }}
                    >
                      {level >= MAX_UPGRADE_LEVEL ? "MAX" : `+ R${cost}`}
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      {levelBoxes.map((index) => (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            height: 10,
                            borderRadius: 4,
                            background:
                              index < level
                                ? "linear-gradient(90deg, #ff6f00, #ffa000)"
                                : "rgba(255,255,255,0.15)",
                            transition: "background 0.2s ease",
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                        minWidth: 48,
                        textAlign: "right",
                      }}
                    >
                      {level}/{MAX_UPGRADE_LEVEL}
                    </div>
                  </div>
                </div>
              )
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    Mission Finder
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    Mark the next mission pickup instantly.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (missionFinderDisabled) return;
                    playUpgradeSound();
                    purchaseMissionFinder();
                  }}
                  disabled={missionFinderDisabled}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: missionFinderDisabled ? "not-allowed" : "pointer",
                    color: missionFinderDisabled
                      ? "rgba(255,255,255,0.4)"
                      : "#1c1304",
                    background: missionFinderDisabled
                      ? "rgba(255,255,255,0.12)"
                      : "linear-gradient(135deg, #80deea, #26c6da)",
                    boxShadow: missionFinderDisabled
                      ? "none"
                      : "0 4px 12px rgba(38, 198, 218, 0.35)",
                    transition: "transform 0.1s ease",
                  }}
                >
                  + R{missionFinderPrice}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 4,
                  paddingRight: 2,
                }}
              >
                <span>Finders left</span>
                <span>{missionFinderCharges}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
