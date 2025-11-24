import { Group } from "react-konva";
import { useMemo } from "react";
import ParallaxLayer from "@/components/star-revamp/Star/Background/ParallaxLayer";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";

export default function StarField({
  width,
  height,
  focusedConstellationPos,
}: {
  width: number;
  height: number;
  focusedConstellationPos: FocusedConstellationPos | null;
}) {
  // --- ANIMATION CONFIG ---
  const FADE_DURATION = 1;
  const STAGGER_DURATION = 2;

  // --- STAR COUNT CONFIG ---
  const COUNT_FAR = 250;
  const COUNT_MID = 100;
  const COUNT_NEAR = 40;

  // Generate stars using percentage-based positions (0-1 range)
  // This allows stars to maintain relative positions on resize
  const generateLayerStars = (count: number, minR: number, maxR: number) => {
    return Array.from({ length: count }, () => ({
      xPercent: Math.random(), // 0-1 range
      yPercent: Math.random(), // 0-1 range
      radius: Math.random() * (maxR - minR) + minR,
    }));
  };

  // 1. Generate Far Layer (Small, many) - ONCE on mount
  const farStars = useMemo(
    () => generateLayerStars(COUNT_FAR, 0.5, 1.2),
    [] // Empty deps = generate only once!
  );

  // 2. Generate Mid Layer (Medium, moderate amount) - ONCE on mount
  const midStars = useMemo(
    () => generateLayerStars(COUNT_MID, 1.2, 2.0),
    [] // Empty deps = generate only once!
  );

  // 3. Generate Near Layer (Large, few) - ONCE on mount
  const nearStars = useMemo(
    () => generateLayerStars(COUNT_NEAR, 2.0, 3.5),
    [] // Empty deps = generate only once!
  );

  // Convert percentage positions to actual coordinates
  // This recalculates positions on resize without regenerating stars
  const farStarsPositioned = useMemo(
    () => farStars.map(star => ({
      x: star.xPercent * width,
      y: star.yPercent * height,
      radius: star.radius,
    })),
    [farStars, width, height]
  );

  const midStarsPositioned = useMemo(
    () => midStars.map(star => ({
      x: star.xPercent * width,
      y: star.yPercent * height,
      radius: star.radius,
    })),
    [midStars, width, height]
  );

  const nearStarsPositioned = useMemo(
    () => nearStars.map(star => ({
      x: star.xPercent * width,
      y: star.yPercent * height,
      radius: star.radius,
    })),
    [nearStars, width, height]
  );

  return (
    <Group>
      {/* LAYER 1: BACKGROUND (Far) */}
      <ParallaxLayer
        stars={farStarsPositioned}
        depth={0.15}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={0}
      />

      {/* LAYER 2: MIDGROUND */}
      <ParallaxLayer
        stars={midStarsPositioned}
        depth={0.4}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={STAGGER_DURATION}
      />

      {/* LAYER 3: FOREGROUND (Near) */}
      <ParallaxLayer
        stars={nearStarsPositioned}
        depth={0.8}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={STAGGER_DURATION * 2}
      />
    </Group>
  );
}
