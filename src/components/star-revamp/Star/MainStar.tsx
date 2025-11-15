import { Shape } from "react-konva";
import { useEffect, useState } from "react";

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
  const [opacity, setOpacity] = useState(0); // controlled opacity
  const radius = size * brightness;

  const starColor = [
    STAR_COLORS.bright,
    STAR_COLORS.paleBlue,
    STAR_COLORS.paleYellow,
    STAR_COLORS.palePink,
  ][Math.floor(Math.random() * 4)];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOpacity(1); // fade-in after delay
    }, delay * 1000); // convert seconds to ms

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <Shape
      x={x}
      y={y}
      sceneFunc={(ctx, shape) => {
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
