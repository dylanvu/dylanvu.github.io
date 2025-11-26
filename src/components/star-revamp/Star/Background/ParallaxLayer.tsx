import { Group } from "react-konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import Konva from "konva";
import StaticStar from "./StaticStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { calculateParallaxLayerTransform } from "@/components/star-revamp/Star/Constellation/useParallaxCamera";
import { ParallaxFocusData } from "@/interfaces/StarInterfaces";

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
  const moveAnimRef = useRef<Konva.Animation | null>(null);
  const fadeTweenRef = useRef<Konva.Tween | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track previous parallax data locally (prevents race conditions)
  const prevParallaxDataRef = useRef<ParallaxFocusData | null>(null);

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
        onFinish: () => {
          fadeTweenRef.current = null;
        },
      });
      fadeTweenRef.current.play();
    }, fadeDelay * 1000);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (fadeTweenRef.current) fadeTweenRef.current.destroy();
    };
  }, [fadeDuration, fadeDelay]);

  // 2. PHYSICS & PARALLAX ENGINE (FIXED)
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Capture previous data from ref at START of effect
    const previousData = prevParallaxDataRef.current;

    // Stop previous animations to prevent fighting
    if (moveTweenRef.current) {
      moveTweenRef.current.destroy();
      moveTweenRef.current = null;
    }
    if (moveAnimRef.current) {
      moveAnimRef.current.stop();
      moveAnimRef.current = null;
    }

    // =========================================
    // CASE 1: Nothing focused - return to default
    // =========================================
    if (!parallaxFocusData || !focusedObject.constellation) {
      group.offsetX(windowCenter.x);
      group.offsetY(windowCenter.y);

      moveTweenRef.current = new Konva.Tween({
        node: group,
        duration: MOVEMENT_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        x: windowCenter.x,
        y: windowCenter.y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        offsetX: windowCenter.x,
        offsetY: windowCenter.y,
        onFinish: () => {
          moveTweenRef.current = null;
        },
      });
      moveTweenRef.current.play();

      // Update ref at END
      prevParallaxDataRef.current = parallaxFocusData;
      return;
    }

    // Detect HOP using constellation slug (stable string comparison)
    const isHop = !!(
      previousData &&
      previousData.constellation.slug !== parallaxFocusData.constellation.slug
    );

    // Build current camera state
    const currentCam = {
      x: parallaxFocusData.unfocusedX,
      y: parallaxFocusData.unfocusedY,
      zoom: parallaxFocusData.focusScale,
      rotation: parallaxFocusData.rotation,
    };

    // =========================================
    // CASE 2: HOP ANIMATION (constellation to constellation)
    // =========================================
    if (isHop && previousData) {
      const previousCam = {
        x: previousData.unfocusedX,
        y: previousData.unfocusedY,
        zoom: previousData.focusScale,
        rotation: previousData.rotation,
      };

      // Set initial state immediately (prevents flash)
      const startState = calculateParallaxLayerTransform(
        0,
        depth,
        previousCam,
        currentCam,
        windowCenter.x,
        windowCenter.y
      );
      group.setAttrs(startState);

      // Track animation start time
      let startTime: number | null = null;

      moveAnimRef.current = new Konva.Animation((frame) => {
        if (startTime === null) startTime = frame!.time;
        
        const elapsed = (frame!.time - startTime) / 1000; // Convert to seconds
        const rawProgress = Math.min(elapsed / MOVEMENT_ANIMATION_DURATION, 1);
        
        // Apply easing (EaseInOut)
        const p = rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

        const state = calculateParallaxLayerTransform(
          p,
          depth,
          previousCam,
          currentCam,
          windowCenter.x,
          windowCenter.y
        );
        group.setAttrs(state);

        // Stop when complete
        if (rawProgress >= 1) {
          moveAnimRef.current?.stop();
          moveAnimRef.current = null;
        }
      }, group.getLayer());

      moveAnimRef.current.start();

      // Update ref at END
      prevParallaxDataRef.current = parallaxFocusData;
      return;
    }

    // =========================================
    // CASE 3: INITIAL FOCUS (first focus, not a hop)
    // =========================================
    const constellation = focusedObject.constellation;
    const targetRotation = -(constellation.rotation ?? 0);
    const focusScale = constellation.focusScale ?? 1;
    const targetScale = 1 + (focusScale - 1) * depth;

    const dx = (windowCenter.x - parallaxFocusData.unfocusedX) * depth;
    const dy = (windowCenter.y - parallaxFocusData.unfocusedY) * depth;
    const targetX = windowCenter.x + dx;
    const targetY = windowCenter.y + dy;

    group.offsetX(windowCenter.x);
    group.offsetY(windowCenter.y);

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
      onFinish: () => {
        moveTweenRef.current = null;
      },
    });
    moveTweenRef.current.play();

    // Update ref at END
    prevParallaxDataRef.current = parallaxFocusData;
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
