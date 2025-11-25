import { Shape } from "react-konva";
import { useRef } from "react";
import React from "react";
import { BACKGROUND_STAR_COLORS, getRandomColor, OPACITY } from "@/app/theme";

const BG_STAR_COLORS = BACKGROUND_STAR_COLORS;

function StaticStar({
  x,
  y,
  radius,
}: {
  x: number;
  y: number;
  radius: number;
}) {
  // Stable color per instance
  const color = useRef(
    getRandomColor(BG_STAR_COLORS)
  ).current;

  return (
    <Shape
      x={x}
      y={y}
      // Opacity is now 1, because the Parent Layer handles the fade
      opacity={1}
      listening={false}
      sceneFunc={(ctx) => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, `rgba(255,255,255,${OPACITY.bold})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
    />
  );
}

// Memoize to prevent unnecessary re-renders of 390 background stars
export default React.memo(StaticStar);
