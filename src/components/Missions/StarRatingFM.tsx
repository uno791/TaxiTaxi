import { motion, AnimatePresence } from "framer-motion";

type StarRatingProps = {
  value: number; // 0..5
  onChange?: (next: number) => void;
  size?: number;
  interactive?: boolean;
};

const DEFAULT_STARS = [1, 2, 3, 4, 5] as const;

export default function StarRatingFM({
  value,
  onChange,
  size = 32,
  interactive = true,
}: StarRatingProps) {
  const outlineColor = "rgba(255,255,255,0.45)";
  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      {DEFAULT_STARS.map((star) => {
        const active = star <= value;
        const handleClick =
          interactive && onChange ? () => onChange(star) : undefined;

        return (
          <button
            key={star}
            type="button"
            onClick={handleClick}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            style={{
              appearance: "none",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: interactive ? "pointer" : "default",
              lineHeight: 0,
              position: "relative",
              width: size,
              height: size,
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              style={{ position: "absolute", inset: 0 }}
            >
              <path
                d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.6L12 17.7 5.8 20.1 7.4 13.5 2.2 8.9l6.9-.6L12 2z"
                fill="rgba(0,0,0,0)"
                stroke={outlineColor}
                strokeWidth="1.35"
              />
            </svg>

            <motion.svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              style={{ position: "absolute", inset: 0 }}
            >
              <motion.g
                initial={false}
                animate={{ rotate: active ? [0, -10, 8, -6, 3, 0] : 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{ transformOrigin: "50% 55%" }}
              >
                <motion.path
                  d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.6L12 17.7 5.8 20.1 7.4 13.5 2.2 8.9l6.9-.6L12 2z"
                  initial={false}
                  animate={{
                    fill: active ? "#FFD54F" : "rgba(0,0,0,0)",
                    scale: active ? 1.08 : 1.0,
                  }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  style={{ transformOrigin: "50% 55%" }}
                />
              </motion.g>
            </motion.svg>

            <AnimatePresence>
              {active && (
                <motion.div
                  key="burst"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0.4, 0], scale: [0.4, 1, 1.1, 0.7] }}
                  exit={{ opacity: 0, scale: 0.55 }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    filter: "drop-shadow(0 0 8px rgba(255,213,79,0.85))",
                  }}
                >
                  <svg width={size} height={size} viewBox="0 0 24 24">
                    <g
                      stroke="#FFD54F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <motion.line
                        x1="12"
                        y1="1.5"
                        x2="12"
                        y2="4.2"
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.05, duration: 0.25 }}
                      />
                      <motion.line
                        x1="12"
                        y1="19.8"
                        x2="12"
                        y2="22.5"
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.08, duration: 0.25 }}
                      />
                      <motion.line
                        x1="1.5"
                        y1="12"
                        x2="4.2"
                        y2="12"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.1, duration: 0.25 }}
                      />
                      <motion.line
                        x1="19.8"
                        y1="12"
                        x2="22.5"
                        y2="12"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.12, duration: 0.25 }}
                      />
                      <motion.line
                        x1="4.2"
                        y1="4.2"
                        x2="6.2"
                        y2="6.2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.14, duration: 0.25 }}
                      />
                      <motion.line
                        x1="17.8"
                        y1="17.8"
                        x2="19.8"
                        y2="19.8"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.16, duration: 0.25 }}
                      />
                      <motion.line
                        x1="4.2"
                        y1="19.8"
                        x2="6.2"
                        y2="17.8"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.18, duration: 0.25 }}
                      />
                      <motion.line
                        x1="17.8"
                        y1="6.2"
                        x2="19.8"
                        y2="4.2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 1, 0.6] }}
                        transition={{ delay: 0.2, duration: 0.25 }}
                      />
                    </g>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
