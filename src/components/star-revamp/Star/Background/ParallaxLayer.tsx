import { Group } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import StaticStar from "./StaticStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";

interface ParallaxLayerProps {
  stars: Array<{ x: number; y: number; radius: number }>;
  depth: number;
  focusedConstellationPos: FocusedConstellationPos | null;
  starDelayOffset?: number;
}

// Must match FOCUS_ANIMATION_DURATION in Constellation.tsx
const ANIMATION_DURATION = 0.5;

export default function ParallaxLayer({
  stars,
  depth,
  focusedConstellationPos,
  starDelayOffset = 0,
}: ParallaxLayerProps) {
  const groupRef = useRef<Konva.Group>(null);
  const tweenRef = useRef<Konva.Tween | null>(null);
  const { windowCenter } = useWindowSizeContext();

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Immediate cleanup of previous motion to prevent "fighting"
    tweenRef.current?.finish();

    // --- CALCULATE TARGETS ---
    let targetRotation = 0;
    let targetScale = 1;
    let targetX = windowCenter.x;
    let targetY = windowCenter.y;

    if (focusedConstellationPos) {
      const { constellation, unfocusedX, unfocusedY } = focusedConstellationPos;

      // 1. Rotation: Counter-rotate against the constellation
      targetRotation = -(constellation.rotation ?? 0);

      // 2. Scale: Zoom based on depth
      const focusScale = constellation.focusScale ?? 1;
      targetScale = 1 + (focusScale - 1) * depth;

      // 3. Slide: Parallax translation
      const dx = (windowCenter.x - unfocusedX) * depth;
      const dy = (windowCenter.y - unfocusedY) * depth;

      targetX += dx;
      targetY += dy;
    }

    // --- EXECUTE TWEEN ---
    tweenRef.current = new Konva.Tween({
      node: group,
      duration: ANIMATION_DURATION,
      easing: Konva.Easings.EaseInOut, // Matches Constellation.tsx
      x: targetX,
      y: targetY,
      rotation: targetRotation,
      scaleX: targetScale,
      scaleY: targetScale,
      offsetX: windowCenter.x,
      offsetY: windowCenter.y,
    });

    tweenRef.current.play();

    return () => {
      // Do not finish() here, or it snaps to end on unmount/re-render.
      // Just let the next useEffect call .finish() if needed.
      // However, strictly speaking, we should reference the tween to stop it if the component dies.
      if (tweenRef.current) {
        // We generally want to let it finish naturally unless interrupted by a new move
      }
    };
  }, [focusedConstellationPos, depth, windowCenter]);

  return (
    <Group
      ref={groupRef}
      x={windowCenter.x}
      y={windowCenter.y}
      offsetX={windowCenter.x}
      offsetY={windowCenter.y}
    >
      {stars.map((star, i) => (
        <StaticStar
          key={i}
          x={star.x}
          y={star.y}
          radius={star.radius}
          delay={i * 50 + starDelayOffset}
        />
      ))}
    </Group>
  );
}
