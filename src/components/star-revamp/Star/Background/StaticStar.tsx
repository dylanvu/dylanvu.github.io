import { Shape } from "react-konva";
import { useRef } from "react";

const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

export default function StaticStar({
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
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)]
  ).current;

  return (
    <Shape
      x={x}
      y={y}
      // Opacity is now 1, because the Parent Layer handles the fade
      opacity={1}
      listening={false}
      sceneFunc={(ctx, shape) => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, "rgba(255,255,255,0.2)");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
    />
  );
}
