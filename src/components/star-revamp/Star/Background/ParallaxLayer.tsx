import { Group } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import StaticStar from "@/components/star-revamp/Star/Background/StaticStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";

interface ParallaxLayerProps {
  stars: Array<{ x: number; y: number; radius: number }>;
  depth: number; // 0.1 (Far/Static) to 1.0 (Near/Moves with Constellation)
  focusedConstellationPos: FocusedConstellationPos | null;
  starDelayOffset?: number;
}

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
      // If depth is high, we zoom almost as much as the constellation
      const focusScale = constellation.focusScale ?? 1;
      targetScale = 1 + (focusScale - 1) * depth;

      // 3. Slide: Parallax translation
      // Moves the layer slightly to simulate the camera panning to the target
      const dx = (windowCenter.x - unfocusedX) * depth;
      const dy = (windowCenter.y - unfocusedY) * depth;

      targetX += dx;
      targetY += dy;
    }

    // --- EXECUTE TWEEN ---
    tweenRef.current = new Konva.Tween({
      node: group,
      duration: 0.8, // Syncs with Constellation focus speed
      easing: Konva.Easings.EaseInOut,
      x: targetX,
      y: targetY,
      rotation: targetRotation,
      scaleX: targetScale,
      scaleY: targetScale,
      // CRITICAL: We pivot around the window center to create the "Wheel" effect
      offsetX: windowCenter.x,
      offsetY: windowCenter.y,
    });

    tweenRef.current.play();

    return () => {
      tweenRef.current?.finish();
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
