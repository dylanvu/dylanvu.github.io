import Konva from "konva";
import { Group } from "react-konva";
import { useState, useRef, useEffect, useMemo } from "react";
import React from "react";
import { usePathname } from "next/navigation";

// Hooks
import { useParallaxCamera } from "./useParallaxCamera";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useConstellationInteractions } from "./useConstellationInteractions";
import { areConstellationPropsEqual } from "./useConstellationMemo";

// Components
import ElevareControl from "./ElevareControl";
import HackathonStatistics from "./HackathonStatistics";
import ConstellationContent from "./ConstellationContent";

// Constants & Types
import { MIN_ZOOM, MAX_ZOOM } from "./ElevareMap";
import { ConstellationData, TransformData, StarClassificationSize } from "@/interfaces/StarInterfaces";

function Constellation({
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
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
}) {
  const pathname = usePathname();
  const groupRef = useRef<Konva.Group>(null);
  
  // --- STATE ---
  const isTarget = focusedConstellation?.name === data.name;
  const isFocused = isTarget; 
  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;

  const { focusedObject, parallaxFocusData } = useFocusContext();
  const { polarisDisplayState } = usePolarisContext();
  
  // Local state
  const [brightness, setBrightness] = useState(1);
  const brightnessHover = 1.2;
  const [isHovered, setIsHovered] = useState(false);
  const isElevare = data.name === "Elevare";
  const [elevareZoom, setElevareZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    if (!isFocused && isElevare) setElevareZoom(MIN_ZOOM);
  }, [isFocused, isElevare]);

  // this effect fixes a bug where if you unfocus and try to hover on the same constellation again, the hover tween does not play
  useEffect(() => {
    if (pathname === "/") {
      isFocusedRef.current = false;
    }
  }, [pathname])

  // --- BOUNDING BOX CALCULATIONS ---
  const { stars, connections, totalDuration } = data;
  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const hasLabels = stars.some((s) => !!s.data?.label);
  const SHOULD_MEASURE_LABELS = useExactLabelFit && hasLabels;

  const measuredExtents = (() => {
    const defaultMinX = Math.min(...xs); const defaultMaxX = Math.max(...xs);
    const defaultMinY = Math.min(...ys); const defaultMaxY = Math.max(...ys);

    if (!SHOULD_MEASURE_LABELS) {
      return { minX: defaultMinX - boundingBoxPaddingX, maxX: defaultMaxX + boundingBoxPaddingX, minY: defaultMinY - boundingBoxPaddingY, maxY: defaultMaxY + boundingBoxPaddingY };
    }

    let minX = Infinity; let maxX = -Infinity;
    let minY = Infinity; let maxY = -Infinity;

    for (const s of stars) {
      const sx = s.x; const sy = s.y;
      const starRadius = s.data ? StarClassificationSize[s.data.classification] : 5;
      minX = Math.min(minX, sx - starRadius); maxX = Math.max(maxX, sx + starRadius);
      minY = Math.min(minY, sy - starRadius); maxY = Math.max(maxY, sy + starRadius);

      if (s.data?.label) {
        const temp = new Konva.Text({ text: String(s.data.label), fontSize: bboxLabelSize, fontFamily: bboxLabelFontFamily });
        const labelW = temp.width(); const labelH = temp.height();
        const labelTop = sy + starRadius + bboxLabelSize;
        minX = Math.min(minX, sx - labelW / 2); maxX = Math.max(maxX, sx + labelW / 2);
        minY = Math.min(minY, labelTop); maxY = Math.max(maxY, labelTop + labelH);
      }
    }
    minX -= boundingBoxPaddingX; maxX += boundingBoxPaddingX;
    minY -= boundingBoxPaddingY; maxY += boundingBoxPaddingY;
    if (!isFinite(minX)) return { minX: defaultMinX, maxX: defaultMaxX, minY: defaultMinY, maxY: defaultMaxY };
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

  // --- PARALLAX CAMERA HOOK ---
  
  // 1. Prepare Data for Hook
  // We transform the global context data into the specific shape the hook needs
  const parallaxInputData = useMemo(() => {
    // If we don't have focus data, or if *we* are the focus, this input is null 
    // (hook handles isFocused separately)
    if (!parallaxFocusData || !focusedConstellation) return null;
    
    return {
        worldX: parallaxFocusData.unfocusedX,
        worldY: parallaxFocusData.unfocusedY,
        worldZoom: parallaxFocusData.focusScale,
        targetRotation: parallaxFocusData.rotation
    };
  }, [parallaxFocusData, focusedConstellation]);

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  const focusedTargetX = useMemo(() => {
    return pathname.startsWith("/star/") && polarisDisplayState !== "active" ? windowCenter.x / 2 : windowCenter.x;
  }, [pathname, polarisDisplayState, windowCenter.x]);

  // 2. Invoke Hook
  const { isAnimatingOrFocused } = useParallaxCamera({
    nodeRef: groupRef,
    identityId: data.name,
    unfocusedX: unfocusedConstellationX,
    unfocusedY: unfocusedConstellationY,
    baseScale: transformData.scaleX ?? 1,
    baseRotation: transformData.rotation ?? 0,
    focusScale: data.focusScale,
    windowCenter,
    focusedTargetX,
    isFocused: isTarget,
    focusedGlobalId: focusedConstellation?.name || null,
    parallaxData: parallaxInputData,
    depth: 3.5 // Standard background depth
  });

  // --- HOVER LOGIC ---
  // We keep this local because it's a simple scale effect, not a positional change.
  // We must respect the hook's "busy" state.
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const HOVER_SCALE = 1.1;
  const SCALE_ANIMATION_DURATION = 0.75;
  const EASING = Konva.Easings.EaseInOut;

  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node || isAnimatingOrFocused) return;
    
    // Stop any residual tweens just in case
    if (hoverTweenRef.current) { hoverTweenRef.current.destroy(); }
    
    hoverTweenRef.current = new Konva.Tween({
      node, 
      duration: SCALE_ANIMATION_DURATION, 
      scaleX: toScaleX, 
      scaleY: toScaleY, 
      easing: EASING,
      onFinish: () => { hoverTweenRef.current = null; }
    });
    hoverTweenRef.current.play();
  };

  // --- INTERACTIONS & CONTENT PREP ---
  
  // We map the hook's status to the ref expected by the interaction hook
  const isReturningRef = useRef(isAnimatingOrFocused);
  isReturningRef.current = isAnimatingOrFocused;

  const DEFAULT_TOTAL_DURATION = 2;
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const lineSegments = connections && connections.length > 0 ? connections : stars.slice(1).map((_, i) => [i, i + 1] as [number, number]);
  const lineLengths = lineSegments.map(([i1, i2]) => getDistance(stars[i1], stars[i2]));
  const totalLineLength = lineLengths.reduce((sum, l) => sum + l, 0) || 1;
  const lineDurations = lineLengths.map((l) => (l / totalLineLength) * (totalDuration ?? DEFAULT_TOTAL_DURATION));
  const lineDelays = lineDurations.reduce<number[]>((acc, dur, idx) => {
    if (idx === 0) acc.push(0); else acc.push(acc[idx - 1] + lineDurations[idx - 1]);
    return acc;
  }, []);

  const { handleConstellationClick, handleInteractionStart, handleInteractionEnd } =
    useConstellationInteractions({
      isFocusedRef,
      isReturningRef, // Passed from hook state
      focusedObjectStar: focusedObject.star,
      transformData,
      brightnessHover,
      HOVER_SCALE,
      playHoverTween,
      onClickCallback,
      onHoverEnterCallback,
      onHoverLeaveCallback,
      setBrightness,
      setIsHovered,
      groupRef,
    });

  const controlWidth = 40;
  const controlX = minX - controlWidth;

  return (
    <Group
      ref={groupRef}
      // STATIC PROPS: We allow the useParallaxCamera hook to control position via useLayoutEffect.
      // This prevents React re-renders from fighting the animation frame updates.
      x={0} 
      y={0} 
      offsetX={centerX} 
      offsetY={centerY}
      
      onClick={handleConstellationClick}
      onTap={handleConstellationClick}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      {isElevare && (
        <ElevareControl
          x={controlX}
          topY={minY}
          bottomY={maxY}
          currentZoom={elevareZoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onZoomChange={setElevareZoom}
        />
      )}
      
      {isElevare && (
        <HackathonStatistics
          x={minX}
          y={maxY}
          width={width}
        />
      )}
      
      <ConstellationContent
        minX={minX}
        maxX={maxX}
        minY={minY}
        maxY={maxY}
        width={width}
        height={height}
        brightness={brightness}
        isFocused={isFocused}
        isHovered={isHovered}
        showBoundingBox={showBoundingBox}
        showStarBoundingBox={showStarBoundingBox}
        data={data}
        lineSegments={lineSegments}
        lineDurations={lineDurations}
        lineDelays={lineDelays}
        isElevare={isElevare}
        elevareZoom={elevareZoom}
        onElevareZoomChange={setElevareZoom}
        isReturningRef={isReturningRef}
        isFocusedRef={isFocusedRef}
      />
    </Group>
  );
}

export default React.memo(Constellation, areConstellationPropsEqual);
