import { useMissionUI, type MissionCompletionState } from "./MissionUIContext";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { PassengerModel } from "../Ground/SceneObjects/PassengerModel";
import type {
  MissionPassengerModelId,
  MissionPassengerPreviewConfig,
} from "./missionConfig";
import { useGameLifecycle } from "../../GameContext";

const DEFAULT_PREVIEW_POSITION: [number, number, number] = [0, -0.05, 0];
const DEFAULT_PREVIEW_ROTATION: [number, number, number] = [0, 0, 0];
const DEFAULT_PREVIEW_CAMERA: [number, number, number] = [0, 1.4, 3.2];
const DEFAULT_PREVIEW_SCALE = 0.85;
const DEFAULT_PREVIEW_FOV = 30;

function RotatingPassengerModel({
  modelId,
  preview,
}: {
  modelId: MissionPassengerModelId;
  preview?: MissionPassengerPreviewConfig;
}) {
  const groupRef = useRef<Group | null>(null);
  const baseRotationRef = useRef<[number, number, number]>(
    preview?.rotation ?? DEFAULT_PREVIEW_ROTATION
  );
  const spinRef = useRef(0);

  useEffect(() => {
    baseRotationRef.current = preview?.rotation ?? DEFAULT_PREVIEW_ROTATION;
    spinRef.current = 0;
    if (groupRef.current) {
      const [x, y, z] = baseRotationRef.current;
      groupRef.current.rotation.set(x, y, z);
    }
  }, [preview]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    spinRef.current += delta * 0.6;
    const [baseX, baseY, baseZ] = baseRotationRef.current;
    groupRef.current.rotation.set(baseX, baseY + spinRef.current, baseZ);
  });

  return (
    <group position={preview?.position ?? DEFAULT_PREVIEW_POSITION}>
      <group ref={groupRef}>
        <PassengerModel
          modelId={modelId}
          scale={preview?.scale ?? DEFAULT_PREVIEW_SCALE}
        />
      </group>
    </group>
  );
}

