import { Group, Shape } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";

const BG_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

export default function BackgroundStar({
  x,
  y,
  radius = 1,
  delay = 0,
  parallaxDuration,
  focusedConstellationPos,
  enableFocusMovement = false,
}: {
  x: number;
  y: number;
  radius?: number;
  delay?: number;
  parallaxDuration?: number;
  focusedConstellationPos: FocusedConstellationPos | null;
  enableFocusMovement?: boolean;
}) {
  // node refs
  const groupRef = useRef<Konva.Group | null>(null);
  const starRef = useRef<Konva.Shape | null>(null);

  // tween refs for cleanup
  const moveTweenRef = useRef<Konva.Tween | null>(null);
  const fadeInTweenRef = useRef<Konva.Tween | null>(null);

  // stable initial position
  const initialX = useRef(x);
  const initialY = useRef(y);

  const color = useRef(
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)]
  ).current;

  const { windowCenter } = useWindowSizeContext();

  // 1. Fade in the star on mount
  useEffect(() => {
    if (!starRef.current) return;
    fadeInTweenRef.current?.finish();

    const fadeTimeout = setTimeout(() => {
      fadeInTweenRef.current = new Konva.Tween({
        node: starRef.current!,
        duration: 0.45,
        opacity: 1,
        easing: Konva.Easings.Linear,
      });
      fadeInTweenRef.current.play();
    }, delay);

    return () => {
      fadeInTweenRef.current?.finish();
      clearTimeout(fadeTimeout);
    };
  }, [delay]);

  // 2. Handle Movement and Focus (Parallax)
  useEffect(() => {
    if (!enableFocusMovement) return;
    const group = groupRef.current;
    if (!group) return;

    // Stop any active movement
    moveTweenRef.current?.finish();

    // --- RESET STATE (No Focus) ---
    if (!focusedConstellationPos) {
      moveTweenRef.current = new Konva.Tween({
        node: group,
        duration: 0.6, // Slightly slower return feels more "massive"
        easing: Konva.Easings.EaseInOut,
        x: initialX.current,
        y: initialY.current,
        scaleX: 1,
        scaleY: 1,
      });
      moveTweenRef.current.play();
      return;
    }

    // --- FOCUSED CONSTELLATION PARALLAX ---
    const cPos = focusedConstellationPos;
    const constellation = cPos.constellation;

    // Calculate distance from the clicked item's *original* position
    let dx = initialX.current - cPos.unfocusedX;
    let dy = initialY.current - cPos.unfocusedY;

    // Apply Depth: Smaller stars move less (appear further away), larger stars move more.
    // You can tweak '4' and '0.8' to change the intensity of the 3D effect.
    const depth = 1 - Math.min(radius / 4, 0.8);
    dx *= depth;
    dy *= depth;

    // Apply Scaling based on the Constellation's zoom level
    const scaleFactor =
      (constellation.scale ?? 1) * (constellation.focusScale ?? 1);
    dx *= scaleFactor;
    dy *= scaleFactor;

    // Apply Rotation logic to match the constellation's rotation
    const originalRotation = constellation.rotation ?? 0;
    const rotationRad = -originalRotation * (Math.PI / 180);
    const cosTheta = Math.cos(rotationRad);
    const sinTheta = Math.sin(rotationRad);

    const rotatedDx = dx * cosTheta - dy * sinTheta;
    const rotatedDy = dx * sinTheta + dy * cosTheta;

    // The star's final position is relative to the Window Center
    // (because the focused constellation is moved to Window Center)
    const finalX = windowCenter.x + rotatedDx;
    const finalY = windowCenter.y + rotatedDy;

    const duration = parallaxDuration ?? 0.8;

    // Move Star Group
    moveTweenRef.current = new Konva.Tween({
      node: group,
      duration: duration,
      easing: Konva.Easings.EaseInOut,
      x: finalX,
      y: finalY,
      // Optional: Scale stars slightly up/down based on depth if you want a 'zoom' feel
      // scaleX: 1,
      // scaleY: 1,
    });
    moveTweenRef.current.play();

    return () => {
      moveTweenRef.current?.finish();
    };
  }, [
    focusedConstellationPos,
    radius,
    windowCenter,
    parallaxDuration,
    enableFocusMovement,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      moveTweenRef.current?.finish();
      fadeInTweenRef.current?.finish();
    };
  }, []);

  return (
    <Group
      ref={groupRef}
      x={initialX.current}
      y={initialY.current}
      listening={false}
    >
      {/* Star Shape */}
      <Shape
        ref={starRef}
        x={0}
        y={0}
        opacity={0} // Starts invisible, handled by fade-in effect
        listening={false}
        sceneFunc={(ctx) => {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, "rgba(255,255,255,0.2)");
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
        }}
      />
    </Group>
  );
}
