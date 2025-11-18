import React, { useEffect, useRef, useState } from "react";
import { Group, Shape, Text } from "react-konva";
import Konva from "konva";
import {
  FONT_FAMILY,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";
import { StarData } from "@/interfaces/StarInterfaces";

type Props = {
  data?: StarData;
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
  onClickCallback?: () => void;
  enableOnClick?: boolean;
  labelOverride?: string;
  showLabel?: boolean;
  labelSize?: number;
  focusedScreenPos?: { x: number; y: number } | null;
  windowCenter: { x: number; y: number };
  showHitBox?: boolean; // new prop for debugging
};

export default function MainStar({
  data,
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
  onClickCallback,
  enableOnClick = false,
  labelOverride,
  showLabel,
  labelSize = 12,
  focusedScreenPos,
  windowCenter,
  showHitBox = false,
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
        playHoverTween(1, 1);
      }}
      onClick={() => {
        if (enableOnClick) {
          if (onClickCallback) onClickCallback();
        }
      }}
    >
      <Shape
        ref={shapeRef}
        sceneFunc={(ctx) => {
          const starRadius = size * brightnessRef.current;
          const labelWidth = textRef.current?.width() || 0;
          const labelHeight = textRef.current?.height() || 0;
          const labelY = size + labelSize; // Text.y offset

          // Single hitbox calculation
          const hitRadiusX = Math.max(starRadius, labelWidth / 2);
          const hitRadiusY = starRadius + labelHeight + labelY;

          // Draw the star
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, starRadius);
          gradient.addColorStop(0, starColor);
          gradient.addColorStop(0.5, `rgba(255,255,255,${0.5 * opacity})`);
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // DEBUG hitbox
          if (showHitBox) {
            ctx.fillStyle = "rgba(255,0,0,0.2)";
            ctx.fillRect(-hitRadiusX, -starRadius, hitRadiusX * 2, hitRadiusY);
          }
        }}
        hitFunc={(ctx, shape) => {
          const starRadius = size * brightnessRef.current;
          const labelWidth = textRef.current?.width() || 0;
          const labelHeight = textRef.current?.height() || 0;
          const labelY = size + labelSize; // same Text.y offset

          // Reuse exact same hitbox
          const hitRadiusX = Math.max(starRadius, labelWidth / 2);
          const hitRadiusY = starRadius + labelHeight + labelY;

          ctx.beginPath();
          ctx.rect(-hitRadiusX, -starRadius, hitRadiusX * 2, hitRadiusY);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        listening
      />
      {showLabel && (data?.label || labelOverride) && (
        <Text
          ref={textRef}
          x={0} // relative to group
          y={size + labelSize}
          text={labelOverride || data?.label}
          fontSize={labelSize}
          fill={SPACE_TEXT_COLOR}
          stroke={SPACE_BACKGROUND_COLOR}
          strokeWidth={0.8}
          fillAfterStrokeEnabled={true}
          fontFamily={FONT_FAMILY.style.fontFamily}
          align="center"
          offsetX={textRef.current ? textRef.current.width() / 2 : 0}
        />
      )}
    </Group>
  );
}
