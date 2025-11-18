import { Group, Rect, Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";

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
  focusedConstellationPos: { x: number; y: number } | null;
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

  // Main effect: when focus changes, animate out OR reset back
  useEffect(() => {
    if (!enableFocusMovement) return;
    const group = groupRef.current;
    const streak = streakRef.current;
    const star = starRef.current;
    if (!group || !streak || !star) return;

    // finish currently-running tweens to avoid conflicts
    vanishTweenRef.current?.finish();
    streakFadeInRef.current?.finish();
    streakFadeOutRef.current?.finish();
    resetTweenRef.current?.finish();

    // If there's no focal point -> reset to initial position & hide streak
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

      // hide streak immediately (opacity -> 0)
      streakFadeOutRef.current = new Konva.Tween({
        node: streak,
        duration: 0.28,
        easing: Konva.Easings.EaseInOut,
        opacity: 0,
      });

      // bring star back to full opacity
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

    // --- Focused: compute vector away from focal point and animate out ---
    // Use group's current position (handles previous animations)
    const currentX = group.x();
    const currentY = group.y();

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

    // compute distance-based nudge factor
    const MAX_NUDGE = 30; // max movement in px
    const MIN_NUDGE = 5; // min movement in px
    // vlen is the distance from the star to the focus
    const nudgeFactor = Math.min(Math.max(vlen / 300, 0), 1); // normalize by 300px
    const nudgeDistance = MIN_NUDGE + nudgeFactor * (MAX_NUDGE - MIN_NUDGE);
    const targetX = currentX + nx * nudgeDistance;
    const targetY = currentY + ny * nudgeDistance;

    const streakLength = Math.max(8, nudgeDistance * 1.5);
    const streakHeight = Math.max(1, radius * 2.2);

    // set rect geometry so gradient endpoints can be correct
    streak.width(streakLength);
    streak.height(streakHeight);

    // make rotation pivot the left-center of the rect, so the left end sits at star center
    streak.offsetX(0);
    streak.offsetY(streakHeight / 2);

    // place streak's left end at group origin
    streak.x(0);
    streak.y(0);

    // set gradient endpoint of the rect to the computed length so gradient spans full trail
    // use Konva setter to ensure runtime update
    // @ts-ignore runtime setter
    streak.fillLinearGradientEndPoint({ x: streakLength, y: 0 });

    // rotation so it points away from focal point
    const angleRad = Math.atan2(ny, nx);
    const angleDeg = (angleRad * 180) / Math.PI;
    streak.rotation(angleDeg);

    // make streak look soft & streak-like via corner radius and subtle shadow (shadow optional)
    streak.cornerRadius(Math.max(1, radius));
    streak.shadowColor(color);
    streak.shadowBlur(Math.max(0, radius * 2.5)); // small blur only; main visual is the gradient
    streak.shadowOpacity(0.45);

    // ensure streak starts invisible; we'll animate opacity in (not scale)
    streak.opacity(0);

    // small parallax scale on group for feel (reverted on reset)
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

    // fade the streak in quickly so the trail is visible immediately
    streakFadeInRef.current = new Konva.Tween({
      node: streak,
      duration: Math.max(0.28, duration * 0.5),
      easing,
      opacity: 0.85,
      delay: Math.random() * 0.06,
    });

    // then fade it out near the end so it doesn't persist on-screen
    streakFadeOutRef.current = new Konva.Tween({
      node: streak,
      duration: 0.36,
      easing: Konva.Easings.Linear,
      opacity: 0,
      delay: duration - 0.24 > 0 ? duration - 0.24 : duration * 0.65,
    });

    // fade star slightly while the streak is dominant
    const starFade = new Konva.Tween({
      node: star,
      duration: Math.min(0.32, duration * 0.5),
      easing: Konva.Easings.Linear,
      opacity: 0.8,
    });

    // play
    streakFadeInRef.current.play();
    vanishTweenRef.current.play();
    starFade.play();
    streakFadeOutRef.current.play();

    return () => {
      vanishTweenRef.current?.finish();
      streakFadeInRef.current?.finish();
      streakFadeOutRef.current?.finish();
      starFade?.finish();
    };
  }, [focusedConstellationPos]);

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
