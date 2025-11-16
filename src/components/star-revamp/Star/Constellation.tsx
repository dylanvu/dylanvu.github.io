import Konva from "konva";
import { Group, Rect, Text } from "react-konva";
import { useState, useRef, useEffect } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";
import { FANCY_FONT_FAMILY, FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
import { text } from "stream/consumers";
import ConstellationLabel from "./ConstellationLabel";

export default function Constellation({
  data,
  transformData,
  showBoundingBox,
  windowCenter,
  focusedConstellation,
  focusedScreenPos,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  onClickCallback,
}: {
  data: ConstellationData;
  transformData: TransformData;
  showBoundingBox?: boolean;
  windowCenter: { x: number; y: number };
  focusedConstellation: ConstellationData | null;
  focusedScreenPos?: { x: number; y: number } | null; // NEW
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
}) {
  let isFocused = false;
  if (focusedConstellation) {
    if (focusedConstellation.name === data.name) {
      isFocused = true;
    }
  }
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
    if (focusedConstellation) {
      if (!isFocused) {
        playVanishTween();
      }
    }
  }, [isFocused, focusedConstellation]);

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

    // the rotation has to be zero because I will add labels to each star and I don't want them to rotate
    let rotationAngle = 0;

    // create & play the focus tween
    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: windowCenter.x,
      y: windowCenter.y,
      scaleX: (transformData.scaleX ?? 1) * focusScale,
      scaleY: (transformData.scaleY ?? 1) * focusScale,
      rotation: rotationAngle,
    });

    focusTweenRef.current.play();
  };

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  /**
   * This tween will move the constellation from the center to the unfocused position
   * @returns
   */
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

  /**
   * This tween will move the constellation from the unfocused position to off the screen
   */
  const playVanishTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // finish any running tween to avoid overlap
    focusTweenRef.current?.finish();

    // current on-screen center (where the Group is positioned right now)
    const currentX = unfocusedConstellationX;
    const currentY = unfocusedConstellationY;

    // focal point: use passed focused screen position if available, otherwise use screen center
    const focal = focusedScreenPos ?? windowCenter;

    // compute vector from focal -> this constellation
    let vx = currentX - focal.x;
    let vy = currentY - focal.y;
    let vlen = Math.hypot(vx, vy);

    // fallback direction if the two centers coincide (very unlikely but safe)
    if (vlen < 0.0001) {
      vx = 0;
      vy = -1;
      vlen = 1;
    }

    const nx = vx / vlen;
    const ny = vy / vlen;

    // choose a distance large enough to place the constellation off-screen
    // using viewport diagonal * factor ensures it goes off in the same direction
    const vw =
      typeof window !== "undefined" ? window.innerWidth : windowCenter.x * 2;
    const vh =
      typeof window !== "undefined" ? window.innerHeight : windowCenter.y * 2;
    const viewportDiagonal = Math.hypot(vw, vh);
    const offscreenDist = viewportDiagonal * 1.4 + Math.max(width, height);

    const targetX = currentX + nx * offscreenDist;
    const targetY = currentY + ny * offscreenDist;

    // optionally shrink slightly as it moves away (feel free to tweak)
    const targetScaleX = (transformData.scaleX ?? 1) * 0.9;
    const targetScaleY = (transformData.scaleY ?? 1) * 0.9;

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: targetX,
      y: targetY,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      // keep rotation as-is so labels remain aligned
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
        document.body.style.cursor = "default";
        if (onClickCallback) onClickCallback();
      }}
      onMouseEnter={() => {
        if (!isFocused) {
          setBrightness(brightnessHover);
          playHoverTween(
            (transformData.scaleX ?? 1) * HOVER_SCALE,
            (transformData.scaleY ?? 1) * HOVER_SCALE
          );
          document.body.style.cursor = "pointer";
          setTitleText(data.name);
          setOriginText(data.origin);
          setAboutText(data.about);
          setIntroText("Constellation");
        }

        if (onHoverEnterCallback) onHoverEnterCallback();
      }}
      onMouseLeave={() => {
        if (!isFocused) {
          setBrightness(1);
          playHoverTween(transformData.scaleX ?? 1, transformData.scaleY ?? 1);
          document.body.style.cursor = "default";
          setTitleText(DEFAULT_TITLE_TEXT);
          setOriginText(DEFAULT_ORIGIN_TEXT);
          setAboutText(DEFAULT_ABOUT_TEXT);
          setIntroText(DEFAULT_INTRO_TEXT);
        }

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
            label={isFocused ? star.label : undefined}
            labelSize={4}
            windowCenter={windowCenter}
          />
        );
      })}
      {/* if you ever want to add a constellation label, remember that you have a component made for it already that needs to be fixed up */}
    </Group>
  );
}
