import { Html } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import type { Object3D } from "three";
import { useGame } from "../../GameContext";
import { MissionZone } from "./MissionZone";
import { Woman } from "../Ground/SceneObjects/Woman";

type MissionState = "available" | "prompt" | "active" | "completed";

type MissionConfig = {
  id: string;
  pickupPosition: [number, number, number];
  passengerPosition: [number, number, number];
  dropoffPosition: [number, number, number];
  dropoffHint: string;
  reward: number;
  pickupRadius?: number;
  dropoffRadius?: number;
  passengerDialog: string[];
  passengerRotation?: [number, number, number];
  passengerScale?: number;
};

const missionConfigs: MissionConfig[] = [
  {
    id: "mission-tennis",
    pickupPosition: [-26, -1, -20],
    passengerPosition: [-26, 0, -20],
    dropoffPosition: [59, -1, -48],
    dropoffHint: "the tennis courts",
    reward: 350,
    pickupRadius: 3,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI, 0],
    passengerDialog: [
      "Thanks for stopping! I’m running late for my match.",
      "These roads get busier every day, don’t they?",
      "I heard the courts got resurfaced—can’t wait to see them.",
    ],
  },
  {
    id: "mission-docks",
    pickupPosition: [59, 0.012, -58],
    passengerPosition: [59, 0.5, -58],
    dropoffPosition: [-18, -1, 8],
    dropoffHint: "the city docks",
    reward: 420,
    pickupRadius: 3.5,
    dropoffRadius: 4,
    passengerDialog: [
      "Appreciate the pickup. My boat leaves in a few minutes!",
      "Could you take the river road? It’s usually quicker.",
      "I hope the tide hasn’t held everyone up again.",
    ],
  },
  {
    id: "mission-museum",
    pickupPosition: [-33, 0, -22.4],
    passengerPosition: [-33, 0.5, -22.4],
    dropoffPosition: [25, -1, -40],
    dropoffHint: "the museum plaza",
    reward: 380,
    pickupRadius: 3,
    dropoffRadius: 4,
    passengerDialog: [
      "I’ve got an exhibit opening—thank you for the rescue!",
      "Do you know any shortcuts through downtown?",
      "The plaza should be buzzing right about now.",
    ],
  },
  {
    id: "mission-mall",
    pickupPosition: [-12.5, 0.1, -3.45],
    passengerPosition: [-12.5, 0.6, -3.45],
    dropoffPosition: [45, -1, -12],
    dropoffHint: "the shopping district",
    reward: 400,
    pickupRadius: 3,
    dropoffRadius: 4.2,
    passengerDialog: [
      "Perfect timing! The sales end in ten minutes.",
      "Let me know if you spot a faster lane ahead.",
      "I can’t believe how heavy these bags are!",
    ],
  },
];

const missionConfigById: Record<string, MissionConfig> = missionConfigs.reduce(
  (acc, config) => {
    acc[config.id] = config;
    return acc;
  },
  {} as Record<string, MissionConfig>
);

type MissionProps = JSX.IntrinsicElements["group"] & {
  taxiRef?: MutableRefObject<Object3D | null>;
};

type CompletionInfo = {
  missionId: string;
  reward: number;
};

