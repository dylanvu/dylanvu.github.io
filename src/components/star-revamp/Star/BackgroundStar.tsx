import { Group, Rect, Shape } from "react-konva";
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
  focusedConstellationPos,
  enableFocusMovement = false,
}: {
  x: number;
  y: number;
  radius?: number;
  delay?: number;
  focusedConstellationPos: FocusedConstellationPos | null;
  enableFocusMovement?: boolean;
}) {
  // node refs
  const groupRef = useRef<Konva.Group | null>(null);
  const starRef = useRef<Konva.Shape | null>(null);
  const streakRef = useRef<Konva.Rect | null>(null);

  // tween refs for cleanup
  const vanishTweenRef = useRef<Konva.Tween | null>(null);
  const streakFadeInRef = useRef<Konva.Tween | null>(null);
  const streakFadeOutRef = useRef<Konva.Tween | null>(null);
  const resetTweenRef = useRef<Konva.Tween | null>(null);
  const fadeInTweenRef = useRef<Konva.Tween | null>(null);

  // stable initial position (ref so it's not re-derived on rerenders)
  const initialX = useRef(x);
  const initialY = useRef(y);

  // stable color per mount
  const color =
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)];

  // Fade in the star on mount (keeps original behavior)
  useEffect(() => {
    if (!starRef.current) return;
    fadeInTweenRef.current?.finish();

    fadeInTweenRef.current = new Konva.Tween({
      node: starRef.current,
      duration: 0.45,
      opacity: 1,
      delay,
      easing: Konva.Easings.Linear,
    });
    fadeInTweenRef.current.play();

    return () => {
      fadeInTweenRef.current?.finish();
      fadeInTweenRef.current = null;
    };
  }, [delay]);

  const { windowCenter } = useWindowSizeContext();

  useEffect(() => {
    if (!enableFocusMovement) return;
    const group = groupRef.current;
    const streak = streakRef.current;
    const star = starRef.current;
    if (!group || !streak || !star) return;

    // Finish any running tweens
    vanishTweenRef.current?.finish();
    streakFadeInRef.current?.finish();
    streakFadeOutRef.current?.finish();
    resetTweenRef.current?.finish();

    // If no constellation is focused -> reset
    if (!focusedConstellationPos) {
      resetTweenRef.current = new Konva.Tween({
        node: group,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x: initialX.current,
        y: initialY.current,
        scaleX: 1,
        scaleY: 1,
      });

      streakFadeOutRef.current = new Konva.Tween({
        node: streak,
        duration: 0.28,
        easing: Konva.Easings.EaseInOut,
        opacity: 0,
      });

      const starReset = new Konva.Tween({
        node: star,
        duration: 0.2,
        easing: Konva.Easings.Linear,
        opacity: 1,
      });

      resetTweenRef.current.play();
      streakFadeOutRef.current.play();
      starReset.play();
      return () => {
        resetTweenRef.current?.finish();
        streakFadeOutRef.current?.finish();
        starReset?.finish();
      };
    }

    // --- FOCUSED CONSTELLATION PARALLAX + ZOOM + ROTATION ---
    const cPos = focusedConstellationPos;
    const constellation = cPos.constellation;

    // 1. Calculate offset from constellation's UNFOCUSED position
    let dx = initialX.current - cPos.unfocusedX;
    let dy = initialY.current - cPos.unfocusedY;

    // 2. Apply parallax depth based on star size (smaller stars = more depth/distance)
    const depth = 1 - Math.min(radius / 4, 0.8);
    dx *= depth;
    dy *= depth;

    // 3. Apply the constellation's scale transformation
    const scaleFactor =
      (constellation.scale ?? 1) * (constellation.focusScale ?? 1);
    dx *= scaleFactor;
    dy *= scaleFactor;

    // 4. Apply rotation around windowCenter (constellation goes from its rotation to 0°)
    // We need to unwind the original rotation, so we rotate in the opposite direction
    const originalRotation = constellation.rotation ?? 0;
    const rotationRad = -originalRotation * (Math.PI / 180);
    const cosTheta = Math.cos(rotationRad);
    const sinTheta = Math.sin(rotationRad);
    const rotatedDx = dx * cosTheta - dy * sinTheta;
    const rotatedDy = dx * sinTheta + dy * cosTheta;

    // 5. Final position: windowCenter + scaled/rotated offset
    const finalX = windowCenter.x + rotatedDx;
    const finalY = windowCenter.y + rotatedDy;

    // --- STREAK CALCULATION (unchanged) ---
    const vx = group.x() - windowCenter.x;
    const vy = group.y() - windowCenter.y;
    let vlen = Math.hypot(vx, vy) || 1;
    const nx = vx / vlen;
    const ny = vy / vlen;
    const nudgeFactor = Math.min(Math.max(vlen / 300, 0), 1);
    const nudgeDistance = 5 + nudgeFactor * (30 - 5);

    const targetX = finalX + nx * nudgeDistance;
    const targetY = finalY + ny * nudgeDistance;

    const streakLength = Math.max(8, nudgeDistance * 1.5);
    const streakHeight = Math.max(1, radius * 2.2);

    streak.width(streakLength);
    streak.height(streakHeight);
    streak.offsetX(0);
    streak.offsetY(streakHeight / 2);
    streak.x(0);
    streak.y(0);
    streak.fillLinearGradientEndPoint({ x: streakLength, y: 0 });
    const angleDeg = (Math.atan2(ny, nx) * 180) / Math.PI;
    streak.rotation(angleDeg);
    streak.cornerRadius(Math.max(1, radius));
    streak.shadowColor(color);
    streak.shadowBlur(Math.max(0, radius * 2.5));
    streak.shadowOpacity(0.45);
    streak.opacity(0);

    const duration = 0.55 + Math.random() * 0.5;
    const easing = Konva.Easings.EaseInOut;

    vanishTweenRef.current = new Konva.Tween({
      node: group,
      duration,
      easing,
      x: targetX,
      y: targetY,
      scaleX: 0.96,
      scaleY: 0.96,
    });

    streakFadeInRef.current = new Konva.Tween({
      node: streak,
      duration: Math.max(0.28, duration * 0.5),
      easing,
      opacity: 0.85,
      delay: Math.random() * 0.06,
    });

    streakFadeOutRef.current = new Konva.Tween({
      node: streak,
      duration: 0.36,
      easing: Konva.Easings.Linear,
      opacity: 0,
      delay: duration - 0.24 > 0 ? duration - 0.24 : duration * 0.65,
    });

    const starFade = new Konva.Tween({
      node: star,
      duration: Math.min(0.32, duration * 0.5),
      easing: Konva.Easings.Linear,
      opacity: 0.8,
    });

    vanishTweenRef.current.play();
    streakFadeInRef.current.play();
    streakFadeOutRef.current.play();
    starFade.play();

    return () => {
      vanishTweenRef.current?.finish();
      streakFadeInRef.current?.finish();
      streakFadeOutRef.current?.finish();
      starFade?.finish();
    };
  }, [focusedConstellationPos, radius, windowCenter]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      vanishTweenRef.current?.finish();
      streakFadeInRef.current?.finish();
      streakFadeOutRef.current?.finish();
      resetTweenRef.current?.finish();
      fadeInTweenRef.current?.finish();
    };
  }, []);

  // NOTE: the fillLinearGradient props here are small defaults; we override the endpoint at runtime
  // so the gradient covers the full trail length.
  return (
    <Group
      ref={groupRef}
      x={initialX.current}
      y={initialY.current}
      scaleX={1}
      scaleY={1}
      listening={false}
    >
      {/* streak behind star */}
      <Rect
        ref={streakRef}
        x={0}
        y={0}
        width={1} // updated at runtime to full length
        height={Math.max(1, radius * 2)}
        opacity={0}
        listening={false}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 1, y: 0 }} // runtime updated to [streakLength,0]
        fillLinearGradientColorStops={[
          0,
          color,
          0.45,
          "rgba(255,255,255,0.85)",
          0.85,
          "rgba(255,255,255,0.15)",
          1,
          "transparent",
        ]}
      />

      {/* star - exact same look as original BackgroundStar */}
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
