import * as React from "react";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import { useGame } from "../../GameContext";

const MAX_SPEED = 40;

function GaugePointer({ percent }: { percent: number }) {
  const { outerRadius, cx, cy, startAngle, endAngle } = useGaugeState();

  const clamped = Math.min(Math.max(percent, 0), 100);
  const angle = startAngle + ((endAngle - startAngle) * clamped) / 100;

  const target = {
    x: cx + outerRadius * Math.sin(angle),
    y: cy - outerRadius * Math.cos(angle),
  };

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="red" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="red"
        strokeWidth={3}
      />
    </g>
  );
}

export default function TaxiSpeedometer() {
  const { boost, speed, maxBoost, speedMultiplier } = useGame();
  const boostValue = Number.isFinite(boost) ? boost : 0;
  const capacity = Math.max(maxBoost, 1);
  const clampedBoost = Math.min(Math.max(boostValue, 0), capacity);
  const boostPercent = (clampedBoost / capacity) * 100;

  const speedValue = Number.isFinite(speed) ? speed : 0;
  const safeSpeed = Math.max(speedValue, 0);
  const maxSpeedGauge = MAX_SPEED * Math.max(speedMultiplier, 1);
  const clampedSpeed = Math.min(safeSpeed, maxSpeedGauge);
  const speedPercent = (clampedSpeed / maxSpeedGauge) * 100;
  const displaySpeed = Math.round(safeSpeed);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        left: "24px",
        padding: "12px 18px 18px",
        borderRadius: "16px",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        background: "rgba(16, 16, 16, 0.7)",
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.35)",
      }}
    >
      <GaugeContainer
        width={180}
        height={180}
        startAngle={-110}
        endAngle={110}
        value={clampedSpeed}
        valueMin={0}
        valueMax={maxSpeedGauge}
        sx={{
          ".MuiGauge-valueText": { display: "none" },
          ".MuiGauge-valueArc": { stroke: "#ffa000" },
          ".MuiGauge-referenceArc": { stroke: "rgba(255, 255, 255, 0.18)" },
        }}
      >
        <GaugeReferenceArc />
        <GaugePointer percent={speedPercent} />
      </GaugeContainer>
      <div
        style={{
          marginTop: "4px",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: 700,
          letterSpacing: "0.1em",
        }}
      >
        {displaySpeed} km/h
      </div>
      <div
        style={{
          marginTop: "12px",
          width: "100%",
          height: "16px",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.16)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${boostPercent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #1565c0, #42a5f5)",
            transition: "width 0.05s ease-out",
          }}
        />
      </div>
      <div
        style={{
          marginTop: "4px",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: 600,
          color: "#bbdefb",
        }}
      >
        Boost {Math.round(boostPercent)}%
      </div>
    </div>
  );
}
