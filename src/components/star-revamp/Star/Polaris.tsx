import { useEffect, useRef } from "react";
import { Group, Circle } from "react-konva";
import Konva from "konva";
import MainStar from "./MainStar";

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
  }, [delay, duration, maxOpacity, debug]);

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

  // --- CONFIGURATION ---
  const DEBUG_RIPPLES = false; // Set to true to see Red Rings
  const RIPPLE_MAX_OPACITY = 0.5;

  // FREQUENCY CONTROL:
  // This controls how long it takes for one ring to finish.
  // Lower number = Faster pulses (Higher frequency)
  // Higher number = Slower pulses (Lower frequency)
  const RIPPLE_CYCLE_DURATION = 5;

  const effectiveRadius =
    size * Math.max(brightness, twinkleMax ?? brightness) * 0.8;

  // Handle parallax movement
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    focusTweenRef.current?.finish();

    if (focusedScreenPos) {
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

      const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
      const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
      const viewportDiagonal = Math.hypot(vw, vh);
      const offscreenDist = viewportDiagonal * 1.4;

      focusTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x: x + nx * offscreenDist,
        y: y + ny * offscreenDist,
      });
    } else {
      focusTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x,
        y,
      });
    }

    focusTweenRef.current.play();
  }, [focusedScreenPos, focusedUnfocusedPos, x, y, windowCenter]);

  return (
    <Group ref={groupRef} x={x} y={y}>
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
        onHoverEnterCallback={onHoverEnterCallback}
        onHoverLeaveCallback={onHoverLeaveCallback}
      />
    </Group>
  );
}
