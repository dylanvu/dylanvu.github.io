import React, { useEffect, useRef } from "react";
import { Group, Shape, Text } from "react-konva";
import Konva from "konva";
import {
  FONT_FAMILY,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
  MAIN_STAR_COLORS,
  getRandomColor,
  DURATION,
} from "@/app/theme";
import { isStarDataWithInternalLink, isStarDataWithoutLink, StarData, StarClassificationSize } from "@/interfaces/StarInterfaces";
import { KonvaEventObject } from "konva/lib/Node";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useMobile } from "@/hooks/useMobile";

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
  constellationData?: { name: string };
  labelOverride?: string;
  showLabel?: boolean;
  labelSize?: number;
  showHitBox?: boolean;
  cancelBubble?: boolean;
  onHoverPointerOverride?: boolean;
  onHoverScale?: number;
  colorOverride?: string; // Override the star color
};

function MainStar({
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
  constellationData,
  labelOverride,
  showLabel,
  labelSize = 12,
  showHitBox = false,
  cancelBubble = false,
  onHoverPointerOverride = false,
  onHoverScale = 1.1,
  colorOverride,
}: Props) {
  const { mobileScaleFactor, mobileFontScaleFactor } = useMobile();
  
  const { focusedObject } = useFocusContext();
  
  // Check if this star has a label
  const hasLabel = !!(data?.label || labelOverride);
  
  // Calculate scale factors - no growth during Elevare zoom on any device
  // When constellation is focused, stars stay at constant size (scale = 1)
  // This removes the mapScale compensation entirely
  const focusedScaleFactor = isConstellationFocused ? 1 : mobileScaleFactor;
  const focusedFontScaleFactor = isConstellationFocused ? 1 : mobileFontScaleFactor;
  
  // Derive size from classification, or use provided size, or default to 5
  // Apply mobile scale factor to star sizes ONLY when constellation is not focused
  // When focused, multiply by mapScale (or dampened mapScale on mobile) to compensate 
  // for ElevareMap's inverse scaling (1/mapScale)
  const actualSize = (size ?? getStarSize(data)) * focusedScaleFactor;
  // Apply mobile font scale factor to labels ONLY when constellation is not focused
  // When focused, multiply by mapScale (or dampened mapScale on mobile) to compensate
  // for ElevareMap's inverse scaling
  const scaledLabelSize = labelSize * focusedFontScaleFactor;
  
  const groupRef = useRef<Konva.Group>(null);
  const shapeRef = useRef<Konva.Shape>(null);
  const textRef = useRef<Konva.Text>(null);
  const glowRef = useRef<Konva.Shape>(null);
  const brightnessRef = useRef(brightness);

  // Refs for tweens and timers
  const opacityTweenRef = useRef<Konva.Tween | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const glowTweenRef = useRef<Konva.Tween | null>(null);
  const labelFadeTweenRef = useRef<Konva.Tween | null>(null);
  
  // Track if initial fade-in is complete
  const initialFadeCompleteRef = useRef(false);
  
  // Track label opacity separately
  const labelOpacityRef = useRef(0);
  
  // Pre-calculate label width to prevent position shift
  const labelText = labelOverride || data?.label;
  const labelWidth = useRef(0);
  if (labelText && showLabel) {
    const tempText = new Konva.Text({
      text: labelText,
      fontSize: scaledLabelSize,
      fontFamily: FONT_FAMILY.style.fontFamily,
    });
    labelWidth.current = tempText.width();
    tempText.destroy();
  }

  const starColor = useRef(
    getRandomColor(MAIN_STAR_COLORS)
  ).current;

  // Use colorOverride if provided, otherwise use the randomly generated color
  const effectiveColor = colorOverride || starColor;

  const SCALE_ANIMATION_DURATION = 0.25;
  const focusScale = onHoverScale * 1.05; // Reduced from 1.1 to 1.05 for subtlety
  const EASING = Konva.Easings.EaseInOut;
  
  // Check if this star is currently focused
  const isFocused = data?.slug && focusedObject.star?.slug === data?.slug;

  // 1. Initial fade-in animation (runs once on mount)
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Start invisible
    group.opacity(0);
    initialFadeCompleteRef.current = false;

    // Clean up previous state
    if (opacityTweenRef.current) {
      opacityTweenRef.current.destroy();
      opacityTweenRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    // --- STAGE 1: Fade into DIM state immediately ---
    opacityTweenRef.current = new Konva.Tween({
      node: group,
      duration: 1.5,
      opacity: initialOpacity,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        if (opacityTweenRef.current) {
          opacityTweenRef.current.destroy();
          opacityTweenRef.current = null;
        }
      },
    });
    opacityTweenRef.current.play();

    // --- STAGE 2: Schedule fade to FULL state ---
    delayTimerRef.current = setTimeout(() => {
      // Stop the dim tween if it's still running
      if (opacityTweenRef.current) {
        opacityTweenRef.current.finish();
      }

      opacityTweenRef.current = new Konva.Tween({
        node: group,
        duration: 0.4,
        opacity: 1,
        easing: Konva.Easings.EaseOut,
        onFinish: () => {
          // Mark initial fade as complete
          initialFadeCompleteRef.current = true;
          if (opacityTweenRef.current) {
            opacityTweenRef.current.destroy();
            opacityTweenRef.current = null;
          }
        },
      });
      opacityTweenRef.current.play();
    }, delay * 1000);

    // Cleanup on unmount
    return () => {
      if (opacityTweenRef.current) {
        opacityTweenRef.current.destroy();
        opacityTweenRef.current = null;
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [delay, initialOpacity]);

  // 2. Optimized twinkle logic
  useEffect(() => {
    if (!twinkleEnabled) return;
    let rafId: number | null = null;
    let stopped = false;
    let lastUpdateTime = 0;
    const THROTTLE_MS = 16; // ~60fps, adjust higher to reduce CPU usage

    const easeInOut = (t: number) => t * t * (3 - 2 * t);

    const animateTo = (start: number, target: number, duration: number) => {
      const startTime = performance.now();
      const step = (now: number) => {
        if (stopped) return;
        
        const t = (now - startTime) / duration;
        if (t >= 1) {
          brightnessRef.current = target;
          // Final update - draw only this shape, not entire layer
          const shape = shapeRef.current;
          const layer = shape?.getLayer();
          if (shape && layer) {
            layer.batchDraw();
          }
          scheduleNext();
          return;
        }
        
        // Throttle updates to reduce CPU usage
        if (now - lastUpdateTime >= THROTTLE_MS) {
          const eased = easeInOut(t);
          brightnessRef.current = start + (target - start) * eased;
          
          // Only redraw this specific shape, not the entire layer
          const shape = shapeRef.current;
          const layer = shape?.getLayer();
          if (shape && layer) {
            layer.batchDraw();
          }
          
          lastUpdateTime = now;
        }
        
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
      onFinish: () => {
        if (hoverTweenRef.current) {
          hoverTweenRef.current.destroy();
          hoverTweenRef.current = null;
        }
      },
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
      // Only trigger callback if star has an internal link (for navigation)
      if (data && isStarDataWithInternalLink(data) && onClickCallback) {
        onClickCallback();
      }
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
    // Only if initial fade is complete
    // Stars without labels never dim, so no need to restore
    const shouldDim = isConstellationFocused && focusedObject.star && !isFocused && hasLabel;
    if (shouldDim && initialFadeCompleteRef.current) {
      const group = groupRef.current;
      if (group) {
        if (opacityTweenRef.current) {
          opacityTweenRef.current.destroy();
          opacityTweenRef.current = null;
        }
        
        opacityTweenRef.current = new Konva.Tween({
          node: group,
          duration: 0.2,
          opacity: 1,
          easing: EASING,
          onFinish: () => {
            if (opacityTweenRef.current) {
              opacityTweenRef.current.destroy();
              opacityTweenRef.current = null;
            }
          },
        });
        opacityTweenRef.current.play();
      }
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
    // Only if initial fade is complete
    // Stars without labels never dim
    const shouldDim = isConstellationFocused && focusedObject.star && !isFocused && hasLabel;
    if (shouldDim && initialFadeCompleteRef.current) {
      const group = groupRef.current;
      if (group) {
        if (opacityTweenRef.current) {
          opacityTweenRef.current.destroy();
          opacityTweenRef.current = null;
        }
        
        opacityTweenRef.current = new Konva.Tween({
          node: group,
          duration: 0.2,
          opacity: 0.4,
          easing: EASING,
          onFinish: () => {
            if (opacityTweenRef.current) {
              opacityTweenRef.current.destroy();
              opacityTweenRef.current = null;
            }
          },
        });
        opacityTweenRef.current.play();
      }
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
      onFinish: () => {
        if (glowTweenRef.current) {
          glowTweenRef.current.destroy();
          glowTweenRef.current = null;
        }
      },
    });
    
    glowTweenRef.current.play();

    return () => {
      if (glowTweenRef.current) {
        glowTweenRef.current.destroy();
        glowTweenRef.current = null;
      }
    };
  }, [isFocused]);

  // 5. Focus-based dimming (only runs after initial fade completes)
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Wait for initial fade to complete before applying focus-based dimming
    if (!initialFadeCompleteRef.current) return;

    // Only dim if:
    // 1. Constellation is focused
    // 2. There IS a focused star
    // 3. This star is NOT the focused one
    // 4. This star has a label (stars without labels never dim)
    const shouldDim = isConstellationFocused && focusedObject.star && !isFocused && hasLabel;

    // Clean up previous opacity tween
    if (opacityTweenRef.current) {
      opacityTweenRef.current.destroy();
      opacityTweenRef.current = null;
    }

    // Target opacity: dimmed (0.4) if should dim, otherwise full (1)
    const targetOpacity = shouldDim ? 0.4 : 1;
    
    opacityTweenRef.current = new Konva.Tween({
      node: group,
      duration: 0.3,
      opacity: targetOpacity,
      easing: EASING,
      onFinish: () => {
        if (opacityTweenRef.current) {
          opacityTweenRef.current.destroy();
          opacityTweenRef.current = null;
        }
      },
    });
    
    opacityTweenRef.current.play();

    return () => {
      if (opacityTweenRef.current) {
        opacityTweenRef.current.destroy();
        opacityTweenRef.current = null;
      }
    };
  }, [isConstellationFocused, focusedObject.star?.slug, isFocused]);

  // 6. Label fade in/out animation
  useEffect(() => {
    const text = textRef.current;
    if (!text || !hasLabel) return;

    // Clean up previous label fade tween
    if (labelFadeTweenRef.current) {
      labelFadeTweenRef.current.destroy();
      labelFadeTweenRef.current = null;
    }

    const targetOpacity = showLabel ? 1 : 0;
    const startOpacity = labelOpacityRef.current;
    
    // Only animate if opacity needs to change
    if (startOpacity === targetOpacity) return;
    
    labelFadeTweenRef.current = new Konva.Tween({
      node: text,
      duration: DURATION.normal,
      opacity: targetOpacity,
      easing: EASING,
      onUpdate: () => {
        labelOpacityRef.current = text.opacity();
      },
      onFinish: () => {
        labelOpacityRef.current = targetOpacity;
        if (labelFadeTweenRef.current) {
          labelFadeTweenRef.current.destroy();
          labelFadeTweenRef.current = null;
        }
      },
    });
    
    labelFadeTweenRef.current.play();

    return () => {
      if (labelFadeTweenRef.current) {
        labelFadeTweenRef.current.destroy();
        labelFadeTweenRef.current = null;
      }
    };
  }, [showLabel, hasLabel]);

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
      listening={true}
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
            glowGradient.addColorStop(0, `${effectiveColor}80`); // 50% opacity at center
            glowGradient.addColorStop(0.3, `${effectiveColor}40`); // 25% opacity
            glowGradient.addColorStop(0.6, `${effectiveColor}20`); // 12% opacity
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
          gradient.addColorStop(0, effectiveColor);
          gradient.addColorStop(0.5, effectiveColor);
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // DEBUG hitbox
          if (showHitBox) {
            const labelWidth = textRef.current?.width() || 0;
            const labelHeight = textRef.current?.height() || 0;
            // Use base star size for padding (not affected by brightness/twinkle)
            const labelPadding = actualSize * 0.8;
            const labelY = actualSize + labelPadding;
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
          // Use base star size for padding (not affected by brightness/twinkle)
          const labelPadding = actualSize * 0.8;
          const labelY = actualSize + labelPadding;

          const hitRadiusX = Math.max(starRadius, labelWidth / 2);
          const hitRadiusY = starRadius + labelHeight + labelY;

          ctx.beginPath();
          ctx.rect(-hitRadiusX, -starRadius, hitRadiusX * 2, hitRadiusY);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        listening={true}
      />
      {(data?.label || labelOverride) && (() => {
        // Calculate padding proportional to base star size (not affected by brightness/twinkle)
        // This keeps the label position fixed while the star twinkles
        const labelPadding = actualSize * 0.8; // 80% of base star size as padding
        
        return (
          <Text
            ref={textRef}
            x={0}
            y={actualSize + labelPadding}
            text={labelOverride || data?.label}
            fontSize={scaledLabelSize}
            fill={SPACE_TEXT_COLOR}
            stroke={SPACE_BACKGROUND_COLOR}
            strokeWidth={0.8}
            fillAfterStrokeEnabled={true}
            fontFamily={FONT_FAMILY.style.fontFamily}
            align="center"
            offsetX={labelWidth.current / 2}
            opacity={labelOpacityRef.current}
          />
        );
      })()}
    </Group>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(MainStar, (prevProps, nextProps) => {
  // Check if data object is the same or if its properties changed
  if (prevProps.data !== nextProps.data) {
    // Deep comparison of data object properties if both exist
    if (prevProps.data && nextProps.data) {
      const dataKeys = Object.keys(nextProps.data) as Array<keyof StarData>;
      for (const key of dataKeys) {
        if (prevProps.data[key] !== nextProps.data[key]) {
          return false;
        }
      }
    } else if (prevProps.data || nextProps.data) {
      // One is defined, the other isn't
      return false;
    }
  }

  // Check all other primitive props
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.size === nextProps.size &&
    prevProps.brightness === nextProps.brightness &&
    prevProps.delay === nextProps.delay &&
    prevProps.initialOpacity === nextProps.initialOpacity &&
    prevProps.twinkleEnabled === nextProps.twinkleEnabled &&
    prevProps.twinkleMin === nextProps.twinkleMin &&
    prevProps.twinkleMax === nextProps.twinkleMax &&
    prevProps.twinkleMinDuration === nextProps.twinkleMinDuration &&
    prevProps.twinkleMaxDuration === nextProps.twinkleMaxDuration &&
    prevProps.onHoverEnterCallback === nextProps.onHoverEnterCallback &&
    prevProps.onHoverLeaveCallback === nextProps.onHoverLeaveCallback &&
    prevProps.onClickCallback === nextProps.onClickCallback &&
    prevProps.isConstellationFocused === nextProps.isConstellationFocused &&
    prevProps.labelOverride === nextProps.labelOverride &&
    prevProps.showLabel === nextProps.showLabel &&
    prevProps.labelSize === nextProps.labelSize &&
    prevProps.showHitBox === nextProps.showHitBox &&
    prevProps.cancelBubble === nextProps.cancelBubble &&
    prevProps.onHoverPointerOverride === nextProps.onHoverPointerOverride &&
    prevProps.onHoverScale === nextProps.onHoverScale &&
    prevProps.colorOverride === nextProps.colorOverride
  );
});
