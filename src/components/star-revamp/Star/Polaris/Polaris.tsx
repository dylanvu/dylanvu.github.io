import { useEffect, useRef, useState, useMemo } from "react";
import { Group, Circle } from "react-konva";
import Konva from "konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import { POLARIS_GLOW_COLOR, POLARIS_ERROR_COLOR, POLARIS_THINKING_COLOR, POLARIS_TALKING_COLOR, POLARIS_IDLE_COLOR, DURATION } from "@/app/theme";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useMobile } from "@/hooks/useMobile";
import { useParallaxCamera } from "../Constellation/useParallaxCamera";

// Color interpolation helpers
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace("#", "");
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const interpolateColor = (color1: string, color2: string, progress: number): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const r = rgb1.r + (rgb2.r - rgb1.r) * progress;
  const g = rgb1.g + (rgb2.g - rgb1.g) * progress;
  const b = rgb1.b + (rgb2.b - rgb1.b) * progress;
  
  return rgbToHex(r, g, b);
};

type PolarisProps = {
  x: number;
  y: number;
  size?: number;
  brightness?: number;
  twinkleMin?: number;
  twinkleMax?: number;
  windowCenter: { x: number; y: number };
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
};

// --- Sub-component for a single expanding ring (Unchanged) ---
const PulseRing = ({
  radius,
  delay,
  duration = 5,
  maxOpacity = 0.4,
  debug = false,
  strokeWidth = 2,
  active = true,
  triggerMode = false,
  onMount,
}: {
  radius: number;
  delay: number;
  duration?: number;
  maxOpacity?: number;
  debug?: boolean;
  strokeWidth?: number;
  active?: boolean;
  triggerMode?: boolean;
  onMount?: (triggerPulse: () => void) => void;
}) => {
  const circleRef = useRef<Konva.Circle>(null);
  const tweenRef = useRef<Konva.Tween | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const isActiveRef = useRef(active);
  const triggerModeRef = useRef(triggerMode);
  const durationRef = useRef(duration);
  const playPulseRef = useRef<() => void>(() => {});

  useEffect(() => {
    isActiveRef.current = active;
    triggerModeRef.current = triggerMode;
    if (active && !triggerMode && !isAnimatingRef.current) {
       playPulseRef.current();
    }
  }, [active, triggerMode]);

  useEffect(() => { durationRef.current = duration; }, [duration]);

  useEffect(() => {
    const node = circleRef.current;
    if (!node) return;
    node.scaleX(1); node.scaleY(1); node.opacity(0);
    node.strokeWidth(debug ? strokeWidth * 2 : strokeWidth);

    const playPulse = () => {
      if (triggerModeRef.current && isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      node.scaleX(1); node.scaleY(1); node.opacity(maxOpacity);
      node.strokeWidth(debug ? strokeWidth * 2 : strokeWidth);

      tweenRef.current = new Konva.Tween({
        node, duration: durationRef.current, scaleX: 2.5, scaleY: 2.5, opacity: 0, strokeWidth: 0, easing: Konva.Easings.EaseOut,
        onFinish: () => {
          isAnimatingRef.current = false;
          tweenRef.current = null;
          if (isActiveRef.current && !triggerModeRef.current) playPulse();
        },
      });
      tweenRef.current.play();
    };
    playPulseRef.current = playPulse;
    
    if (triggerMode) {
      if (isActiveRef.current) playPulse();
    } else {
      timerRef.current = setTimeout(() => { if (isActiveRef.current) playPulse(); }, delay * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (tweenRef.current) { tweenRef.current.destroy(); tweenRef.current = null; }
      isAnimatingRef.current = false;
    };
  }, [delay, maxOpacity, debug, strokeWidth]);

  useEffect(() => {
    if (onMount) onMount(() => { if (!isAnimatingRef.current) playPulseRef.current(); });
  }, [onMount]);

  return <Circle ref={circleRef} x={0} y={0} radius={radius} stroke={debug ? "red" : POLARIS_GLOW_COLOR} listening={false} />;
};

export default function Polaris({
  x,
  y,
  size = 5,
  brightness = 5,
  twinkleMin = 4.9,
  twinkleMax = 5.1,
  windowCenter,
  onHoverEnterCallback,
  onHoverLeaveCallback,
}: PolarisProps) {
  const groupRef = useRef<Konva.Group>(null);
  
  // Contexts
  const { isReady, setIsReady, polarisDisplayState, setPolarisDisplayState, isThinking, isTalking, hasError, registerStreamChunkCallback } = usePolarisContext();
  const { focusedObject, parallaxFocusData } = useFocusContext();
  const { mobileScaleFactor } = useMobile();
  const { height } = useWindowSizeContext();
  
  // Track one-time activation - callback should only fire once
  const hasActivatedRef = useRef(false);
  
  // Color state management
  const [currentColor, setCurrentColor] = useState(POLARIS_IDLE_COLOR);
  const animationRef = useRef<number | null>(null);
  const startColorRef = useRef(POLARIS_IDLE_COLOR);
  const startTimeRef = useRef<number | null>(null);
  
  // Determine target color based on state priority: error > thinking > talking > idle
  const targetColor = hasError
    ? POLARIS_ERROR_COLOR
    : isThinking 
    ? POLARIS_THINKING_COLOR 
    : isTalking 
    ? POLARIS_TALKING_COLOR 
    : POLARIS_IDLE_COLOR;
  
  // Animate color transitions smoothly
  useEffect(() => {
    if (currentColor === targetColor) return;
    
    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Set up new animation
    startColorRef.current = currentColor;
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const duration = DURATION.normal * 1000; // Convert to milliseconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const interpolatedColor = interpolateColor(
        startColorRef.current,
        targetColor,
        easedProgress
      );
      
      setCurrentColor(interpolatedColor);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetColor, currentColor]);

  useEffect(() => {
    if (isReady && groupRef.current) {
      groupRef.current.moveToTop();
    }
  }, [isReady, focusedObject.star])
  
  // Pulse State
  const [pulseRings, setPulseRings] = useState<number[]>([]);
  const pulseIdCounter = useRef(0);

  useEffect(() => {
    registerStreamChunkCallback(() => setPulseRings(prev => [...prev, pulseIdCounter.current++]));
  }, [registerStreamChunkCallback]);

  const removePulseRing = (id: number) => {
    setPulseRings(prev => prev.filter(ringId => ringId !== id));
  };

  // --- ANIMATION CONFIG ---
  const CLICK_TARGET_SCALE = 4 * mobileScaleFactor; 
  const CLICK_TARGET_X = 150 * mobileScaleFactor; 
  const CLICK_TARGET_Y = height - (150 * mobileScaleFactor); 
  
  // We match your original code: 1s for clicking Polaris, 0.5s for parallax movements
  const ANIMATION_DURATION = isReady ? 1.0 : 0.5;

  const DEBUG_RIPPLES = false;
  const RIPPLE_MAX_OPACITY = 0.5;
  const PASSIVE_RIPPLE_CYCLE_DURATION = 5;
  const TALKING_RIPPLE_CYCLE_DURATION = 1;

  const effectiveRadius = size * Math.max(brightness, twinkleMax ?? brightness) * 0.8;

  // --- PARALLAX DATA ---
  // Only calculate this if we are NOT active. 
  // If isReady=true, this input is ignored by the hook anyway, but this optimization helps.
  const parallaxInputData = useMemo(() => {
    if (isReady || !parallaxFocusData || !focusedObject?.constellation) return null;
    return {
        worldX: parallaxFocusData.unfocusedX,
        worldY: parallaxFocusData.unfocusedY,
        worldZoom: focusedObject.constellation.focusScale ?? 1,
        targetRotation: focusedObject.constellation.rotation ?? 0
    };
  }, [parallaxFocusData, focusedObject, isReady]);

  // --- THE UNIFIED HOOK ---
  useParallaxCamera({
    nodeRef: groupRef,
    identityId: "Polaris",
    unfocusedX: x,
    unfocusedY: y,
    baseScale: 1,
    baseRotation: 0,
    
    // ACTIVE STATE CONFIG (Matches your original manual tween)
    focusScale: CLICK_TARGET_SCALE,
    windowCenter,
    focusedTargetX: CLICK_TARGET_X,
    focusedTargetY: CLICK_TARGET_Y,
    isFocused: isReady, // "Ready" = "Focused" for the physics engine
    
    // PARALLAX STATE CONFIG (Ignored if isReady is true)
    parallaxData: parallaxInputData,
    
    // CONFIG
    depth: 6.0, // High depth for foreground feel
    duration: ANIMATION_DURATION, // Dynamic duration based on mode
    
    // Callback when focus animation completes - only fires once when isReady becomes true
    onFocusComplete: (!hasActivatedRef.current && isReady) ? () => {
      hasActivatedRef.current = true;
      setPolarisDisplayState("active");
    } : undefined
  });

  // --- CLICK HANDLER (Unchanged) ---
  const handleClick = () => {
    if (!isReady) {
      document.body.style.cursor = "default";
      setIsReady(true);
    } else if (polarisDisplayState === "suppressed") {
      setPolarisDisplayState("active");
    } else {
      setPolarisDisplayState(prev => 
        prev === "active" ? "hidden" : "active"
      );
    }
  };

  return (
    <Group
      ref={groupRef}
      // Static props; Hook handles x/y/scale
      x={0}
      y={0}
      
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={() => {
        document.body.style.cursor = "pointer";
        onHoverEnterCallback?.();
      }}
      onMouseLeave={() => {
        document.body.style.cursor = "default";
        onHoverLeaveCallback?.();
      }}
    >
      {!isTalking && pulseRings.length === 0 && (
        <PulseRing
          radius={effectiveRadius}
          delay={2}
          duration={PASSIVE_RIPPLE_CYCLE_DURATION}
          maxOpacity={RIPPLE_MAX_OPACITY}
          debug={DEBUG_RIPPLES}
          active={!isReady}
          triggerMode={false}
          onMount={() => {}}
        />
      )}

      {pulseRings.map(id => (
        <PulseRing
          key={id}
          radius={effectiveRadius}
          delay={0}
          duration={TALKING_RIPPLE_CYCLE_DURATION}
          maxOpacity={RIPPLE_MAX_OPACITY}
          debug={DEBUG_RIPPLES}
          active={true}
          triggerMode={true}
          onMount={() => {
            setTimeout(() => removePulseRing(id), TALKING_RIPPLE_CYCLE_DURATION * 1000);
          }}
        />
      ))}

      <MainStar
        x={0}
        y={0}
        size={size}
        brightness={brightness}
        twinkleMin={twinkleMin}
        twinkleMax={twinkleMax}
        onHoverEnterCallback={onHoverEnterCallback}
        onHoverLeaveCallback={onHoverLeaveCallback}
        onHoverPointerOverride={true}
        colorOverride={currentColor}
      />
    </Group>
  );
}
