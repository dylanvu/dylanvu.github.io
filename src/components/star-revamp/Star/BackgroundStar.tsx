import { Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";

const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

export default function BackgroundStar({
  x,
  y,
  radius = 1,
  delay = 0, // delay in seconds
}: {
  x: number;
  y: number;
  radius?: number;
  delay?: number;
}) {
  const shapeRef = useRef<Konva.Shape>(null);

  const color =
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)];

  useEffect(() => {
    if (shapeRef.current) {
      const tween = new Konva.Tween({
        node: shapeRef.current,
        duration: 0.5, // fade-in duration
        opacity: 1, // target opacity
        delay, // staggered delay
        easing: Konva.Easings.Linear,
      });
      tween.play();
    }
  }, [delay]);

  return (
    <Shape
      ref={shapeRef}
      x={x}
      y={y}
      opacity={0} // start invisible
      sceneFunc={(ctx) => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, "rgba(255,255,255,0.2)");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
      listening={false}
    />
  );
}
