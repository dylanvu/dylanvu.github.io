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

  // tween refs
  const tweenRef = useRef<Konva.Tween | null>(null);
  const fadeInTweenRef = useRef<Konva.Tween | null>(null);

  // stable initial data
  const initialX = useRef(x);
  const initialY = useRef(y);
  const color = useRef(
    BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)]
  ).current;

  const { windowCenter } = useWindowSizeContext();

  // 1. Fade in on mount
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

  // 2. Handle "World Rotation" and Parallax
  useEffect(() => {
    if (!enableFocusMovement) return;
    const group = groupRef.current;
    const star = starRef.current;
    if (!group || !star) return;

    tweenRef.current?.finish();

    // Calculate relative position from the Window Center to the Star's original position
    const relX = initialX.current - windowCenter.x;
    const relY = initialY.current - windowCenter.y;

    // --- KEY FIX: Anchor Group to Center ---
    // We move the Group to the center of the screen.
    // We move the Star Shape to the relative offset.
    // This allows us to rotate the *Group* to create a perfect arc/orbit.
    group.x(windowCenter.x);
    group.y(windowCenter.y);

    // NOTE: We don't want the star to jump when this runs.
    // Since we only run this effect when focus changes, we set the initial state
    // of the star relative to the group here, then tween to the new state.

    // --- NO FOCUS (RESET) ---
    if (!focusedConstellationPos) {
      // We want to return to: Rotation 0, Scale 1, Original Offset

      // Note: If we were previously rotated, the star is currently visually somewhere else.
      // We rely on Konva to tween from "Current visual state" to "Target state".

      tweenRef.current = new Konva.Tween({
        node: group,
        duration: 0.8,
        easing: Konva.Easings.EaseInOut,
        rotation: 0, // Rotate back to upright
        scaleX: 1,
        scaleY: 1,
      });

      // We also ensure the star shape is at the correct relative offset
      // (It might have drifted if we added translation parallax, so we reset it here)
      new Konva.Tween({
        node: star,
        duration: 0.8,
        easing: Konva.Easings.EaseInOut,
        x: relX,
        y: relY,
      }).play();

      tweenRef.current.play();
      return;
    }

    // --- FOCUSED STATE ---
    const cPos = focusedConstellationPos;
    const constellation = cPos.constellation;

    // 1. Rotation
    // If the constellation rotates +200deg, the "world" (background)
    // needs to rotate -200deg to mimic the camera spinning.
    const targetRotation = -(constellation.rotation ?? 0);

    // 2. Zoom & Depth
    // Calculate depth: 0.8 = closer/bigger, 0.2 = further/smaller
    const depth = Math.min((radius / 4) * 0.6 + 0.1, 0.8);
    const focusScale = constellation.focusScale;

    // The world scales up, but based on depth
    const effectiveScale = 1 + (focusScale - 1) * depth;

    // 3. Parallax Translation (The "Slide")
    // The constellation moved from `cPos.unfocusedX` to `windowCenter`.
    // The background should slide slightly in that direction to create depth.
    const slideX = (windowCenter.x - cPos.unfocusedX) * depth;
    const slideY = (windowCenter.y - cPos.unfocusedY) * depth;

    // Important: Because the Group is rotating, if we translate the star's X/Y
    // inside the group, that translation will rotate with it.
    // To keep the "Slide" aligned with the screen (and not the rotation),
    // we have to counter-rotate the translation vector?
    // Actually, simpler visual trick: Just add the slide to the "radius" offset
    // before rotation logic takes over in the viewer's brain.
    // It feels more natural if the star simply spirals out to a new position.

    const targetStarX = relX + slideX;
    const targetStarY = relY + slideY;

    const duration = parallaxDuration ?? 0.6;

    // Tween the GROUP for Rotation and Scale (The "Camera" Move)
    tweenRef.current = new Konva.Tween({
      node: group,
      duration: duration,
      easing: Konva.Easings.EaseInOut,
      rotation: targetRotation,
      scaleX: effectiveScale,
      scaleY: effectiveScale,
    });
    tweenRef.current.play();

    // Tween the STAR SHAPE for position (The "Slide" + initial offset)
    // This handles placing the star correctly within the rotating frame.
    const starTween = new Konva.Tween({
      node: star,
      duration: duration,
      easing: Konva.Easings.EaseInOut,
      x: targetStarX,
      y: targetStarY,
    });
    starTween.play();

    return () => {
      tweenRef.current?.finish();
      starTween.finish();
    };
  }, [
    focusedConstellationPos,
    radius,
    windowCenter,
    parallaxDuration,
    enableFocusMovement,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      tweenRef.current?.finish();
      fadeInTweenRef.current?.finish();
    };
  }, []);

  // Initial Render State:
  // Group at Center. Star at Offset.
  // This ensures that before any tweening happens, the star appears at (x,y).
  return (
    <Group
      ref={groupRef}
      x={windowCenter.x}
      y={windowCenter.y}
      listening={false}
    >
      <Shape
        ref={starRef}
        // We position the shape relative to the center immediately
        x={initialX.current - windowCenter.x}
        y={initialY.current - windowCenter.y}
        opacity={0}
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
