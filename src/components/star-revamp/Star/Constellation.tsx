import { Group, Rect } from "react-konva";
import { useState } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";

export default function Constellation({
  stars,
  connections,
  showBoundingBox,
}: {
  stars: { x: number; y: number; size?: number }[];
  connections?: [number, number][];
  showBoundingBox?: boolean;
}) {
  const [brightness, setBrightness] = useState(1);

  // Bounding box
  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const minX = Math.min(...xs) - 10;
  const maxX = Math.max(...xs) + 10;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...ys) + 10;
  const width = maxX - minX;
  const height = maxY - minY;

  const lineDuration = 0.25; // faster line animation
  const delayMultiplier = lineDuration; // sync stars exactly with line
  const brightnessHover = 1.2;

  return (
    <Group
      onClick={() => console.log("Constellation clicked!", stars)}
      onMouseEnter={() => setBrightness(brightnessHover)}
      onMouseLeave={() => setBrightness(1)}
    >
      <Rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        fill={showBoundingBox ? "rgba(255,0,0,0.2)" : ""}
        listening={true}
      />
      {/* Lines */}
      {connections && connections.length > 0
        ? connections.map(([i1, i2], idx) => (
            <AnimatedLine
              key={idx}
              p1={stars[i1]}
              p2={stars[i2]}
              duration={lineDuration}
              delay={idx * delayMultiplier}
            />
          ))
        : stars
            .slice(1)
            .map((star, i) => (
              <AnimatedLine
                key={i}
                p1={stars[i]}
                p2={star}
                duration={lineDuration}
                delay={i * delayMultiplier}
              />
            ))}

      {/* Stars */}
      {stars.map((star, i) => (
        <MainStar
          key={i}
          x={star.x}
          y={star.y}
          size={star.size || 5}
          brightness={brightness}
          delay={i * delayMultiplier} // fade-in synced with line
        />
      ))}
    </Group>
  );
}
