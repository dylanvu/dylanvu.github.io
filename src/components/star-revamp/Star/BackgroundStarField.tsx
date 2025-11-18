import { Group } from "react-konva";
import { useMemo } from "react";
import BackgroundStar from "./BackgroundStar";
import { ConstellationData } from "@/interfaces/StarInterfaces";

export default function StarField({
  width,
  height,
  starCount = 100,
  focusedConstellationPos,
}: {
  width: number;
  height: number;
  starCount?: number;
  focusedConstellationPos: {
    x: number;
    y: number;
    constellation: ConstellationData;
  } | null;
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
      })),
    [width, height, starCount]
  );

  return (
    <Group>
      {stars.map((star, i) => (
        <BackgroundStar
          key={i}
          x={star.x}
          y={star.y}
          radius={star.radius}
          delay={i * 0.05}
          focusedConstellationPos={focusedConstellationPos}
          enableFocusMovement={true}
        />
      ))}
    </Group>
  );
}
