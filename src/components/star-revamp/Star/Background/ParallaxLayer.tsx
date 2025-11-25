import { Group } from "react-konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import Konva from "konva";
import StaticStar from "./StaticStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";

interface ParallaxLayerProps {
  stars: Array<{ x: number; y: number; radius: number }>;
  depth: number;
  fadeDuration: number; // in seconds
  fadeDelay: number; // in seconds
}

const MOVEMENT_ANIMATION_DURATION = 0.5;

export default function ParallaxLayer({
  stars,
  depth,
  fadeDuration,
  fadeDelay,
}: ParallaxLayerProps) {
  const groupRef = useRef<Konva.Group>(null);

  // Animation Refs
  const moveTweenRef = useRef<Konva.Tween | null>(null);
  const fadeTweenRef = useRef<Konva.Tween | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { windowCenter } = useWindowSizeContext();
  const { parallaxFocusData, focusedObject } = useFocusContext();

  // 1. ENTRANCE FADE EFFECT
  // We keep this standard useEffect because it's a "Mount" animation, not a "Physics" update.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (fadeTweenRef.current) fadeTweenRef.current.destroy();

    // Reset to invisible initially
    group.opacity(0);

    fadeTimerRef.current = setTimeout(() => {
      fadeTweenRef.current = new Konva.Tween({
        node: group,
        duration: fadeDuration,
        opacity: 1,
        easing: Konva.Easings.Linear,
        onFinish: () => { fadeTweenRef.current = null; },
      });
      fadeTweenRef.current.play();
    }, fadeDelay * 1000);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (fadeTweenRef.current) fadeTweenRef.current.destroy();
    };
  }, [fadeDuration, fadeDelay]);


  // 2. PHYSICS & PARALLAX ENGINE
  // Changed to useLayoutEffect to prevent "Flashes" where React renders the group 
  // at the wrong position before the tween starts.
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // A. Destroy previous movement tween to prevent fighting
    if (moveTweenRef.current) {
        moveTweenRef.current.destroy();
        moveTweenRef.current = null;
    }

    // B. Calculate Target State
    let targetRotation = 0;
    let targetScale = 1;
    let targetX = windowCenter.x;
    let targetY = windowCenter.y;

    if (parallaxFocusData && focusedObject.constellation) {
      const { unfocusedX, unfocusedY } = parallaxFocusData;
      const constellation = focusedObject.constellation;
      
      // Counter-rotate the world
      targetRotation = -(constellation.rotation ?? 0);
      
      // Scale based on depth (Matches the Unified Camera Model math)
      const focusScale = constellation.focusScale ?? 1;
      targetScale = 1 + (focusScale - 1) * depth;
      
      // Parallax Shift
      const dx = (windowCenter.x - unfocusedX) * depth;
      const dy = (windowCenter.y - unfocusedY) * depth;
      targetX += dx;
      targetY += dy;
    }

    // C. Handle Initialization Case
    // If we are mounting, or if React re-rendered, we must ensure the node 
    // is positioned correctly relative to the pivot.
    // We set the Pivot (Offset) to the window center. This is crucial for the rotation math.
    group.offsetX(windowCenter.x);
    group.offsetY(windowCenter.y);

    // D. Start Tween
    moveTweenRef.current = new Konva.Tween({
      node: group,
      duration: MOVEMENT_ANIMATION_DURATION,
      easing: Konva.Easings.EaseInOut,
      x: targetX,
      y: targetY,
      rotation: targetRotation,
      scaleX: targetScale,
      scaleY: targetScale,
      // Ensure we maintain the pivot point during animation
      offsetX: windowCenter.x,
      offsetY: windowCenter.y,
      
      onFinish: () => { moveTweenRef.current = null; },
    });

    moveTweenRef.current.play();

  }, [parallaxFocusData, depth, windowCenter, focusedObject]);

  return (
    <Group
      ref={groupRef}
      // STATIC PROPS:
      // We explicitly set x/y/offset to the center here to satisfy initial render,
      // but useLayoutEffect takes over control immediately.
      x={windowCenter.x}
      y={windowCenter.y}
      offsetX={windowCenter.x}
      offsetY={windowCenter.y}
      opacity={0} // Start hidden for fade-in
      listening={false}
    >
      {stars.map((star, i) => (
        <StaticStar key={i} x={star.x} y={star.y} radius={star.radius} />
      ))}
    </Group>
  );
}