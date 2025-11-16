import { Group, Rect } from "react-konva";
import { useState } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";

export default function Constellation({
  data,
  transformData,
  showBoundingBox,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  onClickCallback,
}: {
  data: ConstellationData;
  transformData: TransformData;
  showBoundingBox?: boolean;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
}) {
  const { stars, connections, totalDuration } = data;
  const DEFAULT_TOTAL_DURATION = 2; // seconds
  const [brightness, setBrightness] = useState(1);
  const [hovered, setHovered] = useState(false);
  const brightnessHover = 1.2;

  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const minX = Math.min(...xs) - 10;
  const maxX = Math.max(...xs) + 10;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...ys) + 10;
  const width = maxX - minX;
  const height = maxY - minY;

  // Helper: distance between points
  const getDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

  // Determine line segments
  const lineSegments =
    connections && connections.length > 0
      ? connections
      : stars.slice(1).map((_, i) => [i, i + 1] as [number, number]);

  // Compute lengths
  const lineLengths = lineSegments.map(([i1, i2]) =>
    getDistance(stars[i1], stars[i2])
  );

  const totalLineLength = lineLengths.reduce((sum, l) => sum + l, 0);

  // Compute per-line duration proportional to length
  const lineDurations = lineLengths.map(
    (l) => (l / totalLineLength) * (totalDuration ?? DEFAULT_TOTAL_DURATION)
  );

  // Compute cumulative delays for each line
  const lineDelays = lineDurations.reduce<number[]>((acc, dur, idx) => {
    if (idx === 0) acc.push(0);
    else acc.push(acc[idx - 1] + lineDurations[idx - 1]);
    return acc;
  }, []);

  const {
    setTitleText,
    setOriginText,
    setAboutText,
    DEFAULT_TITLE_TEXT,
    DEFAULT_ORIGIN_TEXT,
    DEFAULT_ABOUT_TEXT,
  } = useMainStageOverlayContext();

  return (
    <Group
      onClick={() => {
        console.log("Constellation clicked!", stars);
        setTitleText(data.name);
        setOriginText(data.origin);
        setAboutText(data.about);
        if (onClickCallback) onClickCallback();
      }}
      onMouseEnter={() => {
        setBrightness(brightnessHover);
        setHovered(true);
        setTitleText(data.name);
        setOriginText(data.origin);
        setAboutText(data.about);
        console.log("hovered", hovered);
        if (onHoverEnterCallback) onHoverEnterCallback();
      }}
      onMouseLeave={() => {
        setBrightness(1);
        setHovered(false);
        console.log(
          "setting overlay text to default",
          DEFAULT_TITLE_TEXT,
          DEFAULT_ORIGIN_TEXT,
          DEFAULT_ABOUT_TEXT
        );
        setTitleText(DEFAULT_TITLE_TEXT);
        setOriginText(DEFAULT_ORIGIN_TEXT);
        setAboutText(DEFAULT_ABOUT_TEXT);
        console.log("hovered", hovered);
        if (onHoverLeaveCallback) onHoverLeaveCallback();
      }}
      x={transformData.x}
      y={transformData.y}
      rotation={transformData.rotation}
      scaleX={transformData.scaleX}
      scaleY={transformData.scaleY}
    >
      <Rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        fill={showBoundingBox ? "rgba(255,0,0,0.2)" : ""}
        listening={true}
      />

      {/* Lines */}
      {lineSegments.map(([i1, i2], idx) => (
        <AnimatedLine
          key={idx}
          p1={stars[i1]}
          p2={stars[i2]}
          duration={lineDurations[idx]}
          delay={lineDelays[idx]}
        />
      ))}

      {/* Stars */}
      {stars.map((star, i) => {
        // Find the line that ends at this star
        const incomingLineIndex = lineSegments.findIndex(
          ([start, end]) => end === i || start === i
        );
        const delay =
          incomingLineIndex >= 0
            ? lineDelays[incomingLineIndex] + lineDurations[incomingLineIndex]
            : 0;

        return (
          <MainStar
            key={i}
            x={star.x}
            y={star.y}
            size={star.size || 5}
            brightness={brightness}
            delay={delay} // fade-in when incoming line finishes
          />
        );
      })}
    </Group>
  );
}
