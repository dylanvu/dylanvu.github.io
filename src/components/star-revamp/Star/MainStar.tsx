import React, { useEffect, useRef, useState } from "react";
import { Shape } from "react-konva";

const STAR_COLORS = {
  bright: "#FFFFFF",
  paleBlue: "#E0F7FF",
  paleYellow: "#FFFACD",
  palePink: "#FFDDEE",
};

type Props = {
  x?: number;
  y?: number;
  size?: number;
  brightness?: number; // base brightness multiplier
  delay?: number; // fade-in delay seconds
  // NEW: twinkle controls
  twinkleEnabled?: boolean;
  twinkleMin?: number; // min brightness target (e.g. 0.9)
  twinkleMax?: number; // max brightness target (e.g. 1.1)
  twinkleMinDuration?: number; // ms
  twinkleMaxDuration?: number; // ms
};

export default function MainStar({
  x = 0,
  y = 0,
  size = 5,
  brightness = 1,
  delay = 0,
  twinkleEnabled = true,
  twinkleMin = 0.9,
  twinkleMax = 1.1,
  twinkleMinDuration = 700,
  twinkleMaxDuration = 1400,
}: Props) {
  const shapeRef = useRef<any>(null);

  // only used for fade-in (rare updates)
  const [opacity, setOpacity] = useState<number>(0);

  // animated brightness lives in a ref for per-frame updates
  const brightnessRef = useRef<number>(brightness);

  // initial color
  const starColor = useRef(
    [
      STAR_COLORS.bright,
      STAR_COLORS.paleBlue,
      STAR_COLORS.paleYellow,
      STAR_COLORS.palePink,
    ][Math.floor(Math.random() * 4)]
  ).current;

  // fade-in
  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpacity(1);
      if (shapeRef.current) shapeRef.current.getLayer()?.batchDraw();
    }, delay * 1000);
    return () => window.clearTimeout(t);
  }, [delay]);

  // keep brightnessRef in sync if prop brightness changes
  useEffect(() => {
    brightnessRef.current = brightness;
    if (shapeRef.current) shapeRef.current.getLayer()?.batchDraw();
  }, [brightness]);

  // twinkle loop (ref updates + batchDraw)
  useEffect(() => {
    if (!twinkleEnabled) return () => undefined;

    let rafId: number | null = null;
    let stopped = false;

    const easeInOut = (t: number) => t * t * (3 - 2 * t);

    const animateTo = (start: number, target: number, duration: number) => {
      const startTime = performance.now();

      const step = (now: number) => {
        if (stopped) return;
        const t = (now - startTime) / duration;
        if (t >= 1) {
          brightnessRef.current = target;
          if (shapeRef.current) shapeRef.current.getLayer()?.batchDraw();
          scheduleNext();
          return;
        }

        const eased = easeInOut(t);
        brightnessRef.current = start + (target - start) * eased;

        if (shapeRef.current) shapeRef.current.getLayer()?.batchDraw();
        rafId = window.requestAnimationFrame(step);
      };

      rafId = window.requestAnimationFrame(step);
    };

    const scheduleNext = () => {
      if (stopped) return;
      // pick subtle target in provided range
      const min = Math.min(twinkleMin, twinkleMax);
      const max = Math.max(twinkleMin, twinkleMax);
      const target = min + Math.random() * (max - min);

      const dmin = Math.min(twinkleMinDuration, twinkleMaxDuration);
      const dmax = Math.max(twinkleMinDuration, twinkleMaxDuration);
      const duration = dmin + Math.random() * (dmax - dmin);

      const start = brightnessRef.current;
      animateTo(start, target, duration);
    };

    // start
    scheduleNext();

    return () => {
      stopped = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    twinkleEnabled,
    twinkleMin,
    twinkleMax,
    twinkleMinDuration,
    twinkleMaxDuration,
  ]); // restart if controls change

  return (
    <Shape
      ref={shapeRef}
      x={x}
      y={y}
      sceneFunc={(ctx, _shape) => {
        const currentBrightness = brightnessRef.current;
        const radius = size * currentBrightness;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

        gradient.addColorStop(0, starColor);
        gradient.addColorStop(0.5, `rgba(255,255,255,${0.5 * opacity})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
      listening={true}
      onClick={() => console.log("Star clicked!", { x, y })}
    />
  );
}
