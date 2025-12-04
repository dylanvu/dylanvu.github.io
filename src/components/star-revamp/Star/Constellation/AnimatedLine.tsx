import { Line } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { OPACITY } from "@/app/theme";

export default function AnimatedLine({
  p1,
  p2,
  duration = 0.5,
  delay = 0,
}: {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  duration?: number;
  delay?: number;
}) {
  const lineRef = useRef<Konva.Line>(null);
  const totalLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const layer = line.getLayer();
    if (!layer) return;

    // Set initial dash state
    line.dash([totalLength, totalLength]);
    line.dashOffset(totalLength);

    let animation: Konva.Animation | null = null;
    let startTime: number | null = null;
    let hasStarted = false;

    // Create Konva.Animation for dash animation
    animation = new Konva.Animation((frame) => {
      if (!frame) return;

      // Handle delay before starting
      if (!hasStarted) {
        if (startTime === null) {
          startTime = frame.time;
        }
        const elapsed = (frame.time - startTime) / 1000;
        if (elapsed < delay) {
          return; // Wait for delay to complete
        }
        hasStarted = true;
        startTime = frame.time; // Reset start time for actual animation
      }

      const elapsed = (frame.time - startTime!) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      line.dashOffset(totalLength * (1 - progress));

      if (progress >= 1) {
        animation?.stop();
      }
    }, layer);

    animation.start();

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [p1.x, p1.y, p2.x, p2.y, totalLength, duration, delay]);

  return (
    <Line
      ref={lineRef}
      points={[p1.x, p1.y, p2.x, p2.y]}
      stroke={`rgba(255,255,255,${OPACITY.half})`}
      strokeWidth={1}
      lineCap="round"
      lineJoin="round"
      listening={false}
    />
  );
}
