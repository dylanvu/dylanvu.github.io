import { Group } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import StaticStar from "./StaticStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";

/**
 * ParallaxLayer - Creates a camera dolly zoom / parallax effect
 * 
 * === THE DESIRED EFFECT ===
 * When focusing on a constellation, we want:
 * 1. The focused constellation zooms into the center and scales up
 * 2. ALL other objects (background stars, other constellations) appear to move in a 
 *    "spinning world" effect - they orbit around the focused point
 * 3. Objects at different depths move by different amounts, creating depth perception
 * 4. Everything rotates together to maintain upright orientation
 * 
 * === HOW IT WORKS ===
 * 
 * DEPTH SYSTEM:
 * - depth < 1: Background layers (e.g., 0.3, 0.5, 0.7) - move LESS than focused object
 * - depth = 1: Middle layer - moves SAME as focused object
 * - depth > 1: Foreground layers (e.g., 1.5, 2.0) - move MORE than focused object, rush past camera
 * 
 * TRANSLATION (ARC MOTION):
 * - Calculate how much focused constellation moved: (windowCenter - unfocusedPosition)
 * - Multiply by depth: dx = (windowCenter.x - unfocusedX) * depth
 * - Apply to current position: targetX = currentX + dx
 * - CRITICAL: Set offsetX/offsetY to create ARC motion (not linear!)
 *   - The offset point is where rotation happens around
 *   - This causes objects to orbit in a curve rather than move in a straight line
 * 
 * ROTATION (SPINNING WORLD):
 * - All layers counter-rotate by the focused constellation's rotation
 * - If focused constellation rotates from 30° to 0° (rotates -30°)
 * - All other layers also rotate -30° to maintain relative orientation
 * - Creates the "spinning world" effect where everything appears connected
 * 
 * SCALE (ZOOM):
 * - Background (depth < 1): Scales up less than focused constellation
 * - Foreground (depth > 1): Scales up MORE than focused constellation
 * - Formula: targetScale = 1 + (focusScale - 1) * depth
 * - Example: if focusScale = 2 and depth = 0.5, then targetScale = 1.5
 * - Example: if focusScale = 2 and depth = 1.5, then targetScale = 2.5
 * 
 * === RESULT ===
 * Creates a camera dolly zoom where:
 * - Focusing zooms toward the constellation
 * - Background recedes (moves away slower)
 * - Foreground rushes past (moves away faster, eventually offscreen)
 * - Everything orbits in arcs with rotation, creating 3D depth illusion
 */

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
        onFinish: () => {
          if (fadeTweenRef.current) {
            fadeTweenRef.current.destroy();
            fadeTweenRef.current = null;
          }
        },
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

    if (parallaxFocusData && focusedObject.constellation) {
      const { unfocusedX, unfocusedY } = parallaxFocusData;
      const constellation = focusedObject.constellation;
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
      // IMPORTANT: offsetX and offsetY create ARC MOTION, not linear translation!
      // The rotation happens around this offset point, causing objects to move along
      // a curved trajectory as they rotate. This creates the parallax "spinning world"
      // effect where objects appear to orbit around the focus point.
      offsetX: windowCenter.x,
      offsetY: windowCenter.y,
      // Note: We do NOT touch opacity here, preserving the fade-in
      onFinish: () => {
        if (moveTweenRef.current) {
          moveTweenRef.current.destroy();
          moveTweenRef.current = null;
        }
      },
    });

    moveTweenRef.current.play();

    return () => {
      // We usually don't force finish moveTween on unmount/re-render
      // to allow smooth transitions if inputs change rapidly
    };
  }, [parallaxFocusData, depth, windowCenter]);

  return (
    <Group
      ref={groupRef}
      x={windowCenter.x}
      y={windowCenter.y}
      offsetX={windowCenter.x}
      offsetY={windowCenter.y}
      opacity={0} // Explicitly start at 0 for the fade effect
      listening={false} // Background stars don't need mouse events
    >
      {stars.map((star, i) => (
        <StaticStar key={i} x={star.x} y={star.y} radius={star.radius} />
      ))}
    </Group>
  );
}
