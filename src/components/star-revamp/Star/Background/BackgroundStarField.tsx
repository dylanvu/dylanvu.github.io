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

  // Helper to generate stars within a specific radius range
  const generateLayerStars = (count: number, minR: number, maxR: number) => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * (maxR - minR) + minR,
    }));
  };

  // 1. Generate Far Layer (Small, many)
  const farStars = useMemo(
    () => generateLayerStars(COUNT_FAR, 0.5, 1.2),
    [width, height]
  );

  // 2. Generate Mid Layer (Medium, moderate amount)
  const midStars = useMemo(
    () => generateLayerStars(COUNT_MID, 1.2, 2.0),
    [width, height]
  );

  // 3. Generate Near Layer (Large, few)
  const nearStars = useMemo(
    () => generateLayerStars(COUNT_NEAR, 2.0, 3.5),
    [width, height]
  );

  return (
    <Group>
      {/* LAYER 1: BACKGROUND (Far) */}
      <ParallaxLayer
        stars={farStars}
        depth={0.15}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={0}
      />

      {/* LAYER 2: MIDGROUND */}
      <ParallaxLayer
        stars={midStars}
        depth={0.4}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={STAGGER_DURATION}
      />

      {/* LAYER 3: FOREGROUND (Near) */}
      <ParallaxLayer
        stars={nearStars}
        depth={0.8}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={STAGGER_DURATION * 2}
      />
    </Group>
  );
}
