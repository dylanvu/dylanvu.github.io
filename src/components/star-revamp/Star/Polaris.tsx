import { useEffect, useRef } from "react";
import { Group } from "react-konva";
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

  // Handle parallax movement
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    focusTweenRef.current?.finish();

    if (focusedScreenPos) {
      // A constellation is focused - move Polaris away from the focal point
      const focal = focusedUnfocusedPos ?? windowCenter;
      
      // Calculate direction vector from focal point to Polaris's original position
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

      // Calculate offscreen distance
      const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
      const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
      const viewportDiagonal = Math.hypot(vw, vh);
      const offscreenDist = viewportDiagonal * 1.4;

      // Animate to offscreen position
      focusTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
        x: x + nx * offscreenDist,
        y: y + ny * offscreenDist,
      });
    } else {
      // No constellation focused - return to original position
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
      <MainStar
        x={0}
        y={0}
        size={size}
        brightness={brightness}
        twinkleMin={twinkleMin}
        twinkleMax={twinkleMax}
        windowCenter={windowCenter}
        onHoverEnterCallback={onHoverEnterCallback}
        onHoverLeaveCallback={onHoverLeaveCallback}
      />
    </Group>
  );
}
