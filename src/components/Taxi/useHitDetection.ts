import { useCallback, useMemo, useRef } from "react";
import type { CollideEvent } from "@react-three/cannon";

type HitListener = (event: CollideEvent) => void;

type HitDetectionOptions = {
  /** Ignore collisions below this impact velocity (m/s). */
  minImpactVelocity?: number;
  /** Milliseconds to debounce consecutive hits. */
  cooldownMs?: number;
};

export function useHitDetection(options: HitDetectionOptions = {}) {
  const { minImpactVelocity = 2.5, cooldownMs = 300 } = options;
  const listenersRef = useRef<HitListener[]>([]);
  const lastTriggerRef = useRef(0);

  const subscribe = useCallback((listener: HitListener) => {
    listenersRef.current.push(listener);
    return () => {
      listenersRef.current = listenersRef.current.filter(
        (existing) => existing !== listener
      );
    };
  }, []);

  const handleCollision = useCallback(
    (event: CollideEvent) => {
      const impact = event.contact?.impactVelocity ?? 0;
      if (impact < minImpactVelocity) return;

      const now = performance.now();
      if (now - lastTriggerRef.current < cooldownMs) return;
      lastTriggerRef.current = now;

      for (const listener of listenersRef.current) {
        listener(event);
      }
    },
    [minImpactVelocity, cooldownMs]
  );

  return useMemo(
    () => ({
      onCollide: handleCollision,
      onHit: subscribe,
    }),
    [handleCollision, subscribe]
  );
}
