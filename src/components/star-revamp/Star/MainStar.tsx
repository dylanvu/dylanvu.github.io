import React, { useEffect, useRef, useState } from "react";
import { Group, Shape, Text } from "react-konva";
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
  focusedScreenPos?: { x: number; y: number } | null;
  windowCenter: { x: number; y: number };
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
  focusedScreenPos,
  windowCenter,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const shapeRef = useRef<Konva.Shape>(null);
  const textRef = useRef<Konva.Text>(null);
  const [opacity, setOpacity] = useState(0);
  const brightnessRef = useRef(brightness);

  const starColor = useRef(
    ["#FFFFFF", "#E0F7FF", "#FFFACD", "#FFDDEE"][Math.floor(Math.random() * 4)]
  ).current;

  const SCALE_ANIMATION_DURATION = 0.25;
  const EASING = Konva.Easings.EaseInOut;
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const focusTweenRef = useRef<Konva.Tween | null>(null);

  // Fade-in
  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpacity(1);
      shapeRef.current?.getLayer()?.batchDraw();
      textRef.current?.getLayer()?.batchDraw();
    }, delay * 1000);
    return () => window.clearTimeout(t);
  }, [delay]);

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

  // Hover scale
  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
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

  // Move / vanish tween
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    focusTweenRef.current?.finish();

    const startPos = node.getAbsolutePosition();
    const startX = startPos?.x ?? x;
    const startY = startPos?.y ?? y;

    if (focusedScreenPos) {
      const focal = focusedScreenPos ?? windowCenter;
      let vx = startX - focal.x;
      let vy = startY - focal.y;
      let vlen = Math.hypot(vx, vy);
      if (vlen < 0.00001) {
        vx = 0;
        vy = -1;
        vlen = 1;
      }
      const nx = vx / vlen;
      const ny = vy / vlen;

      const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
      const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
      const viewportDiagonal = Math.hypot(vw, vh);
      const offscreenDist = viewportDiagonal * 1.4;

      node.to({
        x: startX + nx * offscreenDist,
        y: startY + ny * offscreenDist,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
      });
    } else {
      node.to({
        x,
        y,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
      });
    }
  }, [focusedScreenPos, x, y, windowCenter]);

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
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
      onClick={() => {
        console.log("click");
      }}
    >
      <Shape
        ref={shapeRef}
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
        listening
      />
      {label && (
        <Text
          ref={textRef}
          x={0} // relative to group
          y={size + labelSize}
          text={label}
          fontSize={labelSize}
          fill={SPACE_TEXT_COLOR}
          fontFamily={FONT_FAMILY.style.fontFamily}
          align="center"
          offsetX={textRef.current ? textRef.current.width() / 2 : 0}
        />
      )}
    </Group>
  );
}