function MissionDialogModelPreview({
  modelId,
  preview,
}: {
  modelId: MissionPassengerModelId;
  preview?: MissionPassengerPreviewConfig;
}) {
  const cameraPosition = preview?.cameraPosition ?? DEFAULT_PREVIEW_CAMERA;
  const cameraFov = preview?.cameraFov ?? DEFAULT_PREVIEW_FOV;
  const canvasKey = `${modelId}-${cameraPosition.join("_")}-${cameraFov}`;

  return (
    <div
      style={{
        width: "260px",
        height: "320px",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(18,18,26,0.95), rgba(5,5,9,0.85))",
        boxShadow: "0 18px 32px rgba(0,0,0,0.45)",
        flexShrink: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        key={canvasKey}
        camera={{ position: cameraPosition, fov: cameraFov }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#07070b"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[2, 3, 2]} intensity={1.1} />
        <directionalLight position={[-2, 3, -1]} intensity={0.5} />
        <Suspense fallback={null}>
          <RotatingPassengerModel modelId={modelId} preview={preview} />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 15%, rgba(255,255,255,0.16), transparent 55%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
import StarRatingFM from "./StarRatingFM";
import type {
  MissionPerformanceBreakdown,
  MissionStarEvent,
} from "./MissionPerformanceContext";

export default function MissionOverlay() {
  const {
    prompt,
    active,
    dialog,
    completion,
    timer,
    missionFailureActive,
    setMissionFailureActive,
    setCompletion,
    setDialogTyping,
    debugMissions,
    debugStartMission,
  } = useMissionUI();
  const { isFreeRoam } = useGameLifecycle();
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);
  const isDev = import.meta.env.DEV;
  const showDebugTools = (isDev || isFreeRoam) && debugMissions.length > 0;
  const panelTitle = isFreeRoam ? "Mission Tools" : "Mission Tester (DEV)";
  const toggleLabel = debugMenuOpen
    ? isFreeRoam
      ? "Hide Mission Tools"
      : "Hide Mission Tester"
    : isFreeRoam
      ? "Open Mission Tools"
      : "Open Mission Tester";
  const vignetteRef = useRef<HTMLDivElement | null>(null);
  const urgencyIntensityRef = useRef(0);
  const urgencyTargetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const missionFailedTimeoutRef = useRef<number | null>(null);

  const starAnimationTimeoutsRef = useRef<number[]>([]);
  const starAudioRef = useRef<HTMLAudioElement | null>(null);
  const fiveStarAudioRef = useRef<HTMLAudioElement | null>(null);
  const [displayedStars, setDisplayedStars] = useState(0);
  const [currentStarEventIndex, setCurrentStarEventIndex] = useState<
    number | null
  >(null);

  const starEvents = completion?.starEvents ?? [];
  const totalStars = completion?.stars ?? 0;

  const [displayedDialogText, setDisplayedDialogText] = useState("");
  const [dialogTypingComplete, setDialogTypingComplete] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const dialogId = dialog?.id ?? null;
  const dialogText = dialog?.text ?? "";
  const dialogSpeaker = dialog?.speaker ?? null;
  const dialogAutoAdvance = dialog?.autoAdvance;
  const dialogOnContinue = dialog?.onContinue;
  const dialogHasOptions = Boolean(dialog?.options && dialog.options.length > 0);

  useEffect(() => {
    if (isFreeRoam) {
      setDebugMenuOpen(true);
    }
  }, [isFreeRoam]);

  // Watch for timer reaching zero -> show mission failed popup
  useEffect(() => {
    if (timer && timer.secondsLeft === 0) {
      setMissionFailureActive(true);
      if (missionFailedTimeoutRef.current) {
        window.clearTimeout(missionFailedTimeoutRef.current);
      }
      missionFailedTimeoutRef.current = window.setTimeout(() => {
        setMissionFailureActive(false);
        missionFailedTimeoutRef.current = null;
      }, 3000);
    }
  }, [timer, setMissionFailureActive]);

  useEffect(() => {
    return () => {
      if (missionFailedTimeoutRef.current) {
        window.clearTimeout(missionFailedTimeoutRef.current);
        missionFailedTimeoutRef.current = null;
      }
    };
  }, []);

  // Auto fade out mission complete popup
  useEffect(() => {
    if (!completion) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      starAnimationTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      starAnimationTimeoutsRef.current = [];
      if (starAudioRef.current) {
        starAudioRef.current.pause();
        starAudioRef.current.currentTime = 0;
      }
      if (fiveStarAudioRef.current) {
        fiveStarAudioRef.current.pause();
        fiveStarAudioRef.current.currentTime = 0;
      }
      setDisplayedStars(totalStars);
      setCurrentStarEventIndex(null);
      setCompletion(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completion, totalStars, setCompletion]);

  useEffect(() => {
    starAnimationTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    starAnimationTimeoutsRef.current = [];

    const audio = starAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    starAudioRef.current = null;

    if (fiveStarAudioRef.current) {
      fiveStarAudioRef.current.pause();
      fiveStarAudioRef.current.currentTime = 0;
    }
    fiveStarAudioRef.current = null;

    if (!completion) {
      setDisplayedStars(0);
      setCurrentStarEventIndex(null);
      return;
    }

    if (!starEvents.length) {
      setDisplayedStars(totalStars);
      setCurrentStarEventIndex(null);
      return;
    }

    setDisplayedStars(0);
    setCurrentStarEventIndex(null);

    const newAudio = new Audio(
      "sounds/mixkit-space-coin-win-notification-271.wav"
    );
    newAudio.volume = 0.7;
    starAudioRef.current = newAudio;

    if (totalStars >= 5) {
      const celebration = new Audio("sounds/5star.wav");
      celebration.volume = 0.9;
      fiveStarAudioRef.current = celebration;
    }

    const baseDelay = 220;
    starEvents.forEach((event, index) => {
      const timeoutId = window.setTimeout(() => {
        setDisplayedStars(event.starNumber);
        setCurrentStarEventIndex(index);
        if (event.starNumber === 5 && fiveStarAudioRef.current) {
          fiveStarAudioRef.current.currentTime = 0;
          void fiveStarAudioRef.current.play().catch(() => undefined);
        } else if (starAudioRef.current) {
          starAudioRef.current.currentTime = 0;
          void starAudioRef.current.play().catch(() => undefined);
        }
      }, baseDelay + index * 620);
      starAnimationTimeoutsRef.current.push(timeoutId);
    });

    const settleTimeout = window.setTimeout(() => {
      setDisplayedStars(totalStars);
      setCurrentStarEventIndex(starEvents.length - 1);
    }, baseDelay + starEvents.length * 620 + 320);
    starAnimationTimeoutsRef.current.push(settleTimeout);

    return () => {
      starAnimationTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      starAnimationTimeoutsRef.current = [];
      const activeAudio = starAudioRef.current;
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      starAudioRef.current = null;
      if (fiveStarAudioRef.current) {
        fiveStarAudioRef.current.pause();
        fiveStarAudioRef.current.currentTime = 0;
      }
      fiveStarAudioRef.current = null;
    };
  }, [completion, starEvents, totalStars]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    if (!dialog) {
      setDisplayedDialogText("");
      setDialogTypingComplete(false);
      setDialogTyping(false);
      return;
    }

    if (dialogHasOptions) {
      setDisplayedDialogText(dialogText);
      setDialogTypingComplete(true);
      setDialogTyping(false);
      return;
    }

    setDisplayedDialogText("");
    const shouldType = dialogText.length > 0;
    setDialogTypingComplete(!shouldType);
    setDialogTyping(shouldType);
  }, [dialog, dialogHasOptions, dialogId, dialogText, setDialogTyping]);

  useEffect(() => {
    if (dialogId === null || dialogTypingComplete) {
      return;
    }

    if (displayedDialogText.length >= dialogText.length) {
      setDisplayedDialogText(dialogText);
      setDialogTypingComplete(true);
      setDialogTyping(false);
      return;
    }

    const nextChar = dialogText.charAt(displayedDialogText.length);
    const baseDelay = dialogSpeaker === "driver" ? 24 : 30;
    let delay = baseDelay + Math.random() * 12;

    if (".?!".includes(nextChar)) {
      delay = baseDelay * 6;
    } else if (",;:".includes(nextChar)) {
      delay = baseDelay * 3;
    } else if (nextChar === "\n") {
      delay = baseDelay * 4;
    } else if (nextChar === " ") {
      const previousChar = dialogText.charAt(displayedDialogText.length - 1);
      if (previousChar === "-" || previousChar === "\u2014") {
          delay = baseDelay * 2.5;
      }
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayedDialogText((prev) => dialogText.slice(0, prev.length + 1));
    }, Math.max(delay, 22));

    typingTimeoutRef.current = timeoutId;

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    dialogId,
    dialogText,
    dialogSpeaker,
    displayedDialogText,
    dialogTypingComplete,
    setDialogTyping,
  ]);

  useEffect(() => {
    if (
      dialogId === null ||
      !dialogTypingComplete ||
      !dialogAutoAdvance ||
      !dialogOnContinue
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      dialogOnContinue();
    }, dialogAutoAdvance.delayMs ?? 650);

    autoAdvanceTimeoutRef.current = timeout;

    return () => {
      window.clearTimeout(timeout);
    };
  }, [dialogId, dialogTypingComplete, dialogAutoAdvance, dialogOnContinue]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (autoAdvanceTimeoutRef.current) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSkipTyping = useCallback(() => {
    if (dialogId === null || dialogTypingComplete) {
      return;
    }
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setDisplayedDialogText(dialogText);
    setDialogTypingComplete(true);
    setDialogTyping(false);
  }, [dialogId, dialogText, dialogTypingComplete, setDialogTyping]);

  const isPassengerDialog = dialog?.speaker === "passenger";
  const shouldCenterBubble = Boolean(
    dialog && (!isPassengerDialog || dialog.passengerModel === "none")
  );
  const pointerPosition = shouldCenterBubble
    ? { left: "50%", transform: "translateX(-50%)" }
    : { left: "12%", transform: "translateX(-50%)" };
  const pointerOuterBottom = "-32px";
  const pointerInnerBottom = "-28px";

  useEffect(() => {
    if (dialogId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;

      if (!dialogTypingComplete) {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleSkipTyping();
        return;
      }

      if (!dialogHasOptions && dialogOnContinue && !dialogAutoAdvance) {
        event.preventDefault();
        event.stopImmediatePropagation();
        dialogOnContinue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dialogId,
    dialogTypingComplete,
    dialogHasOptions,
    dialogOnContinue,
    dialogAutoAdvance,
    handleSkipTyping,
  ]);

  const PANIC_THRESHOLD = 10;
  let nextUrgencyTarget = 0;
  if (missionFailureActive) {
    nextUrgencyTarget = 1;
  } else if (
    timer &&
    timer.secondsLeft > 0 &&
    timer.secondsLeft <= PANIC_THRESHOLD
  ) {
    nextUrgencyTarget = 1 - Math.max(timer.secondsLeft, 0) / PANIC_THRESHOLD;
  }
  urgencyTargetRef.current = nextUrgencyTarget;

  useEffect(() => {
    const update = () => {
      const target = urgencyTargetRef.current;
      const current = urgencyIntensityRef.current;
      const next = current + (target - current) * 0.2;
      urgencyIntensityRef.current = next;

      const vignette = vignetteRef.current;
      if (vignette) {
        if (next <= 0.001) {
          vignette.style.opacity = "0";
        } else {
          const opacity = 0.2 + next * 0.6;
          vignette.style.opacity = opacity.toFixed(3);
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const heartbeatActive = urgencyTargetRef.current > 0;

  const collisionBreakdown = useMemo(
    () =>
      completion?.breakdown?.find((item) => item.key === "collisions") ?? null,
    [completion]
  );

  const timeBreakdown = useMemo(
    () => completion?.breakdown?.find((item) => item.key === "time") ?? null,
    [completion]
  );

  const currentStarEvent =
    currentStarEventIndex !== null && currentStarEventIndex >= 0
      ? starEvents[currentStarEventIndex] ?? null
      : null;

  useEffect(() => {
    if (heartbeatTimerRef.current) {
      window.clearTimeout(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (!heartbeatActive) {
      return undefined;
    }
    let cancelled = false;

    const ensureContext = () => {
      if (typeof window === "undefined") return null;
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      if (!audioContextRef.current) {
        audioContextRef.current = new Ctx();
      }
      return audioContextRef.current;
    };

    const buildBuffer = (ctx: AudioContext) => {
      if (audioBufferRef.current) return audioBufferRef.current;
      const duration = 0.55;
      const sampleRate = ctx.sampleRate;
      const frameCount = Math.floor(duration * sampleRate);
      const buffer = ctx.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);
      const beat = (time: number, start: number) => {
        const local = time - start;
        if (local < 0 || local > 0.18) return 0;
        const attack = 0.025;
        const decay = 0.14;
        if (local < attack) {
          return local / attack;
        }
        return Math.max(0, 1 - (local - attack) / decay);
      };
      for (let index = 0; index < frameCount; index += 1) {
        const t = index / sampleRate;
        const envelope = beat(t, 0) * 0.85 + beat(t, 0.28) * 0.6;
        const wave = Math.sin(2 * Math.PI * 56 * t);
        data[index] = envelope * wave;
      }
      audioBufferRef.current = buffer;
      return buffer;
    };

    const playHeartbeat = async () => {
      const ctx = ensureContext();
      if (!ctx) return;
      try {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
      } catch {
        // ignore resume errors (autoplay policies)
      }

      const buffer = buildBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 1 + urgencyTargetRef.current * 0.4;

      const gain = ctx.createGain();
      gain.gain.value = 0.4 + urgencyTargetRef.current * 0.3;

      source.connect(gain).connect(ctx.destination);
      source.start();
    };

    const schedule = () => {
      if (cancelled) return;
      void playHeartbeat();
      const interval = 620 - urgencyTargetRef.current * 280;
      heartbeatTimerRef.current = window.setTimeout(schedule, interval);
    };

    schedule();

    return () => {
      cancelled = true;
      if (heartbeatTimerRef.current) {
        window.clearTimeout(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [heartbeatActive]);

  const shouldRender =
    prompt || active || dialog || completion || missionFailureActive;
  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {showDebugTools && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            pointerEvents: "auto",
            zIndex: 90,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => setDebugMenuOpen((prev) => !prev)}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.35)",
              background: debugMenuOpen
                ? isFreeRoam
                  ? "rgba(2, 136, 209, 0.9)"
                  : "rgba(25,118,210,0.85)"
                : isFreeRoam
                  ? "rgba(13, 71, 161, 0.7)"
                  : "rgba(33,33,33,0.85)",
              color: isFreeRoam ? "#eaf7ff" : "#f5f5f5",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
            }}
          >
            {toggleLabel}
          </button>
          {debugMenuOpen && (
            <div
              style={{
                width: "300px",
                maxHeight: "360px",
                overflowY: "auto",
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(12,12,18,0.94)",
                color: "#f5f5f5",
                boxShadow: "0 18px 34px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  textAlign: "center",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {panelTitle}
              </div>
              {debugMissions.map((mission) => (
                <div
                  key={mission.id}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(34,34,48,0.85)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    {mission.label}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                      textAlign: "left",
                    }}
                  >
                    ID: {mission.id}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.8,
                      textAlign: "left",
                    }}
                  >
                    Reward: R{mission.reward}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.75,
                      textAlign: "left",
                    }}
                  >
                    Dropoff: {mission.dropoffHint}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (debugStartMission) {
                        debugStartMission(mission.id);
                        setDebugMenuOpen(false);
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "rgba(76, 175, 80, 0.85)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Start Dialog
                  </button>
                </div>
              ))}
              <div
                style={{
                  fontSize: "11px",
                  lineHeight: 1.4,
                  opacity: 0.65,
                  textAlign: "center",
                }}
              >
                Jump into any mission instantly. Available in Free Roam and
                development builds.
              </div>
            </div>
          )}
        </div>
      )}
      <div
        ref={vignetteRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at center, rgba(110, 0, 0, 0) 40%, rgba(90, 0, 0, 0.35) 70%, rgba(10, 0, 0, 0.85) 100%)",
          opacity: 0,
          transition: "opacity 0.18s ease-out",
        }}
      />

      {/* PROMPT OVERLAY */}
      {prompt && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Start Mission?
            </div>
            <div style={{ lineHeight: 1.5, marginBottom: "18px" }}>
              Drop the passenger off at their destination. Reward: R
              {prompt.reward}.
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={prompt.onDecline}
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
                onClick={prompt.onStart}
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
      )}

      {/* ACTIVE INSTRUCTION */}
      {active && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(46, 125, 50, 0.85)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontWeight: 600,
              boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
            }}
          >
            Drop off the passenger at {active.dropoffHint}.
          </div>
        </div>
      )}

      {/* TIMER DISPLAY */}
      {active && timer && timer.secondsLeft > 0 && (
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 24,
            background:
              timer.secondsLeft <= 5
                ? "rgba(183, 28, 28, 0.85)"
                : "rgba(0, 0, 0, 0.65)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "10px",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            transition: "background 0.3s ease",
          }}
        >
          Time left: {timer.secondsLeft}s
        </div>
      )}

      {/* BLOCKING DIALOG MODE */}
      {dialog && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "80px",
            pointerEvents: "auto",
            zIndex: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: shouldCenterBubble ? "column" : "row",
              alignItems: shouldCenterBubble ? "center" : "flex-end",
              justifyContent: "center",
              width: "min(94%, 980px)",
              gap: shouldCenterBubble ? "32px" : "28px",
              rowGap: "24px",
              flexWrap: shouldCenterBubble ? "nowrap" : "wrap",
            }}
          >
            {dialog.passengerModel &&
              dialog.passengerModel !== "none" &&
              dialog.speaker !== "driver" && (
              <MissionDialogModelPreview
                modelId={dialog.passengerModel}
                preview={dialog.passengerPreview}
              />
            )}
            <div
              style={{
                flex: shouldCenterBubble ? "0 1 560px" : "1 1 340px",
                display: "flex",
                justifyContent: shouldCenterBubble ? "center" : "flex-start",
                width: "100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  background:
                    "linear-gradient(180deg, #fffdf4 0%, #ffeec9 100%)",
                  border: "4px solid #111",
                  borderRadius: "32px",
                  padding: "28px 34px 34px",
                  width: "100%",
                  maxWidth: "560px",
                  color: "#111",
                  fontFamily:
                    "'Comic Neue', 'Comic Sans MS', 'Chalkboard SE', sans-serif",
                  textAlign: shouldCenterBubble ? "center" : "left",
                  lineHeight: 1.55,
                  boxShadow: "10px 14px 0 rgba(0,0,0,0.25)",
                  overflow: "visible",
                  cursor: dialogTypingComplete ? "default" : "pointer",
                  transition: "transform 0.2s ease",
                }}
                onClick={handleSkipTyping}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "12px",
                    borderRadius: "24px",
                    border: "2px dashed rgba(17,17,17,0.14)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    fontSize: "15px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(17,17,17,0.62)",
                    marginBottom: "18px",
                    fontWeight: 700,
                  }}
                >
                  {dialog.speakerLabel}
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    whiteSpace: "pre-wrap",
                    textShadow: "1px 1px 0 rgba(255,255,255,0.45)",
                    minHeight: "90px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {displayedDialogText}
                  {!dialogTypingComplete && (
                    <span style={{ opacity: 0.6, marginLeft: "2px" }}>|</span>
                  )}
                </div>
                {dialog.options && dialog.options.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      marginTop: "28px",
                      alignItems: "center",
                    }}
                  >
                    {dialog.options.map((option) => {
                      const disabled = !dialogTypingComplete;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={option.onSelect}
                          disabled={disabled}
                          style={{
                            padding: "14px 28px",
                            borderRadius: "999px",
                            border: "3px solid #34040a",
                            background: disabled
                              ? "rgba(144, 10, 22, 0.55)"
                              : "#b3121d",
                            color: "#f8f5f5",
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontWeight: 700,
                            fontSize: "17px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            boxShadow: disabled
                              ? "none"
                              : "8px 8px 0 rgba(0,0,0,0.35)",
                            transition:
                              "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
                          }}
                          onMouseDown={(event) => {
                            if (disabled) return;
                            event.currentTarget.style.transform =
                              "translateY(2px)";
                            event.currentTarget.style.boxShadow =
                              "4px 4px 0 rgba(0,0,0,0.35)";
                          }}
                          onMouseUp={(event) => {
                            if (disabled) return;
                            event.currentTarget.style.transform =
                              "translateY(0)";
                            event.currentTarget.style.boxShadow =
                              "8px 8px 0 rgba(0,0,0,0.35)";
                          }}
                          onMouseLeave={(event) => {
                            if (disabled) return;
                            event.currentTarget.style.transform =
                              "translateY(0)";
                            event.currentTarget.style.boxShadow =
                              "8px 8px 0 rgba(0,0,0,0.35)";
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "13px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(17,17,17,0.55)",
                      }}
                    >
                      {dialogTypingComplete
                        ? "Pick the driver's reply"
                        : "Let the driver finish first"}
                    </div>
                  </div>
                ) : !dialog.autoAdvance && dialog.onContinue ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "16px",
                      marginTop: "28px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={dialog.onContinue}
                      disabled={!dialogTypingComplete}
                      style={{
                        padding: "12px 34px",
                        borderRadius: "999px",
                        border: "3px solid #34040a",
                        background: dialogTypingComplete
                          ? "#c21807"
                          : "rgba(194, 24, 7, 0.5)",
                        color: "#f8f5f5",
                        fontWeight: 700,
                        fontSize: "18px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: dialogTypingComplete ? "pointer" : "not-allowed",
                        boxShadow: dialogTypingComplete
                          ? "8px 8px 0 rgba(0,0,0,0.35)"
                          : "none",
                        transition:
                          "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
                      }}
                      onMouseDown={(event) => {
                        if (!dialogTypingComplete) return;
                        event.currentTarget.style.transform = "translateY(2px)";
                        event.currentTarget.style.boxShadow =
                          "4px 4px 0 rgba(0,0,0,0.35)";
                      }}
                      onMouseUp={(event) => {
                        if (!dialogTypingComplete) return;
                        event.currentTarget.style.transform = "translateY(0)";
                        event.currentTarget.style.boxShadow =
                          "8px 8px 0 rgba(0,0,0,0.35)";
                      }}
                      onMouseLeave={(event) => {
                        if (!dialogTypingComplete) return;
                        event.currentTarget.style.transform = "translateY(0)";
                        event.currentTarget.style.boxShadow =
                          "8px 8px 0 rgba(0,0,0,0.35)";
                      }}
                    >
                      {dialogTypingComplete ? "Continue" : "..."}
                    </button>
                    <div
                      style={{
                        fontSize: "13px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(17,17,17,0.55)",
                      }}
                    >
                      {dialogTypingComplete
                        ? "Press Space or click Continue"
                        : "Wait for the line to finish"}
                    </div>
                  </div>
                ) : null}
                {!dialogTypingComplete && !dialogHasOptions && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: shouldCenterBubble ? "18px" : "16px",
                      right: shouldCenterBubble ? "24px" : "22px",
                      fontSize: "12px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(17,17,17,0.45)",
                    }}
                  >
                    Tap to reveal
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: pointerOuterBottom,
                    left: pointerPosition.left,
                    transform: pointerPosition.transform,
                    width: 0,
                    height: 0,
                    borderLeft: "26px solid transparent",
                    borderRight: "26px solid transparent",
                    borderTop: "32px solid #111",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: pointerInnerBottom,
                    left: pointerPosition.left,
                    transform: pointerPosition.transform,
                    width: 0,
                    height: 0,
                    borderLeft: "22px solid transparent",
                    borderRight: "22px solid transparent",
                    borderTop: "28px solid #ffeec9",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {completion && (
        <MissionCompletionCard
          completion={completion}
          displayedStars={displayedStars}
          currentStarEvent={currentStarEvent}
          collisionBreakdown={collisionBreakdown}
          timeBreakdown={timeBreakdown}
        />
      )}

      {/* MISSION FAILED POPUP */}
      {missionFailureActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              background: "rgba(183, 28, 28, 0.95)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              padding: "24px 40px",
              borderRadius: "14px",
              boxShadow: "0 18px 36px rgba(0,0,0,0.5)",
            }}
          >
            Mission Failed! Time ran out.
          </div>
        </div>
      )}
    </div>
  );
}