export default function Mission({ taxiRef, ...groupProps }: MissionProps) {
  const [missionStates, setMissionStates] = useState<Record<string, MissionState>>(
    () => {
      const initial: Record<string, MissionState> = {};
      for (const config of missionConfigs) {
        initial[config.id] = "available";
      }
      return initial;
    }
  );
  const [promptMissionId, setPromptMissionId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(
    null
  );
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);

  const missionStatesRef = useRef(missionStates);
  const activeMissionIdRef = useRef(activeMissionId);
  const promptMissionIdRef = useRef(promptMissionId);
  const dialogIntervalRef = useRef<number | null>(null);

  const { setMoney } = useGame();

  useEffect(() => {
    missionStatesRef.current = missionStates;
  }, [missionStates]);

  useEffect(() => {
    activeMissionIdRef.current = activeMissionId;
  }, [activeMissionId]);

  useEffect(() => {
    promptMissionIdRef.current = promptMissionId;
  }, [promptMissionId]);

  const handlePickupEnter = useCallback((missionId: string) => {
    const currentState = missionStatesRef.current[missionId];
    if (currentState !== "available") return;
    const currentActive = activeMissionIdRef.current;
    if (currentActive && currentActive !== missionId) return;
    setMissionStates((prev) => ({ ...prev, [missionId]: "prompt" }));
    setPromptMissionId(missionId);
  }, []);

  const handlePickupExit = useCallback((missionId: string) => {
    setPromptMissionId((current) => (current === missionId ? null : current));
    setMissionStates((prev) => {
      if (prev[missionId] !== "prompt") return prev;
      return { ...prev, [missionId]: "available" };
    });
  }, []);

  const handleStartMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (!missionId) return;
    setMissionStates((prev) => ({ ...prev, [missionId]: "active" }));
    setActiveMissionId(missionId);
    setPromptMissionId(null);
    setDialogIndex(0);
    setDialogVisible(true);
  }, []);

  const handleDeclineMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (missionId) {
      setMissionStates((prev) => ({ ...prev, [missionId]: "available" }));
    }
    setPromptMissionId(null);
  }, []);

  const handleDropoffEnter = useCallback(
    (missionId: string) => {
      if (missionStatesRef.current[missionId] !== "active") return;
      const config = missionConfigById[missionId];
      if (!config) return;
      setMissionStates((prev) => ({ ...prev, [missionId]: "completed" }));
      setActiveMissionId(null);
      setDialogVisible(false);
      setMoney((value) => value + config.reward);
      setCompletionInfo({ missionId, reward: config.reward });
    },
    [setMoney]
  );

  useEffect(() => {
    if (!completionInfo) return;
    const timeout = window.setTimeout(() => setCompletionInfo(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [completionInfo]);

  useEffect(() => {
    if (dialogIntervalRef.current) {
      window.clearInterval(dialogIntervalRef.current);
      dialogIntervalRef.current = null;
    }

    const currentActive = activeMissionIdRef.current;
    if (!currentActive) {
      setDialogVisible(false);
      return;
    }

    const config = missionConfigById[currentActive];
    if (!config || config.passengerDialog.length === 0) {
      setDialogVisible(false);
      return;
    }

    setDialogVisible(true);
    setDialogIndex(0);

    dialogIntervalRef.current = window.setInterval(() => {
      setDialogIndex((prev) => {
        const lines = config.passengerDialog.length;
        if (lines === 0) return 0;
        return (prev + 1) % lines;
      });
    }, 5000);

    return () => {
      if (dialogIntervalRef.current) {
        window.clearInterval(dialogIntervalRef.current);
        dialogIntervalRef.current = null;
      }
    };
  }, [activeMissionId]);

  useEffect(() => {
    return () => {
      if (dialogIntervalRef.current) {
        window.clearInterval(dialogIntervalRef.current);
      }
    };
  }, []);

  const promptConfig = promptMissionId
    ? missionConfigById[promptMissionId] ?? null
    : null;
  const activeConfig = activeMissionId
    ? missionConfigById[activeMissionId] ?? null
    : null;
  const completionConfig = completionInfo
    ? missionConfigById[completionInfo.missionId] ?? null
    : null;

  const activeDialog = activeConfig && activeConfig.passengerDialog.length > 0
    ? activeConfig.passengerDialog[
        dialogIndex % activeConfig.passengerDialog.length
      ]
    : null;

  return (
    <group {...groupProps}>
      {missionConfigs.map((config) => {
        const missionState = missionStates[config.id];
        const pickupActive = missionState === "available" || missionState === "prompt";
        const dropoffActive = missionState === "active";

        return (
          <group key={config.id}>
            {pickupActive && (
              <MissionZone
                position={config.pickupPosition}
                scale={1.5}
                radius={config.pickupRadius ?? 3}
                taxiRef={taxiRef}
                onTaxiEnter={() => handlePickupEnter(config.id)}
                onTaxiExit={() => handlePickupExit(config.id)}
              />
            )}

            {pickupActive && (
              <Woman
                position={config.passengerPosition}
                scale={config.passengerScale ?? 0.5}
                rotation={config.passengerRotation ?? [0, Math.PI, 0]}
              />
            )}

            {dropoffActive && (
              <MissionZone
                position={config.dropoffPosition}
                scale={1.8}
                radius={config.dropoffRadius ?? 4}
                taxiRef={taxiRef}
                onTaxiEnter={() => handleDropoffEnter(config.id)}
              />
            )}
          </group>
        );
      })}

      {promptConfig && (
        <Html fullscreen zIndexRange={[20, 10]}>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                pointerEvents: "auto",
                minWidth: "320px",
                maxWidth: "400px",
                background: "rgba(22, 22, 22, 0.95)",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 18px 36px rgba(0,0,0,0.45)",
                color: "#f5f5f5",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
                Start Mission?
              </div>
              <div style={{ lineHeight: 1.5, marginBottom: "18px" }}>
                Drive the passenger to {promptConfig.dropoffHint}. Reward: R
                {promptConfig.reward}.
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleDeclineMission}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #555",
                    background: "transparent",
                    color: "#f5f5f5",
                    cursor: "pointer",
                  }}
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={handleStartMission}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2e7d32",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Start mission
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}

      {activeConfig && (
        <Html fullscreen zIndexRange={[15, 5]}>
          <div
            style={{
              position: "fixed",
              top: 24,
              left: 0,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: "rgba(46, 125, 50, 0.85)",
                color: "#fff",
                fontFamily: "Arial, sans-serif",
                fontWeight: 600,
                boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
              }}
            >
              Drop off the passenger at {activeConfig.dropoffHint}.
            </div>
          </div>
        </Html>
      )}

      {dialogVisible && activeDialog && (
        <Html fullscreen zIndexRange={[16, 6]}>
          <div
            style={{
              position: "fixed",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                maxWidth: "480px",
                background: "rgba(30, 30, 30, 0.9)",
                padding: "14px 18px",
                borderRadius: "12px",
                color: "#f0f0f0",
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                lineHeight: 1.5,
                boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
              }}
            >
              {activeDialog}
            </div>
          </div>
        </Html>
      )}

      {completionInfo && completionConfig && (
        <Html fullscreen zIndexRange={[18, 8]}>
          <div
            style={{
              position: "fixed",
              bottom: 140,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                padding: "12px 22px",
                borderRadius: "12px",
                background: "rgba(25, 118, 210, 0.88)",
                color: "#fff",
                fontFamily: "Arial, sans-serif",
                fontWeight: 600,
                boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
              }}
            >
              Mission complete! Earned R{completionInfo.reward}.
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
