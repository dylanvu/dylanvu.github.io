import Konva from "konva";
import { Group, Rect } from "react-konva";
import { useState, useRef, useEffect } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";

export default function Constellation({
  data,
  transformData,
  showBoundingBox,
  showStarBoundingBox, // existing toggle
  // new props for padding + exact-fit
  boundingBoxPaddingX = 3,
  boundingBoxPaddingY = 3,
  useExactLabelFit = true,
  bboxLabelSize = 4,
  bboxLabelFontFamily = "sans-serif",
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
  showStarBoundingBox?: boolean;
  boundingBoxPaddingX?: number;
  boundingBoxPaddingY?: number;
  useExactLabelFit?: boolean;
  bboxLabelSize?: number;
  bboxLabelFontFamily?: string;
  windowCenter: { x: number; y: number };
  focusedConstellation: ConstellationData | null;
  focusedScreenPos?: { x: number; y: number } | null;
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
  const focusTweenRef = useRef<Konva.Tween | null>(null);

  const constellationFocusScale: Record<string, number> = {
    Viae: 2.4,
    Iter: 2.4,
    Arete: 2.4,
    Elevare: 2,
  };
  const focusScale: number = constellationFocusScale[data.name];

  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);

  const LABEL_VISIBLE = isFocused && stars.some((s) => !!s.data?.label);

  //
  // ====== BOUNDING BOX: exact-fit OR padded ======
  //
  // We measure existing labels when useExactLabelFit && LABEL_VISIBLE.
  // Otherwise we use simple padding props.
  //
  // Per-star label layout in MainStar:
  //  - label is centered at star.x
  //  - label Y offset relative to star center is `size + labelSize`
  //  - we measure label width/height using Konva.Text
  //
  const measuredExtents = (() => {
    // default extents computed from stars themselves (star radius only)
    // we'll expand these by padding / label extents below
    const defaultMinX = Math.min(...xs);
    const defaultMaxX = Math.max(...xs);
    const defaultMinY = Math.min(...ys);
    const defaultMaxY = Math.max(...ys);

    if (!useExactLabelFit || !LABEL_VISIBLE) {
      // simple padding fallback — same behaviour as before but exposed via props
      const minX = defaultMinX - boundingBoxPaddingX;
      const maxX = defaultMaxX + boundingBoxPaddingX;
      const minY = defaultMinY - boundingBoxPaddingY;
      const maxY = defaultMaxY + boundingBoxPaddingY;
      return { minX, maxX, minY, maxY };
    }

    // Exact-fit mode: measure each label and include its rect into extents
    // We'll use Konva.Text purely for measurement (not added to stage)
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of stars) {
      const sx = s.x;
      const sy = s.y;
      const starRadius = s.size ?? 5;

      // include star circle extents
      minX = Math.min(minX, sx - starRadius);
      maxX = Math.max(maxX, sx + starRadius);
      minY = Math.min(minY, sy - starRadius);
      maxY = Math.max(maxY, sy + starRadius);

      if (s.data?.label) {
        // measure label using Konva.Text
        // Note: creating a Konva.Text instance is cheap for measurement purposes
        const temp = new Konva.Text({
          text: String(s.data.label),
          fontSize: bboxLabelSize,
          fontFamily: bboxLabelFontFamily,
        });
        const labelW = temp.width();
        const labelH = temp.height();
        // MainStar places label at y = size + labelSize (relative)
        const labelTop = sy + starRadius + bboxLabelSize; // top edge of label
        const labelBottom = labelTop + labelH;

        // horizontally label is centered on sx
        const labelLeft = sx - labelW / 2;
        const labelRight = sx + labelW / 2;

        minX = Math.min(minX, labelLeft);
        maxX = Math.max(maxX, labelRight);
        minY = Math.min(minY, labelTop);
        maxY = Math.max(maxY, labelBottom);
      }
    }

    // finally apply the small explicit padding props as a buffer
    minX -= boundingBoxPaddingX;
    maxX += boundingBoxPaddingX;
    minY -= boundingBoxPaddingY;
    maxY += boundingBoxPaddingY;

    // sanity fallback (if no stars)
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

  const minX = measuredExtents.minX - 10; // keep a conservative -10 like you had earlier
  const maxX = measuredExtents.maxX + 10;
  const minY = measuredExtents.minY - 10;
  const maxY = measuredExtents.maxY + 10;
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
  const SCALE_ANIMATION_DURATION = 0.75; // seconds
  const FOCUS_ANIMATION_DURATION = 0.5; // seconds
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

    let rotationAngle = 0;

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

    const focal = focusedScreenPos ?? windowCenter;

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
    setTitleText,
    setOriginText,
    setAboutText,
    setIntroText,
    resetOverlayTextContents,
  } = useTopOverlayContext();

  /**
   * STAR BOUNDING BOX LOGIC
   * showStarBoundingBox: when true, render four MainStar at the corners and AnimatedLine that outline the box
   */
  const showBox = isFocused || showStarBoundingBox;
  // corner positions (local group coordinates)
  const tl = { x: minX, y: minY };
  const tr = { x: maxX, y: minY };
  const br = { x: maxX, y: maxY };
  const bl = { x: minX, y: maxY };

  // perimeter-based durations
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

  // star delays — appear when the line that reaches them completes:
  // TL: 0 (start), TR: end of top edge, BR: end of right edge, BL: end of bottom edge
  const cornerStarDelays = [
    0,
    edgeDelays[0] + edgeDurations[0],
    edgeDelays[1] + edgeDurations[1],
    edgeDelays[2] + edgeDurations[2],
  ];

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
        }

        if (onHoverEnterCallback) onHoverEnterCallback();
      }}
      onMouseLeave={() => {
        if (!isFocused) {
          setBrightness(1);
          playHoverTween(transformData.scaleX ?? 1, transformData.scaleY ?? 1);
        }
        document.body.style.cursor = "default";

        if (onHoverLeaveCallback) onHoverLeaveCallback();
      }}
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

      {/* Corner bounding-box outline (optional) */}
      {showBox && (
        <>
          {/* edges in order TL -> TR -> BR -> BL -> TL */}
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

          {/* corner stars (slightly bigger) */}
          <MainStar
            key="bbox-tl"
            x={tl.x}
            y={tl.y}
            size={2}
            brightness={brightness}
            delay={cornerStarDelays[0]}
            windowCenter={windowCenter}
            onHoverEnterCallback={() => {}}
            onHoverLeaveCallback={() => {}}
          />
          <MainStar
            key="bbox-tr"
            x={tr.x}
            y={tr.y}
            size={3}
            brightness={brightness}
            delay={cornerStarDelays[1]}
            windowCenter={windowCenter}
            onHoverEnterCallback={() => {}}
            onHoverLeaveCallback={() => {}}
          />
          <MainStar
            key="bbox-br"
            x={br.x}
            y={br.y}
            size={4}
            brightness={brightness}
            delay={cornerStarDelays[2]}
            windowCenter={windowCenter}
            onHoverEnterCallback={() => {}}
            onHoverLeaveCallback={() => {}}
          />
          <MainStar
            key="bbox-bl"
            x={bl.x}
            y={bl.y}
            size={2}
            brightness={brightness}
            delay={cornerStarDelays[3]}
            windowCenter={windowCenter}
            onHoverEnterCallback={() => {}}
            onHoverLeaveCallback={() => {}}
          />
        </>
      )}

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
            label={isFocused ? star.data?.label : undefined}
            labelSize={4}
            windowCenter={windowCenter}
            onHoverEnterCallback={() => {
              if (star.data) {
                setIntroText("Star");
                setTitleText(star.data.label);
                setOriginText(star.data.origin);
                setAboutText(star.data.about);
              }
            }}
            onHoverLeaveCallback={() => {
              if (star.data?.label) {
                resetOverlayTextContents();
              }
              if (isFocused) {
                document.body.style.cursor = "default";
              }
            }}
            onClickCallback={() => {
              if (star.data) {
                setIntroText("Star");
                setTitleText(star.data.label);
                setOriginText(star.data.origin);
                setAboutText(star.data.about);
              }
            }}
          />
        );
      })}
    </Group>
  );
}
