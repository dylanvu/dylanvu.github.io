import { Group } from "react-konva";
import BackgroundStar from "./BackgroundStar";

export default function StarField({
  width,
  height,
  starCount = 100,
}: {
  width: number;
  height: number;
  starCount?: number;
}) {
  const stars = Array.from({ length: starCount }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.5, // subtle variation in size
  }));

  return (
    <Group>
      {stars.map((star, i) => (
        <BackgroundStar
          key={i}
          x={star.x}
          y={star.y}
          radius={star.radius}
          delay={i * 0.05} // sequential fade-in
        />
      ))}
    </Group>
  );
}
