import { Shape } from "react-konva";
import { useEffect, useRef, useState } from "react";

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
  delay = 0, // seconds
}: {
  x?: number;
  y?: number;
  size?: number;
  brightness?: number;
  delay?: number;
}) {
  const shapeRef = useRef<any>(null);
  const [opacity, setOpacity] = useState(0); // fade-in
  const [currentBrightness, setCurrentBrightness] = useState(brightness);

  const starColor = [
    STAR_COLORS.bright,
    STAR_COLORS.paleBlue,
    STAR_COLORS.paleYellow,
    STAR_COLORS.palePink,
  ][Math.floor(Math.random() * 4)];

  // Fade-in
  useEffect(() => {
    const timeout = setTimeout(() => setOpacity(1), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  // Smooth brightness interpolation
  useEffect(() => {
    let animationFrame: number;
    const duration = 0.1; // seconds
    const start = currentBrightness;
    const change = brightness - start;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      if (elapsed >= duration) {
        setCurrentBrightness(brightness);
        return;
      }
      const newBrightness = start + change * (elapsed / duration);
      setCurrentBrightness(newBrightness);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [brightness]);

  return (
    <Shape
      ref={shapeRef}
      x={x}
      y={y}
      sceneFunc={(ctx, shape) => {
        const radius = size * currentBrightness;

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, starColor);
        gradient.addColorStop(0.5, `rgba(255,255,255,${0.5 * opacity})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
      listening={true}
      onClick={() => console.log("Star clicked!", { x, y })}
    />
  );
}
