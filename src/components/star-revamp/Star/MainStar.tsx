import React, { useEffect, useRef, useState } from "react";
import { Shape, Text } from "react-konva";
import Konva from "konva";
import { FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";

type Props = {
  x?: number;
  y?: number;
  size?: number;
  brightness?: number;
  delay?: number;
  twinkleEnabled?: boolean;
  twinkleMin?: number;
  twinkleMax?: number;
  twinkleMinDuration?: number;
  twinkleMaxDuration?: number;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  label?: string;
  labelSize?: number;
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
  onHoverEnterCallback,
  onHoverLeaveCallback,
  label,
  labelSize = 12,
}: Props) {
  const shapeRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const brightnessRef = useRef<number>(brightness);
  const starColor = useRef(
    ["#FFFFFF", "#E0F7FF", "#FFFACD", "#FFDDEE"][Math.floor(Math.random() * 4)]
  ).current;

  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpacity(1);
      shapeRef.current?.getLayer()?.batchDraw();
    }, delay * 1000);
    return () => window.clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    brightnessRef.current = brightness;
    shapeRef.current?.getLayer()?.batchDraw();
  }, [brightness]);

  // Twinkle logic (same as before)
  useEffect(() => {
    if (!twinkleEnabled) return;
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
          shapeRef.current?.getLayer()?.batchDraw();
          scheduleNext();
          return;
        }
        const eased = easeInOut(t);
        brightnessRef.current = start + (target - start) * eased;
        shapeRef.current?.getLayer()?.batchDraw();
        rafId = window.requestAnimationFrame(step);
      };
      rafId = window.requestAnimationFrame(step);
    };

    const scheduleNext = () => {
      if (stopped) return;
      const target =
        Math.min(twinkleMin, twinkleMax) +
        Math.random() *
          (Math.max(twinkleMin, twinkleMax) - Math.min(twinkleMin, twinkleMax));
      const duration =
        Math.min(twinkleMinDuration, twinkleMaxDuration) +
        Math.random() *
          (Math.max(twinkleMinDuration, twinkleMaxDuration) -
            Math.min(twinkleMinDuration, twinkleMaxDuration));
      animateTo(brightnessRef.current, target, duration);
    };

    scheduleNext();
    return () => {
      stopped = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [
    twinkleEnabled,
    twinkleMin,
    twinkleMax,
    twinkleMinDuration,
    twinkleMaxDuration,
  ]);

  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const SCALE_ANIMATION_DURATION = 0.75;
  const EASING = Konva.Easings.EaseInOut;
  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = shapeRef.current;
    if (!node) return;
    hoverTweenRef.current?.finish();
    hoverTweenRef.current = new Konva.Tween({
      node,
      duration: SCALE_ANIMATION_DURATION,
      scaleX: toScaleX,
      scaleY: toScaleY,
      easing: EASING,
    });
    hoverTweenRef.current.play();
  };

  return (
    <>
      <Shape
        ref={shapeRef}
        x={x}
        y={y}
        sceneFunc={(ctx, _shape) => {
          const radius = size * brightnessRef.current;
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
          gradient.addColorStop(0, starColor);
          gradient.addColorStop(0.5, `rgba(255,255,255,${0.5 * opacity})`);
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
        }}
        hitFunc={(ctx, shape) => {
          const radius = size * brightnessRef.current;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        listening={true}
        onClick={() => console.log("Star clicked!", { x, y })}
        onMouseEnter={() => {
          onHoverEnterCallback?.();
          document.body.style.cursor = "pointer";
          playHoverTween(1.1, 1.1);
        }}
        onMouseLeave={() => {
          onHoverLeaveCallback?.();
          document.body.style.cursor = "default";
          playHoverTween(1, 1);
        }}
      />
      {label && (
        <Text
          ref={textRef}
          x={x}
          y={y + size + labelSize} // spacing below the star
          text={label}
          fontSize={labelSize}
          fill={SPACE_TEXT_COLOR}
          fontFamily={FONT_FAMILY.style.fontFamily}
          align="center"
          offsetX={textRef.current ? textRef.current.width() / 2 : 0} // center dynamically
        />
      )}
    </>
  );
}
