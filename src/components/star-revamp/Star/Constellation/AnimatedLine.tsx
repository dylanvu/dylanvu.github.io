import { Line } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { useFocusContext } from "@/hooks/useFocusProvider";

export default function AnimatedLine({
  p1,
  p2,
  duration = 0.5,
  delay = 0,
  constellationData,
}: {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  duration?: number;
  delay?: number;
  constellationData?: { name: string };
}) {
  const { focusedObject } = useFocusContext();
  
  // Disable listening for lines in Elevare when Elevare is focused
  const shouldDisableListening = 
    constellationData?.name === "Elevare" &&
    focusedObject.constellation?.name === "Elevare";
  const lineRef = useRef<Konva.Line>(null);
  const totalLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);

  useEffect(() => {
    if (!lineRef.current) return;
    const line = lineRef.current;

    line.dash([totalLength, totalLength]);
    line.dashOffset(totalLength);
    line.getLayer()?.batchDraw();

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000 - delay; // subtract delay
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      line.dashOffset(totalLength * (1 - progress));
      line.getLayer()?.batchDraw();
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [p1.x, p1.y, p2.x, p2.y, totalLength, duration, delay]);

  return (
    <Line
      ref={lineRef}
      points={[p1.x, p1.y, p2.x, p2.y]}
      stroke="rgba(255,255,255,0.5)"
      strokeWidth={1}
      lineCap="round"
      lineJoin="round"
      listening={!shouldDisableListening}
    />
  );
}
