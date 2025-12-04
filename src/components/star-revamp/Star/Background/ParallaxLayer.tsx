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

  // Track if group is cached
  const isCachedRef = useRef(false);

  const { windowCenter } = useWindowSizeContext();
  const { parallaxFocusData, focusedObject } = useFocusContext();

  // 1. SHAPE CACHING FOR PERFORMANCE
  // Cache the group after stars are rendered to improve parallax performance
  // Individual StaticStar components are already cached, but caching the group provides additional benefit
  useEffect(() => {
    const group = groupRef.current;
    if (!group || isCachedRef.current) return;

    // Wait for stars to render and validate dimensions before caching
    const cacheTimer = setTimeout(() => {
      const clientRect = group.getClientRect();
      
      // Only cache if the group has valid, non-zero dimensions
      if (clientRect.width > 0 && clientRect.height > 0) {
        group.cache();
        isCachedRef.current = true;
      }
    }, 100);

    return () => {
      clearTimeout(cacheTimer);
      if (isCachedRef.current) {
        group.clearCache();
        isCachedRef.current = false;
      }
    };
  }, [stars]); // Re-cache if stars array changes (e.g., on resize)

  // 2. ENTRANCE FADE EFFECT
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

  // 3. PHYSICS & PARALLAX ENGINE (FIXED)
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
  // 🔧 FIX: Capture ACTUAL current position, don't calculate it
  const actualStart = {
    x: group.x(),
    y: group.y(),
    rotation: group.rotation(),
    scaleX: group.scaleX(),
    scaleY: group.scaleY(),
    offsetX: group.offsetX(),
    offsetY: group.offsetY(),
  };

  // Calculate only the END state
  const previousCam = {
    x: previousData.unfocusedX,
    y: previousData.unfocusedY,
    zoom: previousData.focusScale,
    rotation: previousData.rotation,
  };

  const endState = calculateParallaxLayerTransform(
    1, // Always get END state
    depth,
    previousCam,
    currentCam,
    windowCenter.x,
    windowCenter.y
  );

  // DON'T call setAttrs here - we're already in the right spot

  let startTime: number | null = null;

  moveAnimRef.current = new Konva.Animation((frame) => {
    if (startTime === null) startTime = frame!.time;

    const elapsed = (frame!.time - startTime) / 1000;
    const rawProgress = Math.min(elapsed / MOVEMENT_ANIMATION_DURATION, 1);

    // Apply easing (EaseInOut)
    const p =
      rawProgress < 0.5
        ? 2 * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    // Interpolate from actual start to calculated end
    group.setAttrs({
      x: actualStart.x + (endState.x - actualStart.x) * p,
      y: actualStart.y + (endState.y - actualStart.y) * p,
      rotation: actualStart.rotation + (endState.rotation - actualStart.rotation) * p,
      scaleX: actualStart.scaleX + (endState.scaleX - actualStart.scaleX) * p,
      scaleY: actualStart.scaleY + (endState.scaleY - actualStart.scaleY) * p,
      offsetX: actualStart.offsetX + (endState.offsetX - actualStart.offsetX) * p,
      offsetY: actualStart.offsetY + (endState.offsetY - actualStart.offsetY) * p,
    });

    if (rawProgress >= 1) {
      moveAnimRef.current?.stop();
      moveAnimRef.current = null;
    }
  }, group.getLayer());

  moveAnimRef.current.start();

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
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (moveTweenRef.current) {
        moveTweenRef.current.destroy();
        moveTweenRef.current = null;
      }
      if (moveAnimRef.current) {
        moveAnimRef.current.stop();
        moveAnimRef.current = null;
      }
    };
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
