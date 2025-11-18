import { Group, Rect, Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { ConstellationData } from "@/interfaces/StarInterfaces";

const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

export default function BackgroundStar({
  x,
  y,
  radius = 1,
  delay = 0,
  focusedConstellationPos, // screen-space { x, y } or null
  enableFocusMovement = false,
}: {
  x: number;
  y: number;
  radius?: number;
  delay?: number;
  focusedConstellationPos: {
    x: number;
    y: number;
    constellation: ConstellationData;
  } | null;
  enableFocusMovement?: boolean;
}) {
  const focusedConstellationRotation =
    focusedConstellationPos?.constellation?.rotation ?? 0;
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

  useEffect(() => {
    if (!enableFocusMovement) return;
    const group = groupRef.current;
    const streak = streakRef.current;
    const star = starRef.current;
    if (!group || !streak || !star) return;

    // finish currently-running tweens
    vanishTweenRef.current?.finish();
    streakFadeInRef.current?.finish();
    streakFadeOutRef.current?.finish();
    resetTweenRef.current?.finish();

    // If no constellation is focused -> reset position & scale
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

    // --- FOCUSED CONSTELLATION PARALLAX ---
    const currentX = group.x();
    const currentY = group.y();

    // compute relative offset to constellation center
    let dx = initialX.current - focusedConstellationPos.x;
    let dy = initialY.current - focusedConstellationPos.y;

    // depth factor based on star size (smaller = farther)
    const depth = 1 - Math.min(radius / 4, 0.8); // adjust MAX_RADIUS if needed
    dx *= depth;
    dy *= depth;

    // rotation of the focused constellation
    const rotationRad = (focusedConstellationRotation ?? 0) * (Math.PI / 180); // convert deg -> rad
    const cosTheta = Math.cos(rotationRad);
    const sinTheta = Math.sin(rotationRad);

    const rotatedX = dx * cosTheta - dy * sinTheta;
    const rotatedY = dx * sinTheta + dy * cosTheta;

    // optional: small scale factor for parallax effect
    const scaleFactor = 1; // could tweak 0.95–1.05 if desired
    const finalX = focusedConstellationPos.x + rotatedX * scaleFactor;
    const finalY = focusedConstellationPos.y + rotatedY * scaleFactor;

    // compute streak direction / magnitude as before
    let vx = currentX - focusedConstellationPos.x;
    let vy = currentY - focusedConstellationPos.y;
    let vlen = Math.hypot(vx, vy);
    if (vlen < 1e-5) {
      vx = 0;
      vy = -1;
      vlen = 1;
    }
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
    // @ts-ignore
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
  }, [focusedConstellationPos, focusedConstellationRotation]);

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
