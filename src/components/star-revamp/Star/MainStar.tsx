import { Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";

const STAR_COLORS = {
  bright: "#FFFFFF",
  paleBlue: "#E0F7FF",
  paleYellow: "#FFFACD",
  palePink: "#FFDDEE",
};

export default function MainStar({
  x = 0,
  y = 0,
  size = 5,
  brightness = 1,
  delay = 0, // delay in seconds for sequential fade-in
}: {
  x?: number;
  y?: number;
  size?: number;
  brightness?: number;
  delay?: number;
}) {
  const shapeRef = useRef<Konva.Shape>(null);
  const radius = size * brightness;

  const starColor = [
    STAR_COLORS.bright,
    STAR_COLORS.paleBlue,
    STAR_COLORS.paleYellow,
    STAR_COLORS.palePink,
  ][Math.floor(Math.random() * 4)];

  useEffect(() => {
    if (shapeRef.current) {
      const tween = new Konva.Tween({
        node: shapeRef.current,
        duration: 0.5, // fade-in duration
        opacity: 1, // target opacity
        delay, // stagger delay
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
      sceneFunc={(ctx, shape) => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, starColor);
        gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillShape(shape);
      }}
      onClick={() => console.log("Star clicked!", { x, y })}
    />
  );
}
