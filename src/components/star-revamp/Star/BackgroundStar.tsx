import { Shape } from "react-konva";

// Subtle background star colors
const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

export default function BackgroundStar({
  x,
  y,
  radius = 1,
}: {
  x: number;
  y: number;
  radius?: number;
}) {
  // Pick a subtle color at random
  const color =
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)];

  return (
    <Shape
      x={x}
      y={y}
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
      // Background stars should NOT interactive
      listening={false}
    />
  );
}
