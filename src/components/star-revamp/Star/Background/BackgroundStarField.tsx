import { Group } from "react-konva";
import { useMemo } from "react";
import ParallaxLayer from "@/components/star-revamp/Star/Background/ParallaxLayer";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";

export default function StarField({
  width,
  height,
  starCount = 200,
  focusedConstellationPos,
}: {
  width: number;
  height: number;
  starCount?: number;
  focusedConstellationPos: FocusedConstellationPos | null;
}) {
  // --- CONFIGURATION ---
  const FADE_DURATION = 1; // Time for a single layer to go 0 -> 1 opacity
  const STAGGER_DURATION = 2; // Wait time before the next layer starts appearing

  // 1. Generate Stars
  const allStars = useMemo(
    () =>
      Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
      })),
    [width, height, starCount]
  );

  // 2. Split into Layers
  const { farStars, midStars, nearStars } = useMemo(() => {
    const far: typeof allStars = [];
    const mid: typeof allStars = [];
    const near: typeof allStars = [];

    allStars.forEach((s) => {
      if (s.radius < 1.2) far.push(s);
      else if (s.radius < 2.0) mid.push(s);
      else near.push(s);
    });

    return { farStars: far, midStars: mid, nearStars: near };
  }, [allStars]);

  return (
    <Group>
      {/* LAYER 1: BACKGROUND (Far) */}
      <ParallaxLayer
        stars={farStars}
        depth={0.15}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={0} // Starts immediately
      />

      {/* LAYER 2: MIDGROUND */}
      <ParallaxLayer
        stars={midStars}
        depth={0.4}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={STAGGER_DURATION} // Starts after stagger
      />

      {/* LAYER 3: FOREGROUND (Near) */}
      <ParallaxLayer
        stars={nearStars}
        depth={0.8}
        focusedConstellationPos={focusedConstellationPos}
        fadeDuration={FADE_DURATION}
        fadeDelay={STAGGER_DURATION * 2} // Starts after 2x stagger
      />
    </Group>
  );
}
