import { Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";

const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

// Pure visual component. No movement logic.
export default function StaticStar({
  x,
  y,
  radius,
  delay,
}: {
  x: number;
  y: number;
  radius: number;
  delay: number;
}) {
  const shapeRef = useRef<Konva.Shape>(null);

  // Stable color per instance
  const color = useRef(
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)]
  ).current;

  // Keep the fade-in effect because it looks nice on load
  useEffect(() => {
    const node = shapeRef.current;
    if (!node) return;

    const t = setTimeout(() => {
      new Konva.Tween({
        node,
        duration: 0.45,
        opacity: 1,
        easing: Konva.Easings.Linear,
      }).play();
    }, delay);

    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Shape
      ref={shapeRef}
      x={x}
      y={y}
      opacity={0} // Start invisible for fade-in
      listening={false} // Performance optimization: ignore mouse events
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
