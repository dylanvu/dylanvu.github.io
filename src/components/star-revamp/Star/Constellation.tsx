import { Group, Line } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import MainStar from "@/components/star-revamp/Star/MainStar";

export default function Constellation({
  stars,
  connections,
}: {
  stars: { x: number; y: number; size?: number }[];
  connections?: [number, number][]; // optional array of line segments
}) {
  // Helper: calculate distance between two points
  const getDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

  // Helper: calculate total polyline length
  const getLineLength = (points: number[]) => {
    let length = 0;
    for (let i = 0; i < points.length - 2; i += 2) {
      const dx = points[i + 2] - points[i];
      const dy = points[i + 3] - points[i + 1];
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  };

  return (
    <Group>
      {connections && connections.length > 0
        ? connections.map(([i1, i2], idx) => {
            const lineRef = useRef<Konva.Line>(null);
            const p1 = stars[i1];
            const p2 = stars[i2];
            const totalLength = getDistance(p1, p2);

            useEffect(() => {
              if (!lineRef.current) return;
              const line = lineRef.current;

              line.dash([totalLength, totalLength]);
              line.dashOffset(totalLength);
              line.getLayer()?.batchDraw();

              let start: number | null = null;
              const duration = 0.5;

              const animate = (timestamp: number) => {
                if (!start) start = timestamp;
                const elapsed = (timestamp - start) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                line.dashOffset(totalLength * (1 - progress));
                line.getLayer()?.batchDraw();
                if (progress < 1) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
            }, [p1, p2]);

            return (
              <Line
                key={idx}
                ref={lineRef}
                points={[p1.x, p1.y, p2.x, p2.y]}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
              />
            );
          })
        : (() => {
            // Default sequential polyline if no connections
            const lineRef = useRef<Konva.Line>(null);
            const linePoints = stars.flatMap((s) => [s.x, s.y]);
            const totalLength = getLineLength(linePoints);

            useEffect(() => {
              if (!lineRef.current) return;
              const line = lineRef.current;

              line.dash([totalLength, totalLength]);
              line.dashOffset(totalLength);
              line.getLayer()?.batchDraw();

              let start: number | null = null;
              const duration = stars.length * 0.1 + 0.5;

              const animate = (timestamp: number) => {
                if (!start) start = timestamp;
                const elapsed = (timestamp - start) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                line.dashOffset(totalLength * (1 - progress));
                line.getLayer()?.batchDraw();
                if (progress < 1) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
            }, [linePoints, stars.length]);

            return (
              <Line
                ref={lineRef}
                points={linePoints}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
              />
            );
          })()}

      {stars.map((star, i) => (
        <MainStar
          key={i}
          x={star.x}
          y={star.y}
          size={star.size || 5}
          delay={i * 0.1}
        />
      ))}
    </Group>
  );
}
