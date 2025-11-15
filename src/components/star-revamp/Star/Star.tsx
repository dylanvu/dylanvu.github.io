import { Shape } from "react-konva";

// Define reusable colors for stars
const STAR_COLORS = {
  bright: "#FFFFFF",
  paleBlue: "#E0F7FF",
  paleYellow: "#FFFACD",
  palePink: "#FFDDEE",
};

export default function MainStar({
  x = 0,
  y = 0,
  size = 5, // base radius of the star
  brightness = 1, // 0.5 = dim, 1 = normal, 1.5 = bright
}: {
  x?: number;
  y?: number;
  size?: number;
  brightness?: number;
}) {
  const radius = size * brightness;

  // Random subtle color tint per star
  const starColor = [
    STAR_COLORS.bright,
    STAR_COLORS.paleBlue,
    STAR_COLORS.paleYellow,
    STAR_COLORS.palePink,
  ][Math.floor(Math.random() * 4)];

  return (
    <Shape
      x={x}
      y={y}
      sceneFunc={(ctx, shape) => {
        // Glowing radial gradient
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
        // Simple hit detection: circle radius
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillShape(shape);
      }}
      draggable
      onClick={() => console.log("Star clicked!", { x, y })}
    />
  );
}
