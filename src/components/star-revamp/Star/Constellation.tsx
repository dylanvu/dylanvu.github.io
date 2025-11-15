import { Group, Line } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import MainStar from "@/components/star-revamp/Star/MainStar";

export default function Constellation({
  stars,
}: {
  stars: { x: number; y: number; size?: number }[];
}) {
  const lineRef = useRef<Konva.Line>(null);

  const linePoints = stars.flatMap((s) => [s.x, s.y]);

  const getLineLength = (points: number[]) => {
    let length = 0;
    for (let i = 0; i < points.length - 2; i += 2) {
      const dx = points[i + 2] - points[i];
      const dy = points[i + 3] - points[i + 1];
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  };

  useEffect(() => {
    if (!lineRef.current) return;
    const line = lineRef.current;
    const totalLength = getLineLength(linePoints);

    // Set dash and offset immediately BEFORE the first draw
    line.dash([totalLength, totalLength]);
    line.dashOffset(totalLength);
    line.getLayer()?.batchDraw(); // force initial render

    // Animate dashOffset to 0
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
    <Group>
      <Line
        ref={lineRef}
        points={linePoints}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1}
        lineCap="round"
        lineJoin="round"
      />
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
