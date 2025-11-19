import { useEffect, useRef, useState } from "react";
import { Group, Circle } from "react-konva";
import Konva from "konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useRouter, usePathname } from "next/navigation";

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
  duration = 3,
  maxOpacity = 0.4,
  debug = false,
  strokeWidth = 2,
}: {
  radius: number;
  delay: number; // in seconds
  duration?: number;
  maxOpacity?: number;
  debug?: boolean;
  strokeWidth?: number;
}) => {
  const circleRef = useRef<Konva.Circle>(null);
  const tweenRef = useRef<Konva.Tween | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const node = circleRef.current;
    if (!node) return;

    // 1. Initialize state
    node.scaleX(1);
    node.scaleY(1);
    node.opacity(0); // Start invisible
    node.strokeWidth(debug ? strokeWidth * 2 : strokeWidth);

    const playPulse = () => {
      // Reset state for the new loop
      node.scaleX(1);
      node.scaleY(1);
      node.opacity(maxOpacity); // Jump to max opacity
      node.strokeWidth(debug ? strokeWidth * 2 : strokeWidth);

      tweenRef.current = new Konva.Tween({
        node,
        duration: duration,
        scaleX: 2.5,
        scaleY: 2.5,
        opacity: 0, // Fade out completely
        strokeWidth: 0, // Thin out stroke
        easing: Konva.Easings.EaseOut,
        onFinish: () => {
          playPulse(); // Loop immediately without gap
        },
      });

      tweenRef.current.play();
    };

    // Initial delay before the first loop starts
    timerRef.current = setTimeout(() => {
      playPulse();
    }, delay * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      tweenRef.current?.destroy();
    };
  }, [delay, duration, maxOpacity, debug, strokeWidth]);

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
  const [isExpanded, setIsExpanded] = useState(false);

  const { width, height } = useWindowSizeContext();
  const router = useRouter();
  const pathname = usePathname();

  // --- CLICK ANIMATION CONFIGURATION ---
  // Variables to control the click interaction
  const CLICK_ANIMATION_DURATION = 1.5; // Time in seconds to move/scale
  const CLICK_TARGET_SCALE = 6; // How big it grows (e.g., 6x original size)

  // Calculate Bottom Right position (with some padding from edge)

  const CLICK_TARGET_X = width - 150; // 150px from right edge
  const CLICK_TARGET_Y = height - 150; // 150px from bottom edge

  // --- RIPPLE CONFIGURATION ---
  const DEBUG_RIPPLES = false;
  const RIPPLE_MAX_OPACITY = 0.5;
  const RIPPLE_CYCLE_DURATION = 5;

  const effectiveRadius =
    size * Math.max(brightness, twinkleMax ?? brightness) * 0.8;

  // Handle Movement and Animation Logic
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    // Stop any previous tween to prevent conflicts
    focusTweenRef.current?.finish();

    if (isExpanded) {
      // 1. STATE: User Clicked - Grow and Move to Bottom Right
      focusTweenRef.current = new Konva.Tween({
        node,
        duration: CLICK_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        x: CLICK_TARGET_X,
        y: CLICK_TARGET_Y,
        scaleX: CLICK_TARGET_SCALE,
        scaleY: CLICK_TARGET_SCALE,
      });
    } else if (focusedScreenPos) {
      // 2. STATE: Parallax/Focus active (fly away from center)
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
        scaleX: 1, // Ensure scale is reset if coming back from click
        scaleY: 1,
      });
    } else {
      // 3. STATE: Idle / Default Position
      focusTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x,
        y,
        scaleX: 1, // Ensure scale is reset
        scaleY: 1,
      });
    }

    focusTweenRef.current.play();
  }, [
    isExpanded, // Dependency added here
    focusedScreenPos,
    focusedUnfocusedPos,
    x,
    y,
    windowCenter,
    CLICK_TARGET_X,
    CLICK_TARGET_Y,
  ]);

  const handleClick = () => {
    setIsExpanded(true); // Toggle state (or set to true if you only want one-way)
    // need to fix this interaction later, where polaris needs to just toggle the chat menu (aka go to the)
    if (pathname === "/") {
      router.push("/polaris");
    } else {
      router.push("/");
    }
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      onClick={handleClick}
      onTap={handleClick} // For touch devices
      // Change cursor to indicate interactivity
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "pointer";
        onHoverEnterCallback?.();
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
        onHoverLeaveCallback?.();
      }}
    >
      {/* Rendered first so they appear BEHIND the star */}
      <PulseRing
        radius={effectiveRadius}
        delay={2}
        duration={RIPPLE_CYCLE_DURATION}
        maxOpacity={RIPPLE_MAX_OPACITY}
        debug={DEBUG_RIPPLES}
      />

      <MainStar
        x={0}
        y={0}
        size={size}
        brightness={brightness}
        twinkleMin={twinkleMin}
        twinkleMax={twinkleMax}
        // Callbacks handled by Group now to include rings in hover area
        // but kept here if specific logic is needed inside MainStar
        onHoverEnterCallback={onHoverEnterCallback}
        onHoverLeaveCallback={onHoverLeaveCallback}
        onHoverPointerOverride={true}
      />
    </Group>
  );
}
