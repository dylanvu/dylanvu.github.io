import Konva from "konva";
import { Group } from "react-konva";
import { useState, useRef, useEffect, useMemo } from "react";
import ElevareControl from "./ElevareControl";
import HackathonStatistics from "./HackathonStatistics";
import ConstellationContent from "./ConstellationContent";
import { MIN_ZOOM, MAX_ZOOM } from "./ElevareMap";
import { ConstellationData, TransformData, StarClassificationSize } from "@/interfaces/StarInterfaces";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { usePathname } from "next/navigation";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import React from "react";
import { useMobile } from "@/hooks/useMobile";
import { useConstellationInteractions } from "./useConstellationInteractions";
import { areConstellationPropsEqual } from "./useConstellationMemo";

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
  let isFocused = false;
  if (focusedConstellation) {
    if (focusedConstellation.name === data.name) {
      isFocused = true;
    }
  }

  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;

  const isReturningRef = useRef(false);

  const pathname = usePathname();

  const { stars, connections, totalDuration } = data;
  const DEFAULT_TOTAL_DURATION = 2;
  const [brightness, setBrightness] = useState(1);
  const brightnessHover = 1.2;
  const [isHovered, setIsHovered] = useState(false);

  const isElevare = data.name === "Elevare";
  
  // Local state for Elevare zoom
  const [elevareZoom, setElevareZoom] = useState(MIN_ZOOM);

  // Reset Elevare zoom when unfocusing
  useEffect(() => {
    if (!isFocused && isElevare) {
      setElevareZoom(MIN_ZOOM);
    }
  }, [isFocused, isElevare]);

  const groupRef = useRef<Konva.Group>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const focusTweenRef = useRef<Konva.Tween | null>(null);

  const focusScale: number = data.focusScale;

  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);

  // --- BOUNDING BOX MEASUREMENTS ---
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
      const starRadius = s.data ? StarClassificationSize[s.data.classification] : 5;

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

  const HOVER_SCALE = 1.1;
  const SCALE_ANIMATION_DURATION = 0.75;
  const FOCUS_ANIMATION_DURATION = 0.5;
  const EASING = Konva.Easings.EaseInOut;

  const { polarisDisplayState, setPolarisDisplayState } = usePolarisContext();
  
  const { focusedObject, parallaxFocusData, navigateToStar } = useFocusContext();

  const mobileState = useMobile();

  const focusedTargetX = useMemo(() => {
    return pathname.startsWith("/star/") && polarisDisplayState !== "active"
      ? windowCenter.x / 2
      : windowCenter.x;
  }, [pathname, polarisDisplayState, windowCenter.x]);

  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node) return;
    if (isFocusedRef.current) return;
    if (isReturningRef.current) return;

    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }
    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
      focusTweenRef.current = null;
    }

    hoverTweenRef.current = new Konva.Tween({
      node,
      duration: SCALE_ANIMATION_DURATION,
      scaleX: toScaleX,
      scaleY: toScaleY,
      easing: EASING,
      onFinish: () => {
        if (hoverTweenRef.current) {
          hoverTweenRef.current.destroy();
          hoverTweenRef.current = null;
        }
      },
    });

    hoverTweenRef.current.play();
  };

  const playFocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    isReturningRef.current = false;

    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }
    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
    }

    const targetY = windowCenter.y;

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: focusedTargetX,
      y: targetY,
      scaleX: (transformData.scaleX ?? 1) * focusScale,
      scaleY: (transformData.scaleY ?? 1) * focusScale,
      rotation: 0,
      // IMPORTANT: Ensure offsets are reset to local center
      offsetX: centerX,
      offsetY: centerY,
      onFinish: () => {
        if (focusTweenRef.current) {
          focusTweenRef.current.destroy();
          focusTweenRef.current = null;
        }
      },
    });

    focusTweenRef.current.play();
  };

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  const playUnfocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // CRITICAL FIX 1: Make sure the node is rendered before we start animating
    node.visible(true);

    isReturningRef.current = true;

    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
    }

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: unfocusedConstellationX,
      y: unfocusedConstellationY,
      scaleX: transformData.scaleX ?? 1,
      scaleY: transformData.scaleY ?? 1,
      rotation: transformData.rotation ?? 0,
      
      // CRITICAL FIX 2: Animate opacity back to 1
      opacity: 1, 
      
      // Ensure offsets are reset to local center
      offsetX: centerX,
      offsetY: centerY,
      onFinish: () => {
        isReturningRef.current = false;
        if (focusTweenRef.current) {
          focusTweenRef.current.destroy();
          focusTweenRef.current = null;
        }
      },
    });

    focusTweenRef.current.play();
  };

  // --- FIXED PARALLAX FUNCTION ---
  const playVanishTween = () => {
    const node = groupRef.current;
    if (!node) return;

    isReturningRef.current = true;

    if (focusTweenRef.current) focusTweenRef.current.destroy();
    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    // 1. Get Focus Target Info
    const focusedUnfocusedX = parallaxFocusData 
      ? parallaxFocusData.unfocusedX
      : windowCenter.x;
    const focusedUnfocusedY = parallaxFocusData 
      ? parallaxFocusData.unfocusedY
      : windowCenter.y;
      
    // --- CRITICAL FIX START ---
    // The "World Zoom" is determined by the TARGET constellation, not the current one.
    // If the target requires 2x zoom, the whole world (including Elevare) must scale relative to that.
    const worldZoom = focusedConstellation?.focusScale ?? 1;
    // --- CRITICAL FIX END ---

    // 2. Parallax Configuration
    // Depth > 1.0 = Foreground (Close to camera)
    const depth = 1.5; 
    
    // 3. Vector Calculation (Relative to Focus Point)
    const vecX = unfocusedConstellationX - focusedUnfocusedX;
    const vecY = unfocusedConstellationY - focusedUnfocusedY;

    // 4. Calculate Parallax Scale (Dolly Effect)
    // Use worldZoom here instead of data.focusScale
    const expansionFactor = 1 + (worldZoom - 1) * depth;
    
    const baseScale = transformData.scaleX ?? 1;
    const targetScale = baseScale * expansionFactor;

    // 5. Calculate Positional Displacement
    // Foreground objects move away faster than they scale to avoid cluttering the view
    const movementMultiplier = expansionFactor * 1.2; 

    // Calculate where the center should move to (Unrotated Grid Space)
    const expandedX = windowCenter.x + (vecX * movementMultiplier);
    const expandedY = windowCenter.y + (vecY * movementMultiplier);

    // 6. Orbit Rotation
    const focusedRotation = focusedConstellation?.rotation ?? 0;
    const angleRad = (-focusedRotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const vX = expandedX - windowCenter.x;
    const vY = expandedY - windowCenter.y;

    // Rotate vector and add back to center
    const rotatedX = windowCenter.x + (vX * cos - vY * sin);
    const rotatedY = windowCenter.y + (vX * sin + vY * cos);

    const targetRotation = (transformData.rotation ?? 0) - focusedRotation;

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: rotatedX,
      y: rotatedY,
      scaleX: targetScale,
      scaleY: targetScale,
      rotation: targetRotation,
      opacity: 0, // Fade out as it rushes past
      offsetX: centerX,
      offsetY: centerY,
      onFinish: () => {
        isReturningRef.current = false;
        node.visible(false);
        if (focusTweenRef.current) {
          focusTweenRef.current.destroy();
          focusTweenRef.current = null;
        }
      },
    });

    node.visible(true);
    focusTweenRef.current.play();
  };

  useEffect(() => {
    if (isFocused) {
      groupRef.current?.moveToTop();
      playFocusTween();
    } else {
      // If ANY constellation is focused, but it's not us -> Vanish/Parallax
      if (focusedConstellation) {
        playVanishTween();
      } else {
        // No focus at all -> Return to normal
        playUnfocusTween();
      }
    }
  }, [isFocused, focusedConstellation, pathname, polarisDisplayState]);

  const {
    setOverlayTextContents: setTopOverlayTextContents,
    resetOverlayTextContents: resetTopOverlayTextContents,
  } = useTopOverlayContext();

  const { setOverlayTextContents: setCenterOverlayTextContents } =
    useCenterOverlayContext();

  const { handleConstellationClick, handleInteractionStart, handleInteractionEnd } =
    useConstellationInteractions({
      isFocusedRef,
      isReturningRef,
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
        stars={stars}
        lineSegments={lineSegments}
        lineDurations={lineDurations}
        lineDelays={lineDelays}
        isElevare={isElevare}
        elevareZoom={elevareZoom}
        onElevareZoomChange={setElevareZoom}
        isReturningRef={isReturningRef}
        isFocusedRef={isFocusedRef}
        pathname={pathname}
        focusedObject={focusedObject}
        mobileState={mobileState}
        polarisDisplayState={polarisDisplayState}
        setTopOverlayTextContents={setTopOverlayTextContents}
        resetTopOverlayTextContents={resetTopOverlayTextContents}
        setCenterOverlayTextContents={setCenterOverlayTextContents}
        navigateToStar={navigateToStar}
        setPolarisDisplayState={setPolarisDisplayState}
      />
    </Group>
  );
}

export default React.memo(Constellation, areConstellationPropsEqual);