type MissionCompletionCardProps = {
  completion: MissionCompletionState;
  displayedStars: number;
  currentStarEvent: MissionStarEvent | null;
  collisionBreakdown: MissionPerformanceBreakdown | null;
  timeBreakdown: MissionPerformanceBreakdown | null;
};

function MissionCompletionCard({
  completion,
  displayedStars,
  currentStarEvent,
  collisionBreakdown,
  timeBreakdown,
}: MissionCompletionCardProps) {
  const bonus = completion.bonus ?? 0;
  const baseReward = completion.reward - bonus;

  const collisionCount =
    typeof completion.collisions === "number"
      ? completion.collisions
      : typeof collisionBreakdown?.value === "number"
      ? collisionBreakdown.value
      : 0;

  const timeTaken =
    typeof completion.timeTakenSeconds === "number"
      ? completion.timeTakenSeconds
      : typeof timeBreakdown?.value === "number"
      ? timeBreakdown.value
      : null;

  const collisionsToNext =
    collisionBreakdown?.nextStar?.collisionsToReduce ?? null;
  const secondsToNext = timeBreakdown?.nextStar?.secondsToSave ?? null;

  const collisionBonus = collisionBreakdown?.bonus ?? 0;
  const timeBonus = timeBreakdown?.bonus ?? 0;
  const collisionStars = collisionBreakdown?.starsEarned ?? 0;
  const timeStars = timeBreakdown?.starsEarned ?? 0;

  return (
    <div
      className="mission-complete"
      style={{
        position: "absolute",
        bottom: 110,
        left: "50%",
        transform: "translateX(-50%)",
        transition: "opacity 0.5s ease",
        zIndex: 60,
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          padding: "22px 30px 26px",
          borderRadius: "16px",
          background: "rgba(15, 26, 46, 0.92)",
          color: "#f5f7ff",
          fontFamily: "Arial, sans-serif",
          width: "min(520px, 92vw)",
          boxShadow: "0 18px 38px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div style={{ fontSize: "22px", fontWeight: 700 }}>
            Mission complete!
          </div>
          <div
            style={{
              fontSize: "16px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.12)",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 600,
            }}
          >
            {displayedStars} / 5 stars
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
            gap: "16px",
          }}
        >
          <StarRatingFM value={displayedStars} size={46} interactive={false} />
        </div>

        {currentStarEvent && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
              fontSize: "15px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <strong>{currentStarEvent.label}</strong> - {" "}
            {currentStarEvent.detail}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Defensive driving
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {formatCollisions(collisionCount)}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
              {collisionStars} / 2 stars - {formatBonus(collisionBonus)} bonus
            </div>
            {collisionsToNext && collisionsToNext > 0 && (
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                {collisionsToNext} fewer{" "}
                {collisionsToNext === 1 ? "collision" : "collisions"} for the
                next star
              </div>
            )}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Speed run
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {formatDuration(timeTaken)}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
              {timeStars} / 3 stars - {formatBonus(timeBonus)} bonus
            </div>
            {secondsToNext && secondsToNext > 0 && (
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                {formatSecondsDiff(secondsToNext)} faster for the next star
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span>Fare</span>
            <span>{formatCurrency(baseReward)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span>Safety bonus</span>
            <span>{formatBonus(collisionBonus)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span>Speed bonus</span>
            <span>{formatBonus(timeBonus)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "4px",
              paddingTop: "6px",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 700,
            }}
          >
            <span>Total payout</span>
            <span>{formatCurrency(completion.reward)}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Press Space to continue
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  const rounded = Math.round(value);
  return `R${rounded}`;
}

function formatBonus(value: number) {
  const rounded = Math.round(value);
  const sign = rounded >= 0 ? "+" : "-";
  return `${sign}R${Math.abs(rounded)}`;
}

function formatDuration(seconds: number | null) {
  if (seconds === null || Number.isNaN(seconds)) return "--";
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds - minutes * 60;
    return `${minutes}:${remainder.toFixed(1).padStart(4, "0")}`;
  }
  return `${seconds.toFixed(1)}s`;
}

function formatSecondsDiff(seconds: number) {
  return `${seconds.toFixed(1)}s`;
}

function formatCollisions(count: number) {
  return `${count} collision${count === 1 ? "" : "s"}`;
}
