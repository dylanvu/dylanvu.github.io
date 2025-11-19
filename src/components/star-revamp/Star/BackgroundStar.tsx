import { Group, Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";

const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

export default function BackgroundStar({
  x,
  y,
  radius = 1,
  delay = 0,
  parallaxDuration,
  focusedConstellationPos,
  enableFocusMovement = false,
}: {
  x: number;
  y: number;
  radius?: number;
  delay?: number;
  parallaxDuration?: number; // Should roughly match constellation duration (0.5s)
  focusedConstellationPos: FocusedConstellationPos | null;
  enableFocusMovement?: boolean;
}) {
  // node refs
  const groupRef = useRef<Konva.Group | null>(null);
  const starRef = useRef<Konva.Shape | null>(null);

  // tween refs for cleanup
  const moveTweenRef = useRef<Konva.Tween | null>(null);
  const fadeInTweenRef = useRef<Konva.Tween | null>(null);

  // stable initial position
  const initialX = useRef(x);
  const initialY = useRef(y);

  const color = useRef(
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)]
  ).current;

  const { windowCenter } = useWindowSizeContext();

  // 1. Fade in the star on mount
  useEffect(() => {
    if (!starRef.current) return;
    fadeInTweenRef.current?.finish();

    const fadeTimeout = setTimeout(() => {
      fadeInTweenRef.current = new Konva.Tween({
        node: starRef.current!,
        duration: 0.45,
        opacity: 1,
        easing: Konva.Easings.Linear,
      });
      fadeInTweenRef.current.play();
    }, delay);

    return () => {
      fadeInTweenRef.current?.finish();
      clearTimeout(fadeTimeout);
    };
  }, [delay]);

  // 2. Handle Movement and Focus (Parallax)
  useEffect(() => {
    if (!enableFocusMovement) return;
    const group = groupRef.current;
    if (!group) return;

    moveTweenRef.current?.finish();

    // --- RESET STATE (No Focus) ---
    if (!focusedConstellationPos) {
      moveTweenRef.current = new Konva.Tween({
        node: group,
        duration: 0.6,
        easing: Konva.Easings.EaseInOut,
        x: initialX.current,
        y: initialY.current,
        scaleX: 1,
        scaleY: 1,
      });
      moveTweenRef.current.play();
      return;
    }

    // --- FOCUSED CONSTELLATION PARALLAX ---
    const cPos = focusedConstellationPos;
    const constellation = cPos.constellation;

    // 1. Calculate vector from the Constellation Center to this Background Star
    // This represents the star's position in the "Unfocused" screen space.
    const vx = initialX.current - cPos.unfocusedX;
    const vy = initialY.current - cPos.unfocusedY;

    // 2. Rotation Math
    // The Constellation rotates from `transformData.rotation` to `0` when focused.
    // To mimic the camera rotating with it, the background stars must orbit
    // the center by the negative of that angle.
    const originalRotation = constellation.rotation ?? 0;
    const rotationRad = -originalRotation * (Math.PI / 180);
    const cos = Math.cos(rotationRad);
    const sin = Math.sin(rotationRad);

    // Rotate the vector
    const rx = vx * cos - vy * sin;
    const ry = vx * sin + vy * cos;

    // 3. Scale (Zoom) Math with Depth
    // `proximity`: 0.0 = Infinite distance (doesn't move), 1.0 = Same plane as constellation
    // Smaller stars (radius 1) are further away -> lower proximity.
    // Larger stars (radius 3+) are closer -> higher proximity.
    const proximity = Math.min((radius / 4) * 0.6 + 0.1, 0.8);

    // The constellation is zooming by `focusScale`.
    // The background zooms by a fraction of that based on proximity.
    // If proximity is low, effectiveScale stays close to 1 (no move).
    // If proximity is high, effectiveScale approaches focusScale.
    const targetZoom = constellation.focusScale;
    const effectiveScale = 1 + (targetZoom - 1) * proximity;

    // 4. Final Position
    // Place relative to the NEW center (Window Center)
    const finalX = windowCenter.x + rx * effectiveScale;
    const finalY = windowCenter.y + ry * effectiveScale;

    // 5. Execute Tween
    const duration = parallaxDuration ?? 0.5; // Match the 0.5s in Constellation.tsx

    moveTweenRef.current = new Konva.Tween({
      node: group,
      duration: duration,
      easing: Konva.Easings.EaseInOut,
      x: finalX,
      y: finalY,
    });
    moveTweenRef.current.play();

    return () => {
      moveTweenRef.current?.finish();
    };
  }, [
    focusedConstellationPos,
    radius,
    windowCenter,
    parallaxDuration,
    enableFocusMovement,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      moveTweenRef.current?.finish();
      fadeInTweenRef.current?.finish();
    };
  }, []);

  return (
    <Group
      ref={groupRef}
      x={initialX.current}
      y={initialY.current}
      listening={false}
    >
      <Shape
        ref={starRef}
        x={0}
        y={0}
        opacity={0}
        listening={false}
        sceneFunc={(ctx) => {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, "rgba(255,255,255,0.2)");
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
        }}
      />
    </Group>
  );
}
