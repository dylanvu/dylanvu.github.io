import Konva from "konva";
import { Group, Rect } from "react-konva";
import { useState, useRef, useEffect } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";

export default function Constellation({
  data,
  transformData,
  showBoundingBox,
  windowCenter,
  isFocused,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  onClickCallback,
}: {
  data: ConstellationData;
  transformData: TransformData;
  showBoundingBox?: boolean;
  windowCenter: { x: number; y: number };
  isFocused: boolean;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
}) {
  const { stars, connections, totalDuration } = data;
  const DEFAULT_TOTAL_DURATION = 2; // seconds
  const [brightness, setBrightness] = useState(1);
  const brightnessHover = 1.2;

  const groupRef = useRef<any>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);

  /**
   * This tween will move the constellation from where it is currently at, to the center of the screen.
   * It is played when the constellation is clicked and goes into focus
   */
  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const focusScale = 3;

  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const minX = Math.min(...xs) - 10;
  const maxX = Math.max(...xs) + 10;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...ys) + 10;
  const width = maxX - minX;
  const height = maxY - minY;

  // center in local group coordinates
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const getDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const lineSegments =
    connections && connections.length > 0
      ? connections
      : stars.slice(1).map((_, i) => [i, i + 1] as [number, number]);

  const lineLengths = lineSegments.map(([i1, i2]) =>
    getDistance(stars[i1], stars[i2])
  );
  const totalLineLength = lineLengths.reduce((sum, l) => sum + l, 0) || 1;
  const lineDurations = lineLengths.map(
    (l) => (l / totalLineLength) * (totalDuration ?? DEFAULT_TOTAL_DURATION)
  );
  const lineDelays = lineDurations.reduce<number[]>((acc, dur, idx) => {
    if (idx === 0) acc.push(0);
    else acc.push(acc[idx - 1] + lineDurations[idx - 1]);
    return acc;
  }, []);

  const {
    setTitleText,
    setOriginText,
    setAboutText,
    setIntroText,
    DEFAULT_TITLE_TEXT,
    DEFAULT_ORIGIN_TEXT,
    DEFAULT_ABOUT_TEXT,
    DEFAULT_INTRO_TEXT,
  } = useMainStageOverlayContext();

  useEffect(() => {
    if (!isFocused) {
      playUnfocusTween();
    }
  }, [isFocused]);

  const HOVER_SCALE = 1.1;
  const SCALE_ANIMATION_DURATION = 0.75; // seconds
  const FOCUS_ANIMATION_DURATION = 0.5; // seconds
  const EASING = Konva.Easings.EaseInOut;

  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node) return;

    // finish any running tween to avoid overlap
    hoverTweenRef.current?.finish();

    // create & play a new tween
    hoverTweenRef.current = new Konva.Tween({
      node,
      duration: SCALE_ANIMATION_DURATION,
      scaleX: toScaleX,
      scaleY: toScaleY,
      easing: EASING,
    });

    hoverTweenRef.current.play();
  };

  const playFocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // finish any running tween to avoid overlap
    focusTweenRef.current?.finish();

    // create & play the focus tween
    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: windowCenter.x,
      y: windowCenter.y,
      scaleX: (transformData.scaleX ?? 1) * focusScale,
      scaleY: (transformData.scaleY ?? 1) * focusScale,
      rotation: data.name === "Elevare" ? 0 : transformData.rotation,
    });

    focusTweenRef.current.play();
  };

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  const playUnfocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // finish any running tween to avoid overlap
    focusTweenRef.current?.finish();

    // create & play the focus tween
    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: unfocusedConstellationX,
      y: unfocusedConstellationY,
      scaleX: transformData.scaleX ?? 1,
      scaleY: transformData.scaleY ?? 1,
      rotation: transformData.rotation ?? 0,
    });

    focusTweenRef.current.play();
  };

  return (
    <Group
      ref={groupRef}
      onClick={(e) => {
        e.cancelBubble = true;
        playFocusTween();
        if (!isFocused) {
          groupRef.current.moveToTop();
        }
        if (onClickCallback) onClickCallback();
      }}
      onMouseEnter={() => {
        setBrightness(brightnessHover);
        if (!isFocused) {
          playHoverTween(
            (transformData.scaleX ?? 1) * HOVER_SCALE,
            (transformData.scaleY ?? 1) * HOVER_SCALE
          );
        }

        setTitleText(data.name);
        setOriginText(data.origin);
        setAboutText(data.about);
        setIntroText("Constellation");
        if (onHoverEnterCallback) onHoverEnterCallback();
      }}
      onMouseLeave={() => {
        setBrightness(1);

        if (!isFocused) {
          playHoverTween(transformData.scaleX ?? 1, transformData.scaleY ?? 1);
        }

        setTitleText(DEFAULT_TITLE_TEXT);
        setOriginText(DEFAULT_ORIGIN_TEXT);
        setAboutText(DEFAULT_ABOUT_TEXT);
        setIntroText(DEFAULT_INTRO_TEXT);
        if (onHoverLeaveCallback) onHoverLeaveCallback();
      }}
      // move the Group so that the center point remains where it was before we set offsets
      x={unfocusedConstellationX}
      y={unfocusedConstellationY}
      // offset the group so scale/rotation happen around the constellation center
      offsetX={centerX}
      offsetY={centerY}
      rotation={transformData.rotation}
      scaleX={transformData.scaleX ?? 1}
      scaleY={transformData.scaleY ?? 1}
    >
      <Rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        fill={showBoundingBox ? "rgba(255,0,0,0.2)" : ""}
        listening={true}
      />

      {lineSegments.map(([i1, i2], idx) => (
        <AnimatedLine
          key={idx}
          p1={stars[i1]}
          p2={stars[i2]}
          duration={lineDurations[idx]}
          delay={lineDelays[idx]}
        />
      ))}

      {stars.map((star, i) => {
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
            delay={delay}
          />
        );
      })}
    </Group>
  );
}
