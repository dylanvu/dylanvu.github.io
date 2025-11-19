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
  fadeDuration: number; // in seconds
  fadeDelay: number; // in seconds
}

const MOVEMENT_ANIMATION_DURATION = 0.5;

export default function ParallaxLayer({
  stars,
  depth,
  focusedConstellationPos,
  fadeDuration,
  fadeDelay,
}: ParallaxLayerProps) {
  const groupRef = useRef<Konva.Group>(null);

  // Animation Refs
  const moveTweenRef = useRef<Konva.Tween | null>(null);
  const fadeTweenRef = useRef<Konva.Tween | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { windowCenter } = useWindowSizeContext();

  // 1. ENTRANCE FADE EFFECT (Timer based)
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Cleanup previous attempts to avoid race conditions
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTweenRef.current?.finish();

    // Start invisible
    group.opacity(0);

    // Start the timer
    fadeTimerRef.current = setTimeout(() => {
      fadeTweenRef.current = new Konva.Tween({
        node: group,
        duration: fadeDuration,
        opacity: 1,
        easing: Konva.Easings.Linear,
      });
      fadeTweenRef.current.play();
    }, fadeDelay * 1000); // Convert seconds to milliseconds

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTweenRef.current?.finish();
    };
  }, [fadeDuration, fadeDelay]);

  // 2. MOVEMENT & PARALLAX EFFECT
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    moveTweenRef.current?.finish();

    let targetRotation = 0;
    let targetScale = 1;
    let targetX = windowCenter.x;
    let targetY = windowCenter.y;

    if (focusedConstellationPos) {
      const { constellation, unfocusedX, unfocusedY } = focusedConstellationPos;
      targetRotation = -(constellation.rotation ?? 0);
      const focusScale = constellation.focusScale ?? 1;
      targetScale = 1 + (focusScale - 1) * depth;
      const dx = (windowCenter.x - unfocusedX) * depth;
      const dy = (windowCenter.y - unfocusedY) * depth;
      targetX += dx;
      targetY += dy;
    }

    moveTweenRef.current = new Konva.Tween({
      node: group,
      duration: MOVEMENT_ANIMATION_DURATION,
      easing: Konva.Easings.EaseInOut,
      x: targetX,
      y: targetY,
      rotation: targetRotation,
      scaleX: targetScale,
      scaleY: targetScale,
      offsetX: windowCenter.x,
      offsetY: windowCenter.y,
      // Note: We do NOT touch opacity here, preserving the fade-in
    });

    moveTweenRef.current.play();

    return () => {
      // We usually don't force finish moveTween on unmount/re-render
      // to allow smooth transitions if inputs change rapidly
    };
  }, [focusedConstellationPos, depth, windowCenter]);

  return (
    <Group
      ref={groupRef}
      x={windowCenter.x}
      y={windowCenter.y}
      offsetX={windowCenter.x}
      offsetY={windowCenter.y}
      opacity={0} // Explicitly start at 0 for the fade effect
    >
      {stars.map((star, i) => (
        <StaticStar key={i} x={star.x} y={star.y} radius={star.radius} />
      ))}
    </Group>
  );
}
