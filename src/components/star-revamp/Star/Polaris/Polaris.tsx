import { useEffect, useRef, useState } from "react";
import { Group, Circle } from "react-konva";
import Konva from "konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import { POLARIS_GLOW_COLOR } from "@/app/theme";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useMobile } from "@/hooks/useMobile";
import { TweenConfig } from "konva/lib/Tween";

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

// --- Sub-component for a single expanding ring ---
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
    const wasTriggerMode = triggerModeRef.current;
    isActiveRef.current = active;
    triggerModeRef.current = triggerMode;

    if (active && !triggerMode && wasTriggerMode && !isAnimatingRef.current) {
      playPulseRef.current();
    } else if (active && !triggerMode && !wasTriggerMode && !isAnimatingRef.current) {
      playPulseRef.current();
    }
  }, [active, triggerMode]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    const node = circleRef.current;
    if (!node) return;

    node.scaleX(1);
    node.scaleY(1);
    node.opacity(0);
    node.strokeWidth(debug ? strokeWidth * 2 : strokeWidth);

    const playPulse = () => {
      if (triggerModeRef.current && isAnimatingRef.current) {
        return;
      }

      isAnimatingRef.current = true;

      node.scaleX(1);
      node.scaleY(1);
      node.opacity(maxOpacity);
      node.strokeWidth(debug ? strokeWidth * 2 : strokeWidth);

      tweenRef.current = new Konva.Tween({
        node,
        duration: durationRef.current,
        scaleX: 2.5,
        scaleY: 2.5,
        opacity: 0,
        strokeWidth: 0,
        easing: Konva.Easings.EaseOut,
        onFinish: () => {
          isAnimatingRef.current = false;
          if (tweenRef.current) {
            tweenRef.current.destroy();
            tweenRef.current = null;
          }
          if (isActiveRef.current && !triggerModeRef.current) {
            playPulse();
          }
        },
      });

      tweenRef.current.play();
    };

    playPulseRef.current = playPulse;

    if (triggerMode) {
      if (isActiveRef.current) {
        playPulse();
      }
    } else {
      timerRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          playPulse();
        }
      }, delay * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (tweenRef.current) {
        tweenRef.current.destroy();
        tweenRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [delay, maxOpacity, debug, strokeWidth]);

  useEffect(() => {
    if (!onMount) return;
    const triggerPulse = () => {
      if (!isAnimatingRef.current && playPulseRef.current) {
        playPulseRef.current();
      }
    };
    onMount(triggerPulse);
  }, [onMount]);

  return (
    <Circle
      ref={circleRef}
      x={0}
      y={0}
      radius={radius}
      stroke={debug ? "red" : POLARIS_GLOW_COLOR}
      listening={false}
    />
  );
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
  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const { isReady, setIsReady, polarisDisplayState, setPolarisDisplayState, isTalking, registerStreamChunkCallback } = usePolarisContext();
  const { focusedObject, parallaxFocusData } = useFocusContext();
  const { mobileScaleFactor } = useMobile();
  
  const hasCompletedInitialAnimation = useRef(false);
  // Ref to store position during parallax so we can restore it before returning
  const lastParallaxState = useRef<{x: number, y: number, scale: number, rotation: number} | null>(null);
  
  const [pulseRings, setPulseRings] = useState<number[]>([]);
  const pulseIdCounter = useRef(0);

  useEffect(() => {
    const triggerNewPulse = () => {
      const newId = pulseIdCounter.current++;
      setPulseRings(prev => [...prev, newId]);
    };

    registerStreamChunkCallback(triggerNewPulse);
  }, [registerStreamChunkCallback]);

  const removePulseRing = (id: number) => {
    setPulseRings(prev => prev.filter(ringId => ringId !== id));
  };

  const { width, height } = useWindowSizeContext();

  // Animation Constants
  const CLICK_ANIMATION_DURATION = 1; 
  const CLICK_TARGET_SCALE = 4 * mobileScaleFactor; 
  const CLICK_TARGET_X = 150 * mobileScaleFactor; 
  const CLICK_TARGET_Y = height - (150 * mobileScaleFactor); 

  const PARALLAX_ANIMATION_DURATION = 0.5;
  const PARALLAX_EASING = Konva.Easings.EaseInOut;

  // Ripple Config
  const DEBUG_RIPPLES = false;
  const RIPPLE_MAX_OPACITY = 0.5;
  const PASSIVE_RIPPLE_CYCLE_DURATION = 5;
  const TALKING_RIPPLE_CYCLE_DURATION = 1;

  const effectiveRadius = size * Math.max(brightness, twinkleMax ?? brightness) * 0.8;

  // Refs for stability
  const xRef = useRef(x);
  const yRef = useRef(y);
  const windowCenterRef = useRef(windowCenter);
  const parallaxFocusDataRef = useRef(parallaxFocusData);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const clickTargetXRef = useRef(CLICK_TARGET_X);
  const clickTargetYRef = useRef(CLICK_TARGET_Y);

  useEffect(() => {
    xRef.current = x;
    yRef.current = y;
    windowCenterRef.current = windowCenter;
    parallaxFocusDataRef.current = parallaxFocusData;
    widthRef.current = width;
    heightRef.current = height;
    clickTargetXRef.current = CLICK_TARGET_X;
    clickTargetYRef.current = CLICK_TARGET_Y;
  });

  // Handle Movement and Animation Logic
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    // We can't use finish() blindly here because it might snap us to the wrong place
    if (focusTweenRef.current) {
        focusTweenRef.current.destroy();
        focusTweenRef.current = null;
    }

    // --- CASE 1: POLARIS IS ACTIVE (Assistant Mode) ---
    if (isReady) {
      node.visible(true);
      node.opacity(1);

      const tweenConfig: TweenConfig = {
        node,
        duration: CLICK_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        x: clickTargetXRef.current,
        y: clickTargetYRef.current,
        scaleX: CLICK_TARGET_SCALE,
        scaleY: CLICK_TARGET_SCALE,
        rotation: 0,
      };
      
      tweenConfig.onFinish = () => {
        if (!hasCompletedInitialAnimation.current) {
          hasCompletedInitialAnimation.current = true;
          setPolarisDisplayState("active");
        }
        if (focusTweenRef.current) {
          focusTweenRef.current.destroy();
          focusTweenRef.current = null;
        }
      };
      
      focusTweenRef.current = new Konva.Tween(tweenConfig);
      focusTweenRef.current.play();
    } 
    // --- CASE 2: PARALLAX MODE (Another constellation is focused) ---
    else if (focusedObject.constellation) {
      
      // RACE CONDITION GUARD: Wait for data
      if (!parallaxFocusDataRef.current) return;

      const { unfocusedX: focusedUnfocusedX, unfocusedY: focusedUnfocusedY } = parallaxFocusDataRef.current;
      
      const worldZoom = focusedObject.constellation.focusScale ?? 1;
      const depth = 3.5; 

      const vecX = xRef.current - focusedUnfocusedX;
      const vecY = yRef.current - focusedUnfocusedY;

      const expansionFactor = 1 + (worldZoom - 1) * depth;
      const movementMultiplier = expansionFactor; 

      const expandedX = windowCenterRef.current.x + (vecX * movementMultiplier);
      const expandedY = windowCenterRef.current.y + (vecY * movementMultiplier);

      const focusedRotation = focusedObject.constellation.rotation ?? 0;
      const angleRad = (-focusedRotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const vX = expandedX - windowCenterRef.current.x;
      const vY = expandedY - windowCenterRef.current.y;

      const rotatedX = windowCenterRef.current.x + (vX * cos - vY * sin);
      const rotatedY = windowCenterRef.current.y + (vX * sin + vY * cos);

      focusTweenRef.current = new Konva.Tween({
        node,
        duration: PARALLAX_ANIMATION_DURATION,
        easing: PARALLAX_EASING,
        x: rotatedX,
        y: rotatedY,
        scaleX: expansionFactor, 
        scaleY: expansionFactor,
        rotation: -focusedRotation, 
        opacity: 0, 
        // Capture position every frame so we know where we are when we return
        onUpdate: () => {
            lastParallaxState.current = {
                x: node.x(),
                y: node.y(),
                scale: node.scaleX(),
                rotation: node.rotation()
            };
        },
        onFinish: () => {
          node.visible(false); 
          if (focusTweenRef.current) {
            focusTweenRef.current.destroy();
            focusTweenRef.current = null;
          }
        },
      });
      
      node.visible(true);
      focusTweenRef.current.play();
    } 
    // --- CASE 3: IDLE / RETURN MODE ---
    else {
      // FIX: React may have snapped properties back to props (x/y).
      // If we were previously in parallax, force restore the visual state 
      // before tweening back.
      if (lastParallaxState.current) {
          node.x(lastParallaxState.current.x);
          node.y(lastParallaxState.current.y);
          node.scaleX(lastParallaxState.current.scale);
          node.scaleY(lastParallaxState.current.scale);
          node.rotation(lastParallaxState.current.rotation);
          
          // Since parallax fades to 0, start from 0
          node.opacity(0);
          
          // Clear it
          lastParallaxState.current = null;
      }

      node.visible(true);

      focusTweenRef.current = new Konva.Tween({
        node,
        duration: PARALLAX_ANIMATION_DURATION,
        easing: PARALLAX_EASING,
        x: xRef.current,
        y: yRef.current,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1, 
        onFinish: () => {
          if (focusTweenRef.current) {
            focusTweenRef.current.destroy();
            focusTweenRef.current = null;
          }
        },
      });
      focusTweenRef.current.play();
    }
  }, [isReady, focusedObject.constellation, parallaxFocusData]);

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
      x={x}
      y={y}
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
      />
    </Group>
  );
}