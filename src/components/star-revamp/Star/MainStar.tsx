import React, { useEffect, useRef } from "react";
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
  delay?: number; // delay in seconds
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
  windowCenter: { x: number; y: number };
  showHitBox?: boolean;
  cancelBubble?: boolean;
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
  windowCenter,
  showHitBox = false,
  cancelBubble = false,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const shapeRef = useRef<Konva.Shape>(null);
  const textRef = useRef<Konva.Text>(null);
  const brightnessRef = useRef(brightness);

  const fadeTweenRef = useRef<Konva.Tween | null>(null);

  const starColor = useRef(
    ["#FFFFFF", "#E0F7FF", "#FFFACD", "#FFDDEE"][Math.floor(Math.random() * 4)]
  ).current;

  const SCALE_ANIMATION_DURATION = 0.25;
  const EASING = Konva.Easings.EaseInOut;
  const hoverTweenRef = useRef<Konva.Tween | null>(null);

  // 1. Handle Fade-In Animation SAFELY
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Reset opacity to 0 initially if this is a fresh mount/remount
    // We use .opacity() directly to avoid React state causing re-renders
    group.opacity(0);

    // SAFELY clean up previous tween
    if (fadeTweenRef.current) {
      fadeTweenRef.current.destroy();
      fadeTweenRef.current = null;
    }

    // Create new tween
    fadeTweenRef.current = new Konva.Tween({
      node: group,
      duration: 1,
      delay: delay, // Konva handles the delay natively here
      opacity: 1,
      easing: Konva.Easings.EaseInOut,
    });

    fadeTweenRef.current.play();

    // Cleanup function
    return () => {
      if (fadeTweenRef.current) {
        fadeTweenRef.current.destroy();
        fadeTweenRef.current = null; // <--- THIS IS THE CRITICAL FIX
      }
    };
  }, [delay]);

  // 2. Twinkle logic
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

  // 3. Hover scale
  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node) return;

    // Safety check for hover tween as well
    if (hoverTweenRef.current) {
      hoverTweenRef.current.finish();
      // We use finish() here instead of destroy() usually for hover
      // so it snaps to end state, but destroy is fine too if we remake it immediately
    }

    hoverTweenRef.current = new Konva.Tween({
      node,
      duration: SCALE_ANIMATION_DURATION,
      scaleX: toScaleX,
      scaleY: toScaleY,
      easing: EASING,
    });
    hoverTweenRef.current.play();
  };

  // Cleanup hover tween on unmount
  useEffect(() => {
    return () => {
      if (hoverTweenRef.current) {
        hoverTweenRef.current.destroy();
        hoverTweenRef.current = null;
      }
    };
  }, []);

  const handleStarClick = (e: any) => {
    if (enableOnClick) {
      e.cancelBubble = cancelBubble;
      if (onClickCallback) onClickCallback();
    }
  };

  const handleInteractionStart = () => {
    onHoverEnterCallback?.();
    document.body.style.cursor = "pointer";
    playHoverTween(1.1, 1.1);
  };

  const handleInteractionEnd = () => {
    onHoverLeaveCallback?.();
    playHoverTween(1, 1);
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      opacity={0} // Ensure it starts invisible for the tween to pick up
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onClick={handleStarClick}
      onTap={handleStarClick}
    >
      <Shape
        ref={shapeRef}
        sceneFunc={(ctx) => {
          const starRadius = size * brightnessRef.current;

          // Draw the star
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, starRadius);
          gradient.addColorStop(0, starColor);
          gradient.addColorStop(0.5, `rgba(255,255,255,0.5)`);
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // DEBUG hitbox
          if (showHitBox) {
            const labelWidth = textRef.current?.width() || 0;
            const labelHeight = textRef.current?.height() || 0;
            const labelY = size + labelSize;
            const hitRadiusX = Math.max(starRadius, labelWidth / 2);
            const hitRadiusY = starRadius + labelHeight + labelY;
            ctx.fillStyle = "rgba(255,0,0,0.2)";
            ctx.fillRect(-hitRadiusX, -starRadius, hitRadiusX * 2, hitRadiusY);
          }
        }}
        hitFunc={(ctx, shape) => {
          const starRadius = size * brightnessRef.current;
          const labelWidth = textRef.current?.width() || 0;
          const labelHeight = textRef.current?.height() || 0;
          const labelY = size + labelSize;

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
          x={0}
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
