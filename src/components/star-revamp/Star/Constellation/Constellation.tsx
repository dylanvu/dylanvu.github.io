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

  // Track detailed state of the focused object to allow perfect reversal
  const lastFocusStateRef = useRef<{ 
    name: string;
    rotation: number; 
    focusScale: number;
    unfocusedX: number;
    unfocusedY: number;
  } | null>(null);

  const { focusedObject, parallaxFocusData, navigateToStar } = useFocusContext();

  useEffect(() => {
    if (focusedConstellation && parallaxFocusData) {
      lastFocusStateRef.current = {
        name: focusedConstellation.name,
        rotation: focusedConstellation.rotation ?? 0,
        focusScale: focusedConstellation.focusScale ?? 1,
        unfocusedX: parallaxFocusData.unfocusedX,
        unfocusedY: parallaxFocusData.unfocusedY,
      };
    }
  }, [focusedConstellation, parallaxFocusData]);

  const isReturningRef = useRef(false);

  const pathname = usePathname();

  const { stars, connections, totalDuration } = data;
  const DEFAULT_TOTAL_DURATION = 2;
  const [brightness, setBrightness] = useState(1);
  const brightnessHover = 1.2;
  const [isHovered, setIsHovered] = useState(false);

  const isElevare = data.name === "Elevare";
  
  const [elevareZoom, setElevareZoom] = useState(MIN_ZOOM);

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

  // --- FIXED UNFOCUS FUNCTION (Split Logic for Stability) ---
  const playUnfocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    node.visible(true);
    isReturningRef.current = true;

    if (hoverTweenRef.current) {
        hoverTweenRef.current.destroy();
        hoverTweenRef.current = null;
    }
    if (focusTweenRef.current) {
        focusTweenRef.current.destroy();
    }

    // Fallback if missing data
    if (!lastFocusStateRef.current) {
         focusTweenRef.current = new Konva.Tween({
            node,
            duration: FOCUS_ANIMATION_DURATION,
            easing: EASING,
            x: unfocusedConstellationX,
            y: unfocusedConstellationY,
            scaleX: transformData.scaleX ?? 1,
            scaleY: transformData.scaleY ?? 1,
            rotation: transformData.rotation ?? 0,
            offsetX: centerX,
            offsetY: centerY,
            opacity: 1,
            onFinish: () => { isReturningRef.current = false; }
        });
        focusTweenRef.current.play();
        return;
    }

    const isTarget = lastFocusStateRef.current.name === data.name;

    // --- CASE A: TARGET STAR (Simple Reversal) ---
    // We FORCE the target to start from WindowCenter and tween linearly home.
    // This prevents any floating point "teleport" caused by the unified math.
    if (isTarget) {
        // Force Start State
        node.x(windowCenter.x);
        node.y(windowCenter.y);
        node.scaleX((transformData.scaleX ?? 1) * lastFocusStateRef.current.focusScale);
        node.scaleY((transformData.scaleY ?? 1) * lastFocusStateRef.current.focusScale);
        node.rotation(0);
        node.opacity(1);
        node.offsetX(centerX);
        node.offsetY(centerY);

        focusTweenRef.current = new Konva.Tween({
            node,
            duration: FOCUS_ANIMATION_DURATION,
            easing: EASING,
            x: unfocusedConstellationX,
            y: unfocusedConstellationY,
            scaleX: transformData.scaleX ?? 1,
            scaleY: transformData.scaleY ?? 1,
            rotation: transformData.rotation ?? 0,
            opacity: 1,
            onFinish: () => {
                isReturningRef.current = false;
                if (focusTweenRef.current) {
                    focusTweenRef.current.destroy();
                    focusTweenRef.current = null;
                }
            }
        });
        focusTweenRef.current.play();
        return;
    }

    // --- CASE B: NEIGHBORS (Unified Camera Math) ---
    // For neighbors, we MUST use the camera math to prevent crossover/shearing.
    
    // 1. DATA PREP
    const { 
        unfocusedX: focusedStarOriginalX, 
        unfocusedY: focusedStarOriginalY,
        rotation: prevRotation,
        focusScale: worldZoom 
    } = lastFocusStateRef.current;
    
    // Vector from Focused Star -> This Star
    const vecX = unfocusedConstellationX - focusedStarOriginalX;
    const vecY = unfocusedConstellationY - focusedStarOriginalY;

    const vecToTargetHomeX = focusedStarOriginalX - windowCenter.x;
    const vecToTargetHomeY = focusedStarOriginalY - windowCenter.y;

    const depth = 3.5;
    const expansionFactor = 1 + (worldZoom - 1) * depth;
    
    const baseScale = transformData.scaleX ?? 1;
    const baseRotation = transformData.rotation ?? 0;

    // 2. SET INITIAL STATE (p=0)
    // Calculate exactly where it should be based on the unified model
    {
        const p = 0;
        const currentExpansion = expansionFactor;
        const currentRotOffset = prevRotation;

        // Shift is 0 at start (Camera at Target)
        // Combined Vector = (Relative * Expansion)
        const combinedX = vecX * currentExpansion;
        const combinedY = vecY * currentExpansion;

        // Rotate around Window Center
        const angleRad = (-currentRotOffset * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        const startX = windowCenter.x + (combinedX * cos - combinedY * sin);
        const startY = windowCenter.y + (combinedX * sin + combinedY * cos);

        node.x(startX);
        node.y(startY);
        node.scaleX(baseScale * currentExpansion);
        node.scaleY(baseScale * currentExpansion);
        node.rotation(baseRotation - currentRotOffset);
        node.opacity(0);
    }

    // 3. TWEEN TRAJECTORY
    // We use 'animProgress' custom attribute to drive the math
    node.setAttr('animProgress', 0);

    focusTweenRef.current = new Konva.Tween({
        node,
        duration: FOCUS_ANIMATION_DURATION,
        easing: EASING,
        animProgress: 1,
        
        onUpdate: () => {
            const p = node.getAttr('animProgress');
            
            // Interpolate Factors
            const currentExpansion = expansionFactor + (1 - expansionFactor) * p;
            const currentRotOffset = prevRotation * (1 - p);
            
            // Interpolate Shift (Slide the whole world)
            const shiftX = vecToTargetHomeX * p;
            const shiftY = vecToTargetHomeY * p;
            
            // Combine Vectors
            const combinedX = vecX * currentExpansion + shiftX;
            const combinedY = vecY * currentExpansion + shiftY;
            
            // Rotate System
            const angleRad = (-currentRotOffset * Math.PI) / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);

            const finalX = windowCenter.x + (combinedX * cos - combinedY * sin);
            const finalY = windowCenter.y + (combinedX * sin + combinedY * cos);
            
            node.x(finalX);
            node.y(finalY);
            node.scaleX(baseScale * currentExpansion);
            node.scaleY(baseScale * currentExpansion);
            node.rotation(baseRotation - currentRotOffset);
            
            // Neighbors fade in
            node.opacity(p);
        },
        
        onFinish: () => {
            isReturningRef.current = false;
            
            // Hard Snap
            node.x(unfocusedConstellationX);
            node.y(unfocusedConstellationY);
            node.scaleX(baseScale);
            node.scaleY(baseScale);
            node.rotation(baseRotation);
            node.opacity(1);
            node.offsetX(centerX);
            node.offsetY(centerY);
            
            if (focusTweenRef.current) {
                focusTweenRef.current.destroy();
                focusTweenRef.current = null;
            }
        }
    });
    
    node.offsetX(centerX);
    node.offsetY(centerY);

    focusTweenRef.current.play();
  };

  const playVanishTween = () => {
    const node = groupRef.current;
    if (!node) return;
    
    if (!parallaxFocusData) return;
    
    isReturningRef.current = true;

    if (focusTweenRef.current) focusTweenRef.current.destroy();
    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    const { unfocusedX: focusedUnfocusedX, unfocusedY: focusedUnfocusedY } = parallaxFocusData;
    const worldZoom = focusedConstellation?.focusScale ?? 1;
    const depth = 3.5; 
    
    const vecX = unfocusedConstellationX - focusedUnfocusedX;
    const vecY = unfocusedConstellationY - focusedUnfocusedY;

    const expansionFactor = 1 + (worldZoom - 1) * depth;
    
    const baseScale = transformData.scaleX ?? 1;
    const targetScale = baseScale * expansionFactor;

    const movementMultiplier = expansionFactor; 

    // For vanish, Origin is fixed at Window Center
    const expandedX = windowCenter.x + (vecX * movementMultiplier);
    const expandedY = windowCenter.y + (vecY * movementMultiplier);

    const focusedRotation = focusedConstellation?.rotation ?? 0;
    const angleRad = (-focusedRotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const vX = expandedX - windowCenter.x;
    const vY = expandedY - windowCenter.y;

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
      opacity: 0, 
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
      if (focusedConstellation) {
        if (parallaxFocusData) {
          playVanishTween();
        }
      } else {
        playUnfocusTween();
      }
    }
  }, [isFocused, focusedConstellation, parallaxFocusData, pathname, polarisDisplayState]);

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