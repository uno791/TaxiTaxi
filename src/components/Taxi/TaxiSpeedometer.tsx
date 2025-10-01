import * as React from "react";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import { useGame } from "../../GameContext";

const MAX_SPEED = 40;

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
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
  const { speed } = useGame();
  const displaySpeed = Number.isFinite(speed) ? speed : 0;
  const gaugeValue = Math.min(displaySpeed, MAX_SPEED);

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
      }}
    >
      <GaugeContainer
        width={180}
        height={180}
        startAngle={-110}
        endAngle={110}
        value={gaugeValue}
        valueMin={0}
        valueMax={MAX_SPEED}
        sx={{
          ".MuiGauge-valueText": { display: "none" },
        }}
      >
        <GaugeReferenceArc />
        <GaugePointer />
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
        {Math.round(displaySpeed)} km/h
      </div>
    </div>
  );
}
