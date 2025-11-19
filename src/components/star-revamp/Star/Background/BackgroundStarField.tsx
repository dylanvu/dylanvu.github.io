import { Group } from "react-konva";
import { useMemo } from "react";
import ParallaxLayer from "@/components/star-revamp/Star/Background/ParallaxLayer"; // The new layer component
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";

export default function StarField({
  width,
  height,
  starCount = 200, // Bumped up default since it's performant now
  focusedConstellationPos,
}: {
  width: number;
  height: number;
  starCount?: number;
  focusedConstellationPos: FocusedConstellationPos | null;
}) {
  // 1. Generate Stars
  const allStars = useMemo(
    () =>
      Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Variance in size determines which layer they go into
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
      {/* 
        LAYER 1: BACKGROUND (Small Stars) 
        Moves very little (depth 0.15). 
      */}
      <ParallaxLayer
        stars={farStars}
        depth={0.15}
        focusedConstellationPos={focusedConstellationPos}
        starDelayOffset={0}
      />

      {/* 
        LAYER 2: MIDGROUND (Medium Stars)
        Moves moderately (depth 0.4).
      */}
      <ParallaxLayer
        stars={midStars}
        depth={0.4}
        focusedConstellationPos={focusedConstellationPos}
        starDelayOffset={farStars.length * 10}
      />

      {/* 
        LAYER 3: FOREGROUND (Large Stars)
        Moves significantly (depth 0.8).
        This creates the strongest 3D parallax feel.
      */}
      <ParallaxLayer
        stars={nearStars}
        depth={0.8}
        focusedConstellationPos={focusedConstellationPos}
        starDelayOffset={(farStars.length + midStars.length) * 10}
      />
    </Group>
  );
}
