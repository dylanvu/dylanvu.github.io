import React, { useEffect, useRef } from "react";
import { Group } from "react-konva";
import Konva from "konva";
import AnimatedLine from "@/components/star-revamp/Star/Constellation/AnimatedLine";
import MainStar from "@/components/star-revamp/Star/MainStar";

type Point = { x: number; y: number };

type Props = {
  isVisible: boolean;
  animationKey: number;
  tl: Point;
  tr: Point;
  br: Point;
  bl: Point;
  width: number;
  height: number;
  brightness: number;
  totalDuration?: number;
};

const DEFAULT_TOTAL_DURATION = 2;

export default function ConstellationBoundingBox({
  isVisible,
  animationKey,
  tl,
  tr,
  br,
  bl,
  width,
  height,
  brightness,
  totalDuration,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const tweenRef = useRef<Konva.Tween | null>(null);

  // --- ANIMATION TIMING CALCULATIONS ---
  // We calculate this here so the parent doesn't have to worry about edge math
  const bboxDuration = (totalDuration ?? DEFAULT_TOTAL_DURATION) / 2;
  const edgeLengths = [width, height, width, height];
  const bboxPerimeter = edgeLengths.reduce((s, l) => s + l, 0) || 1;

  const edgeDurations = edgeLengths.map(
    (l) => (l / bboxPerimeter) * bboxDuration
  );

  const edgeDelays = edgeDurations.reduce<number[]>((acc, dur, idx) => {
    if (idx === 0) acc.push(0);
    else acc.push(acc[idx - 1] + edgeDurations[idx - 1]);
    return acc;
  }, []);

  const cornerStarDelays = [
    0,
    edgeDelays[0] + edgeDurations[0],
    edgeDelays[1] + edgeDurations[1],
    edgeDelays[2] + edgeDurations[2],
  ];

  // --- FADE IN / OUT / REDRAW LOGIC ---
  useEffect(() => {
    // Initialize opacity to 0 on mount
    if (groupRef.current) {
      groupRef.current.opacity(0);
    }
  }, []);

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    // Clean up previous tween to avoid conflicts
    if (tweenRef.current) {
      tweenRef.current.destroy();
      tweenRef.current = null;
    }

    if (isVisible) {
      // ENTER: Set opacity to 1 immediately
      // Animation replay is handled by animationKey prop change from parent
      node.opacity(1);
    } else {
      // EXIT: Tween opacity to 0
      tweenRef.current = new Konva.Tween({
        node,
        duration: 0.35,
        opacity: 0,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          if (tweenRef.current) {
            tweenRef.current.destroy();
            tweenRef.current = null;
          }
        },
      });
      tweenRef.current.play();
    }
  }, [isVisible]);

  // Cleanup tween on unmount
  useEffect(() => {
    return () => {
      if (tweenRef.current) {
        tweenRef.current.destroy();
        tweenRef.current = null;
      }
    };
  }, []);

  return (
    <Group ref={groupRef} listening={false}>
      {/* 
        The key change forces these components to unmount/remount, 
        replaying their internal animations from t=0 
      */}
      <Group key={animationKey}>
        {/* Edges */}
        <AnimatedLine
          p1={tl}
          p2={tr}
          duration={edgeDurations[0]}
          delay={edgeDelays[0]}
        />
        <AnimatedLine
          p1={tr}
          p2={br}
          duration={edgeDurations[1]}
          delay={edgeDelays[1]}
        />
        <AnimatedLine
          p1={br}
          p2={bl}
          duration={edgeDurations[2]}
          delay={edgeDelays[2]}
        />
        <AnimatedLine
          p1={bl}
          p2={tl}
          duration={edgeDurations[3]}
          delay={edgeDelays[3]}
        />

        {/* Corners */}
        <MainStar
          x={tl.x}
          y={tl.y}
          size={2}
          brightness={brightness}
          delay={cornerStarDelays[0]}
          listening={false}
        />
        <MainStar
          x={tr.x}
          y={tr.y}
          size={3}
          brightness={brightness}
          delay={cornerStarDelays[1]}
          listening={false}
        />
        <MainStar
          x={br.x}
          y={br.y}
          size={4}
          brightness={brightness}
          delay={cornerStarDelays[2]}
          listening={false}
        />
        <MainStar
          x={bl.x}
          y={bl.y}
          size={2}
          brightness={brightness}
          delay={cornerStarDelays[3]}
          listening={false}
        />
      </Group>
    </Group>
  );
}
