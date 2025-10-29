import { useMissionUI } from "./MissionUIContext";
import { useEffect, useRef } from "react";

export default function MissionOverlay() {
  const {
    prompt,
    active,
    dialog,
    completion,
    timer,
    missionFailureActive,
    setMissionFailureActive,
  } = useMissionUI();
  const vignetteRef = useRef<HTMLDivElement | null>(null);
  const urgencyIntensityRef = useRef(0);
  const urgencyTargetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const missionFailedTimeoutRef = useRef<number | null>(null);

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
    const timeout = setTimeout(() => {
      // fade out automatically
      const overlay = document.querySelector(".mission-complete");
      if (overlay) (overlay as HTMLElement).style.opacity = "0";
    }, 3000);
    return () => clearTimeout(timeout);
  }, [completion]);

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

  const starCount = completion?.stars ?? 0;
  const showStars = starCount > 0;

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

      {/* MISSION COMPLETE (with bonus) */}
      {completion && (
        <div
          className="mission-complete"
          style={{
            position: "absolute",
            bottom: 140,
            left: "50%",
            transform: "translateX(-50%)",
            transition: "opacity 0.5s ease",
            zIndex: 60,
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              padding: "16px 28px",
              borderRadius: "14px",
              background: "rgba(25, 118, 210, 0.9)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontWeight: 600,
              boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
              textAlign: "center",
              minWidth: "280px",
            }}
          >
            {showStars && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "6px",
                  marginBottom: "8px",
                  fontSize: "24px",
                  letterSpacing: "2px",
                }}
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <span
                    key={`star-${index}`}
                    style={{
                      color:
                        index < starCount ? "#ffeb3b" : "rgba(255,255,255,0.3)",
                      textShadow:
                        index < starCount
                          ? "0 0 12px rgba(255,235,59,0.7)"
                          : "none",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>
              Mission complete!
            </div>
            <div style={{ fontSize: "18px" }}>Earned R{completion.reward}</div>
            {completion.breakdown && completion.breakdown.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "14px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {completion.breakdown.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      opacity: item.achieved ? 1 : 0.55,
                      color: item.achieved ? "#fff" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <span>{item.label}</span>
                    <span
                      style={{
                        color: item.achieved ? "#ffeb3b" : "rgba(255,255,255,0.5)",
                        fontWeight: 600,
                      }}
                    >
                      {item.achieved ? `+R${item.bonus}` : "—"}
                    </span>
                  </div>
                ))}
                {completion.bonus && completion.bonus > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "4px",
                      paddingTop: "6px",
                      borderTop: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffeb3b",
                      fontWeight: 700,
                    }}
                  >
                    <span>Total bonus tips</span>
                    <span>+R{completion.bonus}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
