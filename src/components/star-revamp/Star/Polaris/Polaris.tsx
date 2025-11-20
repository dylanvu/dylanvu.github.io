import { useEffect, useRef, useState } from "react";
import { Group, Circle } from "react-konva";
import Konva from "konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useRouter, usePathname } from "next/navigation";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { TweenConfig } from "konva/lib/Tween";

type PolarisProps = {
  x: number;
  y: number;
  size?: number;
  brightness?: number;
  twinkleMin?: number;
  twinkleMax?: number;
  focusedScreenPos?: { x: number; y: number } | null;
  focusedUnfocusedPos?: { x: number; y: number } | null;
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

  // ref to track if the tween is currently running
  const isAnimatingRef = useRef(false);

  const isActiveRef = useRef(active);
  const triggerModeRef = useRef(triggerMode);
  const durationRef = useRef(duration);
  const playPulseRef = useRef<() => void>(() => {});

  // Sync props to refs
  useEffect(() => {
    const wasTriggerMode = triggerModeRef.current;
    isActiveRef.current = active;
    triggerModeRef.current = triggerMode;

    // When switching from trigger mode to passive mode, only start passive if not animating
    if (active && !triggerMode && wasTriggerMode && !isAnimatingRef.current) {
      // Let any in-progress animation finish, then start passive loop
      playPulseRef.current();
    } else if (active && !triggerMode && !wasTriggerMode && !isAnimatingRef.current) {
      // Normal passive mode activation
      playPulseRef.current();
    }
  }, [active, triggerMode]);

  // Update duration ref without triggering re-render
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
      // Don't auto-start if we're in trigger mode and already animating
      if (triggerModeRef.current && isAnimatingRef.current) {
        return;
      }

      // Mark animation as running
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
          // Mark animation as finished
          isAnimatingRef.current = false;

          // Only auto-repeat if not in trigger mode and still active
          if (isActiveRef.current && !triggerModeRef.current) {
            playPulse();
          }
        },
      });

      tweenRef.current.play();
    };

    playPulseRef.current = playPulse;

    // Start animation based on mode
    if (triggerMode) {
      // In trigger mode, start immediately
      if (isActiveRef.current) {
        playPulse();
      }
    } else {
      // In passive mode, start after delay
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
      // Reset running state on unmount/cleanup
      isAnimatingRef.current = false;
    };
  }, [delay, maxOpacity, debug, strokeWidth]);

  // Separate effect to expose trigger function to parent
  useEffect(() => {
    if (!onMount) return;

    const triggerPulse = () => {
      console.log('[PulseRing] Trigger called, isAnimating:', isAnimatingRef.current);
      // Just start the pulse if not already running
      if (!isAnimatingRef.current && playPulseRef.current) {
        playPulseRef.current();
      }
    };

    console.log('[PulseRing] Registering trigger function');
    onMount(triggerPulse);
  }, [onMount]);

  return (
    <Circle
      ref={circleRef}
      x={0}
      y={0}
      radius={radius}
      stroke={debug ? "red" : "rgba(200, 230, 255, 0.6)"}
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
  focusedScreenPos,
  focusedUnfocusedPos,
  windowCenter,
  onHoverEnterCallback,
  onHoverLeaveCallback,
}: PolarisProps) {
  const groupRef = useRef<Konva.Group>(null);
  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const { isReady, setIsReady, setPolarisActivated, polarisActivated, isTalking, registerStreamChunkCallback } = usePolarisContext();
  
  // Track if the initial animation to bottom-left has completed
  const hasCompletedInitialAnimation = useRef(false);

  // Track multiple pulse rings for triggered mode
  const [pulseRings, setPulseRings] = useState<number[]>([]);
  const pulseIdCounter = useRef(0);

  // Register trigger that spawns new rings
  useEffect(() => {
    const triggerNewPulse = () => {
      console.log('[Polaris] Spawning new pulse ring');
      const newId = pulseIdCounter.current++;
      setPulseRings(prev => [...prev, newId]);
    };

    registerStreamChunkCallback(triggerNewPulse);
  }, [registerStreamChunkCallback]);

  // Remove completed pulse rings
  const removePulseRing = (id: number) => {
    setPulseRings(prev => prev.filter(ringId => ringId !== id));
  };

  const { width, height } = useWindowSizeContext();
  const router = useRouter();
  const pathname = usePathname();

  // --- CLICK ANIMATION CONFIGURATION ---
  // Variables to control the click interaction
  const CLICK_ANIMATION_DURATION = 1; // Time in seconds to move/scale
  const CLICK_TARGET_SCALE = 6; // How big it grows (e.g., 6x original size)

  // Calculate Bottom Right position (with some padding from edge)

  const CLICK_TARGET_X = 150; // 150px from left edge
  const CLICK_TARGET_Y = height - 150; // 150px from bottom edge

  // --- RIPPLE CONFIGURATION ---
  const DEBUG_RIPPLES = false;
  const RIPPLE_MAX_OPACITY = 0.5;
  // Use longer duration for passive pulsing, shorter for triggered
  const PASSIVE_RIPPLE_CYCLE_DURATION = 5;
  const TALKING_RIPPLE_CYCLE_DURATION = 1;

  const effectiveRadius =
    size * Math.max(brightness, twinkleMax ?? brightness) * 0.8;

  // Handle Movement and Animation Logic
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    focusTweenRef.current?.finish();

    if (isReady) {
      // Polaris is in bottom-left position, stays there
      const tweenConfig: TweenConfig = {
        node,
        duration: CLICK_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        x: CLICK_TARGET_X,
        y: CLICK_TARGET_Y,
        scaleX: CLICK_TARGET_SCALE,
        scaleY: CLICK_TARGET_SCALE,
      };
      
      // Add onFinish callback with guard to only activate once
      tweenConfig.onFinish = () => {
        if (!hasCompletedInitialAnimation.current) {
          hasCompletedInitialAnimation.current = true;
          setPolarisActivated(true);
        }
      };
      
      focusTweenRef.current = new Konva.Tween(tweenConfig);
    } else if (focusedScreenPos) {
      const focal = focusedUnfocusedPos ?? windowCenter;
      let vx = x - focal.x;
      let vy = y - focal.y;
      let vlen = Math.hypot(vx, vy);

      if (vlen < 0.00001) {
        vx = 0;
        vy = -1;
        vlen = 1;
      }

      const nx = vx / vlen;
      const ny = vy / vlen;

      const viewportDiagonal = Math.hypot(width, height);
      const offscreenDist = viewportDiagonal * 1.4;

      focusTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x: x + nx * offscreenDist,
        y: y + ny * offscreenDist,
        scaleX: 1,
        scaleY: 1,
      });
    } else {
      focusTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x,
        y,
        scaleX: 1,
        scaleY: 1,
      });
    }

    focusTweenRef.current.play();
  }, [
    isReady,
    focusedScreenPos,
    focusedUnfocusedPos,
    x,
    y,
    windowCenter,
    CLICK_TARGET_X,
    CLICK_TARGET_Y,
  ]);

  const handleClick = () => {
    if (!isReady) {
      document.body.style.cursor = "default";
      // First click: move to bottom-left position
      // polarisActivated will be set in the animation's onFinish
      setIsReady(true);
    } else {
      // Subsequent clicks: only toggle the interface
      setPolarisActivated(!polarisActivated);
    }
    
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={(e) => {
        document.body.style.cursor = "pointer";
        onHoverEnterCallback?.();
      }}
      onMouseLeave={(e) => {
        document.body.style.cursor = "default";
        onHoverLeaveCallback?.();
      }}
    >
      {/* Passive single ring when not talking and no active pulse rings */}
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

      {/* Multiple triggered rings - keep rendering until they finish */}
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
            // Remove when animation completes
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
