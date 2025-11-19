import Konva from "konva";
import { Group, Rect } from "react-konva";
import { useState, useRef, useEffect } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { useRouter } from "next/navigation";

export default function Constellation({
  data,
  transformData,
  showBoundingBox,
  showStarBoundingBox,
  boundingBoxPaddingX = 3,
  boundingBoxPaddingY = 3,
  useExactLabelFit = true,
  bboxLabelSize = 4,
  bboxLabelFontFamily = "sans-serif",
  windowCenter,
  focusedConstellation,
  focusedUnfocusedPos,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  onClickCallback,
}: {
  data: ConstellationData;
  transformData: TransformData;
  showBoundingBox?: boolean;
  showStarBoundingBox?: boolean;
  boundingBoxPaddingX?: number;
  boundingBoxPaddingY?: number;
  useExactLabelFit?: boolean;
  bboxLabelSize?: number;
  bboxLabelFontFamily?: string;
  windowCenter: { x: number; y: number };
  focusedConstellation: ConstellationData | null;
  focusedUnfocusedPos?: { x: number; y: number } | null;
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
  const DEFAULT_TOTAL_DURATION = 2;
  const [brightness, setBrightness] = useState(1);
  const brightnessHover = 1.2;
  const [isHovered, setIsHovered] = useState(false);

  const groupRef = useRef<Konva.Group>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const focusTweenRef = useRef<Konva.Tween | null>(null);

  // --- REFS FOR BOUNDING BOX FADE ---
  const bboxGroupRef = useRef<Konva.Group>(null);
  const bboxTweenRef = useRef<Konva.Tween | null>(null);

  const [boxKey, setBoxKey] = useState(0);

  const focusScale: number = data.focusScale;

  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);

  const hasLabels = stars.some((s) => !!s.data?.label);
  const SHOULD_MEASURE_LABELS = useExactLabelFit && hasLabels;

  const measuredExtents = (() => {
    const defaultMinX = Math.min(...xs);
    const defaultMaxX = Math.max(...xs);
    const defaultMinY = Math.min(...ys);
    const defaultMaxY = Math.max(...ys);

    if (!SHOULD_MEASURE_LABELS) {
      const minX = defaultMinX - boundingBoxPaddingX;
      const maxX = defaultMaxX + boundingBoxPaddingX;
      const minY = defaultMinY - boundingBoxPaddingY;
      const maxY = defaultMaxY + boundingBoxPaddingY;
      return { minX, maxX, minY, maxY };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of stars) {
      const sx = s.x;
      const sy = s.y;
      const starRadius = s.size ?? 5;

      minX = Math.min(minX, sx - starRadius);
      maxX = Math.max(maxX, sx + starRadius);
      minY = Math.min(minY, sy - starRadius);
      maxY = Math.max(maxY, sy + starRadius);

      if (s.data?.label) {
        const temp = new Konva.Text({
          text: String(s.data.label),
          fontSize: bboxLabelSize,
          fontFamily: bboxLabelFontFamily,
        });
        const labelW = temp.width();
        const labelH = temp.height();
        const labelTop = sy + starRadius + bboxLabelSize;
        const labelBottom = labelTop + labelH;

        const labelLeft = sx - labelW / 2;
        const labelRight = sx + labelW / 2;

        minX = Math.min(minX, labelLeft);
        maxX = Math.max(maxX, labelRight);
        minY = Math.min(minY, labelTop);
        maxY = Math.max(maxY, labelBottom);
      }
    }

    minX -= boundingBoxPaddingX;
    maxX += boundingBoxPaddingX;
    minY -= boundingBoxPaddingY;
    maxY += boundingBoxPaddingY;

    if (!isFinite(minX) || !isFinite(minY)) {
      return {
        minX: (Math.min(...xs) || 0) - boundingBoxPaddingX,
        maxX: (Math.max(...xs) || 0) + boundingBoxPaddingX,
        minY: (Math.min(...ys) || 0) - boundingBoxPaddingY,
        maxY: (Math.max(...ys) || 0) + boundingBoxPaddingY,
      };
    }

    return { minX, maxX, minY, maxY };
  })();

  const minX = measuredExtents.minX - 10;
  const maxX = measuredExtents.maxX + 10;
  const minY = measuredExtents.minY - 10;
  const maxY = measuredExtents.maxY + 10;
  const width = maxX - minX;
  const height = maxY - minY;

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

  useEffect(() => {
    if (!isFocused) {
      playUnfocusTween();
    }
    if (focusedConstellation) {
      if (!isFocused) {
        playVanishTween();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, focusedConstellation]);

  const HOVER_SCALE = 1.1;
  const SCALE_ANIMATION_DURATION = 0.75;
  const FOCUS_ANIMATION_DURATION = 0.5;
  const EASING = Konva.Easings.EaseInOut;

  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node) return;

    hoverTweenRef.current?.finish();

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

    focusTweenRef.current?.finish();

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: windowCenter.x,
      y: windowCenter.y,
      scaleX: (transformData.scaleX ?? 1) * focusScale,
      scaleY: (transformData.scaleY ?? 1) * focusScale,
      rotation: 0,
    });

    focusTweenRef.current.play();
  };

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  const playUnfocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    focusTweenRef.current?.finish();

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

  const playVanishTween = () => {
    const node = groupRef.current;
    if (!node) return;

    focusTweenRef.current?.finish();

    const currentX = unfocusedConstellationX;
    const currentY = unfocusedConstellationY;
    const focal = focusedUnfocusedPos ?? windowCenter;

    let vx = currentX - focal.x;
    let vy = currentY - focal.y;
    let vlen = Math.hypot(vx, vy);

    if (vlen < 0.0001) {
      vx = 0;
      vy = -1;
      vlen = 1;
    }

    const nx = vx / vlen;
    const ny = vy / vlen;

    const vw =
      typeof window !== "undefined" ? window.innerWidth : windowCenter.x * 2;
    const vh =
      typeof window !== "undefined" ? window.innerHeight : windowCenter.y * 2;
    const viewportDiagonal = Math.hypot(vw, vh);
    const offscreenDist = viewportDiagonal * 1.4 + Math.max(width, height);

    const targetX = currentX + nx * offscreenDist;
    const targetY = currentY + ny * offscreenDist;

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
      rotation: transformData.rotation ?? 0,
    });

    focusTweenRef.current.play();
  };

  const {
    setOverlayTextContents: setTopOverlayTextContents,
    resetOverlayTextContents: resetTopOverlayTextContents,
  } = useTopOverlayContext();

  const { setOverlayTextContents: setCenterOverlayTextContents } =
    useCenterOverlayContext();

  const showBox = isFocused || showStarBoundingBox || isHovered;

  // --- BOUNDING BOX FADE LOGIC ---

  // 1. Initialize invisible
  useEffect(() => {
    if (bboxGroupRef.current) {
      bboxGroupRef.current.opacity(0);
    }
  }, []);

  // 2. Handle transitions
  useEffect(() => {
    const node = bboxGroupRef.current;
    if (!node) return;

    // EXPLICIT SAFE CLEANUP
    if (bboxTweenRef.current) {
      bboxTweenRef.current.destroy();
      bboxTweenRef.current = null;
    }

    if (showBox) {
      // ENTER:
      // 1. Force Re-mount of children to trigger line drawing (setBoxKey)
      // 2. Set Opacity to 1 immediately
      setBoxKey((k) => k + 1);
      node.opacity(1);
    } else {
      // EXIT:
      // Create new tween for fade out
      const tween = new Konva.Tween({
        node,
        duration: 0.35,
        opacity: 0,
        easing: Konva.Easings.EaseInOut,
      });
      tween.play();
      bboxTweenRef.current = tween;
    }
  }, [showBox]);

  const tl = { x: minX, y: minY };
  const tr = { x: maxX, y: minY };
  const br = { x: maxX, y: maxY };
  const bl = { x: minX, y: maxY };

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

  const router = useRouter();

  const handleConstellationClick = (e: any) => {
    e.cancelBubble = true;
    playFocusTween();
    if (!isFocused) {
      groupRef.current?.moveToTop();
    }
    document.body.style.cursor = "default";
    if (onClickCallback) onClickCallback();
  };

  const handleInteractionStart = () => {
    if (!isFocused) {
      setBrightness(brightnessHover);
      playHoverTween(
        (transformData.scaleX ?? 1) * HOVER_SCALE,
        (transformData.scaleY ?? 1) * HOVER_SCALE
      );
      document.body.style.cursor = "pointer";
    }
    setIsHovered(true);

    if (onHoverEnterCallback) onHoverEnterCallback();
  };

  const handleInteractionEnd = () => {
    if (!isFocused) {
      setBrightness(1);
      playHoverTween(transformData.scaleX ?? 1, transformData.scaleY ?? 1);
    }
    document.body.style.cursor = "default";

    if (onHoverLeaveCallback) onHoverLeaveCallback();
    setIsHovered(false);
  };

  return (
    <Group
      ref={groupRef}
      onClick={handleConstellationClick}
      onTap={handleConstellationClick}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      x={unfocusedConstellationX}
      y={unfocusedConstellationY}
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

      {/* Constellation lines */}
      {lineSegments.map(([i1, i2], idx) => (
        <AnimatedLine
          key={`conn-${idx}`}
          p1={stars[i1]}
          p2={stars[i2]}
          duration={lineDurations[idx]}
          delay={lineDelays[idx]}
        />
      ))}

      {/* 
        BOUNDING BOX GROUP 
      */}
      <Group ref={bboxGroupRef} listening={showBox}>
        <Group key={boxKey}>
          <AnimatedLine
            key="bbox-edge-0"
            p1={tl}
            p2={tr}
            duration={edgeDurations[0]}
            delay={edgeDelays[0]}
          />
          <AnimatedLine
            key="bbox-edge-1"
            p1={tr}
            p2={br}
            duration={edgeDurations[1]}
            delay={edgeDelays[1]}
          />
          <AnimatedLine
            key="bbox-edge-2"
            p1={br}
            p2={bl}
            duration={edgeDurations[2]}
            delay={edgeDelays[2]}
          />
          <AnimatedLine
            key="bbox-edge-3"
            p1={bl}
            p2={tl}
            duration={edgeDurations[3]}
            delay={edgeDelays[3]}
          />

          <MainStar
            key="bbox-tl"
            x={tl.x}
            y={tl.y}
            size={2}
            brightness={brightness}
            delay={cornerStarDelays[0]}
          />
          <MainStar
            key="bbox-tr"
            x={tr.x}
            y={tr.y}
            size={3}
            brightness={brightness}
            delay={cornerStarDelays[1]}
          />
          <MainStar
            key="bbox-br"
            x={br.x}
            y={br.y}
            size={4}
            brightness={brightness}
            delay={cornerStarDelays[2]}
          />
          <MainStar
            key="bbox-bl"
            x={bl.x}
            y={bl.y}
            size={2}
            brightness={brightness}
            delay={cornerStarDelays[3]}
          />
        </Group>
      </Group>

      {/* original stars */}
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
            data={star.data}
            showLabel={isFocused}
            labelSize={4}
            enableOnClick={isFocused}
            onHoverEnterCallback={() => {
              if (star.data) {
                if (isFocused) {
                  setTopOverlayTextContents({
                    intro: star.data.intro,
                    title: star.data.label,
                    origin: star.data.origin,
                    about: star.data.about,
                  });
                } else {
                  setCenterOverlayTextContents({
                    intro: star.data.intro,
                    title: star.data.label,
                    origin: star.data.origin,
                    about: star.data.about,
                  });
                }
              }
            }}
            onHoverLeaveCallback={() => {
              if (star.data?.label) {
                if (isFocused) {
                  setTopOverlayTextContents({
                    intro: data.intro,
                    title: data.name,
                    origin: data.about,
                    about: "",
                  });
                } else {
                  resetTopOverlayTextContents();
                  setCenterOverlayTextContents({
                    intro: data.intro,
                    title: data.name,
                    origin: data.origin,
                    about: data.about,
                  });
                }
              }
              if (isFocused) {
                document.body.style.cursor = "default";
              }
            }}
            cancelBubble={true}
            onClickCallback={() => {
              const data = star.data;
              if (data) {
                if (data.externalLink) {
                  window.open(
                    data.externalLink,
                    "_blank",
                    "noopener,noreferrer"
                  );
                } else if (data.internalLink) {
                  router.push(data.internalLink);
                }
                setTopOverlayTextContents({
                  intro: data.intro,
                  title: data.label,
                  origin: data.origin,
                  about: data.about,
                });
              }
            }}
          />
        );
      })}
    </Group>
  );
}
