import React, { useEffect, useRef } from "react";
import { Group, Shape, Text } from "react-konva";
import Konva from "konva";
import {
  FONT_FAMILY,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";
import { isStarDataWithoutLink, StarData, StarClassificationSize } from "@/interfaces/StarInterfaces";
import { KonvaEventObject } from "konva/lib/Node";
import { useFocusContext } from "@/hooks/useFocusProvider";

// Helper function to get star size from classification
const getStarSize = (data?: StarData): number => {
  if (!data) return 5; // Default size for stars without data
  return StarClassificationSize[data.classification];
};

type Props = {
  data?: StarData;
  x?: number;
  y?: number;
  size?: number;
  brightness?: number;
  delay?: number; // delay in seconds
  initialOpacity?: number; // dim level (0 to 1)
  twinkleEnabled?: boolean;
  twinkleMin?: number;
  twinkleMax?: number;
  twinkleMinDuration?: number;
  twinkleMaxDuration?: number;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
  isConstellationFocused?: boolean;
  labelOverride?: string;
  showLabel?: boolean;
  labelSize?: number;
  showHitBox?: boolean;
  cancelBubble?: boolean;
  onHoverPointerOverride?: boolean;
  onHoverScale?: number
};

export default function MainStar({
  data,
  x = 0,
  y = 0,
  size,
  brightness = 1,
  delay = 0,
  initialOpacity = 0.1,
  twinkleEnabled = true,
  twinkleMin = 0.9,
  twinkleMax = 1.1,
  twinkleMinDuration = 700,
  twinkleMaxDuration = 1400,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  onClickCallback,
  isConstellationFocused = false,
  labelOverride,
  showLabel,
  labelSize = 12,
  showHitBox = false,
  cancelBubble = false,
  onHoverPointerOverride = false,
  onHoverScale = 1.1,
}: Props) {
  // Derive size from classification, or use provided size, or default to 5
  const actualSize = size ?? getStarSize(data);
  
  const groupRef = useRef<Konva.Group>(null);
  const shapeRef = useRef<Konva.Shape>(null);
  const textRef = useRef<Konva.Text>(null);
  const glowRef = useRef<Konva.Shape>(null);
  const brightnessRef = useRef(brightness);

  // Refs for tweens and timers
  const dimTweenRef = useRef<Konva.Tween | null>(null);
  const fullTweenRef = useRef<Konva.Tween | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const glowTweenRef = useRef<Konva.Tween | null>(null);
  const dimOthersTweenRef = useRef<Konva.Tween | null>(null);

  const starColor = useRef(
    ["#FFFFFF", "#F5F8FF", "#FFFEF5", "#FFF5F8"][Math.floor(Math.random() * 4)]
  ).current;

  const SCALE_ANIMATION_DURATION = 0.25;
  const focusScale = onHoverScale * 1.05; // Reduced from 1.1 to 1.05 for subtlety
  const EASING = Konva.Easings.EaseInOut;
  const { focusedObject } = useFocusContext();
  
  // Check if this star is currently focused
  const isFocused = data?.slug && focusedObject.star?.slug === data?.slug;

  // 1. Handle Fade Logic (Dim -> Wait -> Bright)
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Start invisible
    group.opacity(0);

    // Clean up previous state
    if (dimTweenRef.current) {
      dimTweenRef.current.destroy();
      dimTweenRef.current = null;
    }
    if (fullTweenRef.current) {
      fullTweenRef.current.destroy();
      fullTweenRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    // --- STAGE 1: Fade into DIM state immediately ---
    dimTweenRef.current = new Konva.Tween({
      node: group,
      duration: 1.5,
      opacity: initialOpacity,
      easing: Konva.Easings.EaseInOut,
    });
    dimTweenRef.current.play();

    // --- STAGE 2: Schedule fade to FULL state ---
    // We use setTimeout because Konva.Tween doesn't support 'delay'
    delayTimerRef.current = setTimeout(() => {
      // Stop the dim tween if it's still running so they don't fight
      if (dimTweenRef.current) {
        dimTweenRef.current.finish();
      }

      fullTweenRef.current = new Konva.Tween({
        node: group,
        duration: 0.4,
        opacity: 1,
        easing: Konva.Easings.EaseOut,
      });
      fullTweenRef.current.play();
    }, delay * 1000); // Convert seconds to ms

    // Cleanup on unmount or prop change
    return () => {
      if (dimTweenRef.current) {
        dimTweenRef.current.destroy();
        dimTweenRef.current = null;
      }
      if (fullTweenRef.current) {
        fullTweenRef.current.destroy();
        fullTweenRef.current = null;
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [delay, initialOpacity]);

  // 2. Twinkle logic (Unchanged)
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

    if (hoverTweenRef.current) {
      hoverTweenRef.current.finish();
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

  // Cleanup hover tween
  useEffect(() => {
    return () => {
      if (hoverTweenRef.current) {
        hoverTweenRef.current.destroy();
        hoverTweenRef.current = null;
      }
    };
  }, []);

  const handleStarClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isConstellationFocused) {
      e.cancelBubble = cancelBubble;
      if (onClickCallback) onClickCallback();
    }
  };

  // Determine the base scale (when not hovering)
  const getBaseScale = () => {
    // Star is focused
    if (data?.slug && focusedObject.star?.slug === data?.slug) {
      return focusScale;
    }
    // Constellation is focused (but star is not)
    if (isConstellationFocused) {
      return onHoverScale;
    }
    // Neither focused
    return 1;
  };

  const handleInteractionStart = () => {
    onHoverEnterCallback?.();
    if (onHoverPointerOverride || (data && !isStarDataWithoutLink(data))) {
      document.body.style.cursor = "pointer";
    }

    // If this star is dimmed, restore normal opacity on hover
    const shouldDim = isConstellationFocused && focusedObject.star && !isFocused;
    if (shouldDim) {
      const group = groupRef.current;
      if (group && dimOthersTweenRef.current) {
        dimOthersTweenRef.current.destroy();
        dimOthersTweenRef.current = null;
      }
      
      dimOthersTweenRef.current = new Konva.Tween({
        node: group!,
        duration: 0.2,
        opacity: 1,
        easing: EASING,
      });
      dimOthersTweenRef.current.play();
    }

    // Determine hover scale based on current state
    if (data?.slug && focusedObject.star?.slug === data?.slug) {
      // Star is focused - stay at focusScale
      playHoverTween(focusScale, focusScale);
    } else if (isConstellationFocused) {
      // Constellation is focused - scale up to focusScale (from base onHoverScale)
      playHoverTween(focusScale, focusScale);
    } else {
      // Nothing focused - scale to onHoverScale
      playHoverTween(onHoverScale, onHoverScale);
    }
  };

  const handleInteractionEnd = () => {
    onHoverLeaveCallback?.();
    
    // If this star should be dimmed, restore dim state
    const shouldDim = isConstellationFocused && focusedObject.star && !isFocused;
    if (shouldDim) {
      const group = groupRef.current;
      if (group && dimOthersTweenRef.current) {
        dimOthersTweenRef.current.destroy();
        dimOthersTweenRef.current = null;
      }
      
      dimOthersTweenRef.current = new Konva.Tween({
        node: group!,
        duration: 0.2,
        opacity: 0.4,
        easing: EASING,
      });
      dimOthersTweenRef.current.play();
    }
    
    // Return to base scale
    const baseScale = getBaseScale();
    playHoverTween(baseScale, baseScale);
  };

  // Update scale when focus state changes
  useEffect(() => {
    const baseScale = getBaseScale();
    playHoverTween(baseScale, baseScale);
  }, [focusedObject, isConstellationFocused]);

  // 4. Glow fade in/out animation
  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Clean up previous glow tween
    if (glowTweenRef.current) {
      glowTweenRef.current.destroy();
      glowTweenRef.current = null;
    }

    const targetOpacity = isFocused ? 1 : 0;
    
    glowTweenRef.current = new Konva.Tween({
      node: glow,
      duration: 0.3,
      opacity: targetOpacity,
      easing: EASING,
    });
    
    glowTweenRef.current.play();

    return () => {
      if (glowTweenRef.current) {
        glowTweenRef.current.destroy();
        glowTweenRef.current = null;
      }
    };
  }, [isFocused]);

  // 5. Dim other stars when one is focused
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Only dim if:
    // 1. Constellation is focused (we're on a star page)
    // 2. There IS a focused star
    // 3. This star is NOT the focused one
    const shouldDim = isConstellationFocused && focusedObject.star && !isFocused;

    // Clean up ALL previous tweens that control group opacity
    // This includes the initial fade-in tweens from Effect #1
    if (dimTweenRef.current) {
      dimTweenRef.current.destroy();
      dimTweenRef.current = null;
    }
    if (fullTweenRef.current) {
      fullTweenRef.current.destroy();
      fullTweenRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (dimOthersTweenRef.current) {
      dimOthersTweenRef.current.destroy();
      dimOthersTweenRef.current = null;
    }

    // Target opacity: dimmed (0.4) if should dim, otherwise full (1)
    const targetOpacity = shouldDim ? 0.4 : 1;
    
    dimOthersTweenRef.current = new Konva.Tween({
      node: group,
      duration: 0.3,
      opacity: targetOpacity,
      easing: EASING,
    });
    
    dimOthersTweenRef.current.play();

    return () => {
      if (dimOthersTweenRef.current) {
        dimOthersTweenRef.current.destroy();
        dimOthersTweenRef.current = null;
      }
    };
  }, [isConstellationFocused, focusedObject.star?.slug, isFocused]);

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      opacity={0}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onClick={handleStarClick}
      onTap={handleStarClick}
    >
      {/* Glow/Halo effect for focused star */}
      <Shape
        ref={glowRef}
        opacity={0}
        sceneFunc={(ctx) => {
            const starRadius = actualSize * brightnessRef.current;
            const glowRadius = starRadius * 2.5; // Glow extends 2.5x the star size

            // Create radial gradient for glow
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
            glowGradient.addColorStop(0, `${starColor}80`); // 50% opacity at center
            glowGradient.addColorStop(0.3, `${starColor}40`); // 25% opacity
            glowGradient.addColorStop(0.6, `${starColor}20`); // 12% opacity
            glowGradient.addColorStop(1, "transparent"); // Fully transparent at edge

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
          }}
          listening={false} // Glow doesn't interact with mouse
        />
      
      {/* Main star shape */}
      <Shape
        ref={shapeRef}
        sceneFunc={(ctx) => {
          const starRadius = actualSize * brightnessRef.current;

          // Draw the star
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, starRadius);
          gradient.addColorStop(0, starColor);
          gradient.addColorStop(0.5, starColor);
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // DEBUG hitbox
          if (showHitBox) {
            const labelWidth = textRef.current?.width() || 0;
            const labelHeight = textRef.current?.height() || 0;
            const labelY = actualSize + labelSize;
            const hitRadiusX = Math.max(starRadius, labelWidth / 2);
            const hitRadiusY = starRadius + labelHeight + labelY;
            ctx.fillStyle = "rgba(255,0,0,0.2)";
            ctx.fillRect(-hitRadiusX, -starRadius, hitRadiusX * 2, hitRadiusY);
          }
        }}
        hitFunc={(ctx, shape) => {
          const starRadius = actualSize * brightnessRef.current;
          const labelWidth = textRef.current?.width() || 0;
          const labelHeight = textRef.current?.height() || 0;
          const labelY = actualSize + labelSize;

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
          y={actualSize + labelSize}
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
