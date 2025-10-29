import { useMissionUI, type MissionCompletionState } from "./MissionUIContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRive } from "@rive-app/react-canvas";
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
  } = useMissionUI();
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
  const [displayedStars, setDisplayedStars] = useState(0);
  const [currentStarEventIndex, setCurrentStarEventIndex] = useState<number | null>(
    null
  );

  const starEvents = completion?.starEvents ?? [];
  const totalStars = completion?.stars ?? 0;

  const { rive, RiveComponent } = useRive({
    src: "/models/6914-13295-star-rating.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });
  const riveStarInputRef = useRef<{ machine: string; input: any } | null>(
    null
  );

  useEffect(() => {
    if (!rive || riveStarInputRef.current) return;
    const machineNames = rive.stateMachineNames ?? [];
    for (const machine of machineNames) {
      const inputs = rive.stateMachineInputs(machine);
      if (!inputs || !inputs.length) continue;
      const numericInput = inputs.find((input: any) =>
        typeof input.value === "number"
      );
      if (numericInput) {
        riveStarInputRef.current = { machine, input: numericInput };
        break;
      }
    }
  }, [rive]);

  useEffect(() => {
    const entry = riveStarInputRef.current;
    if (!entry || !rive) return;
    entry.input.value = displayedStars;
    rive.play(entry.machine);
  }, [displayedStars, rive]);

  // Watch for timer reaching zero → show mission failed popup
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
      starAnimationTimeoutsRef.current.forEach((id) =>
        window.clearTimeout(id)
      );
      starAnimationTimeoutsRef.current = [];
      if (starAudioRef.current) {
        starAudioRef.current.pause();
        starAudioRef.current.currentTime = 0;
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

    const newAudio = new Audio("sounds/mixkit-space-coin-win-notification-271.wav");
    newAudio.volume = 0.7;
    starAudioRef.current = newAudio;

    const baseDelay = 220;
    starEvents.forEach((event, index) => {
      const timeoutId = window.setTimeout(() => {
        setDisplayedStars(event.starNumber);
        setCurrentStarEventIndex(index);
        if (starAudioRef.current) {
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
    };
  }, [completion, starEvents, totalStars]);

  const PANIC_THRESHOLD = 10;
  let nextUrgencyTarget = 0;
  if (missionFailureActive) {
    nextUrgencyTarget = 1;
  } else if (
    timer &&
    timer.secondsLeft > 0 &&
    timer.secondsLeft <= PANIC_THRESHOLD
  ) {
    nextUrgencyTarget =
      1 - Math.max(timer.secondsLeft, 0) / PANIC_THRESHOLD;
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
    () => completion?.breakdown?.find((item) => item.key === "collisions") ?? null,
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

  const riveReady = Boolean(rive && riveStarInputRef.current);

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
              Drive the passenger to {prompt.dropoffHint}. Reward: R
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
              maxWidth: "640px",
              width: "90%",
              background: "rgba(20,20,20,0.95)",
              padding: "26px 34px 28px",
              borderRadius: "14px",
              color: "#f0f0f0",
              fontFamily: "Arial, sans-serif",
              fontSize: "18px",
              lineHeight: 1.6,
              textAlign: "center",
              boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: "12px",
              }}
            >
              {dialog.speakerLabel}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{dialog.text}</div>
            {dialog.options && dialog.options.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                {dialog.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={option.onSelect}
                    style={{
                      padding: "12px 18px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(60, 68, 82, 0.65)",
                      color: "#f5f5f5",
                      cursor: "pointer",
                      fontSize: "17px",
                      transition: "background 0.15s ease, transform 0.15s ease",
                    }}
                    onMouseDown={(event) => {
                      event.currentTarget.style.transform = "scale(0.97)";
                      event.currentTarget.style.background =
                        "rgba(60, 68, 82, 0.8)";
                    }}
                    onMouseUp={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.background =
                        "rgba(60, 68, 82, 0.65)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.background =
                        "rgba(60, 68, 82, 0.65)";
                    }}
                  >
                    {option.label}
                  </button>
                ))}
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Choose an option to continue
                </div>
              </div>
            ) : (
              dialog.onContinue && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "14px",
                    marginTop: "26px",
                  }}
                >
                  <button
                    type="button"
                    onClick={dialog.onContinue}
                    style={{
                      padding: "10px 26px",
                      borderRadius: "999px",
                      border: "none",
                      background: "#f5f5f5",
                      color: "#111",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "16px",
                      boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseDown={(event) => {
                      event.currentTarget.style.transform = "scale(0.97)";
                      event.currentTarget.style.boxShadow =
                        "0 8px 14px rgba(0,0,0,0.4)";
                    }}
                    onMouseUp={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.boxShadow =
                        "0 10px 18px rgba(0,0,0,0.35)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.boxShadow =
                        "0 10px 18px rgba(0,0,0,0.35)";
                    }}
                  >
                    Continue
                  </button>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.75,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Press Space or click Continue
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {completion && (
        <MissionCompletionCard
          completion={completion}
          displayedStars={displayedStars}
          currentStarEvent={currentStarEvent}
          RiveComponent={riveReady ? RiveComponent : null}
          riveReady={riveReady}
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
  RiveComponent: ReturnType<typeof useRive>["RiveComponent"] | null;
  riveReady: boolean;
  collisionBreakdown: MissionPerformanceBreakdown | null;
  timeBreakdown: MissionPerformanceBreakdown | null;
};

function MissionCompletionCard({
  completion,
  displayedStars,
  currentStarEvent,
  RiveComponent,
  riveReady,
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

  const collisionsToNext = collisionBreakdown?.nextStar?.collisionsToReduce ?? null;
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
          <div
            style={{
              width: "200px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {riveReady && RiveComponent ? (
              <RiveComponent style={{ width: "200px", height: "120px" }} />
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  fontSize: "28px",
                  letterSpacing: "3px",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={`fallback-star-${index}`}
                    style={{
                      color:
                        index < displayedStars
                          ? "#ffd54f"
                          : "rgba(255,255,255,0.25)",
                      textShadow:
                        index < displayedStars
                          ? "0 0 16px rgba(255,213,79,0.8)"
                          : "none",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
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
            <strong>{currentStarEvent.label}</strong> — {currentStarEvent.detail}
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
            <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
              Defensive driving
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {formatCollisions(collisionCount)}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
              {collisionStars} / 2 stars · {formatBonus(collisionBonus)} bonus
            </div>
            {collisionsToNext && collisionsToNext > 0 && (
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                {collisionsToNext} fewer {collisionsToNext === 1 ? "collision" : "collisions"} for the next star
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
            <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
              Speed run
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {formatDuration(timeTaken)}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
              {timeStars} / 3 stars · {formatBonus(timeBonus)} bonus
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
  if (seconds === null || Number.isNaN(seconds)) return "—";
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
