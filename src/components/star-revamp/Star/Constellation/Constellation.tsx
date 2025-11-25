import Konva from "konva";
import { Group } from "react-konva";
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
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

/**
 * PURE MATH FUNCTION
 * Calculates the exact position of a neighbor constellation based on the "Camera Progress".
 * p=0: Normal Home Position (World View)
 * p=1: Deep Space Position (Focused View)
 */
function calculateParallaxTransform(
  p: number,
  baseX: number,
  baseY: number,
  baseScale: number,
  baseRotation: number,
  focusX: number,
  focusY: number,
  windowCenterX: number,
  windowCenterY: number,
  worldZoom: number,
  targetRotation: number
) {
  // Depth Factor: How much faster background moves
  const depth = 3.5;
  const expansionFactor = 1 + (worldZoom - 1) * depth;

  // Interpolate Factors based on p
  const currentExpansion = 1 + (expansionFactor - 1) * p;
  
  // Rotation offset
  const currentRotOffset = targetRotation * p;

  // Vector from FocusStar to ThisConstellation
  const vecX = baseX - focusX;
  const vecY = baseY - focusY;

  // The "Effective" Origin moves from FocusStar(at home) to WindowCenter
  const currentOriginX = focusX + (windowCenterX - focusX) * p;
  const currentOriginY = focusY + (windowCenterY - focusY) * p;

  // Apply Rotation & Scale to the Vector
  const combinedX = vecX * currentExpansion;
  const combinedY = vecY * currentExpansion;

  const angleRad = (-currentRotOffset * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const finalX = currentOriginX + (combinedX * cos - combinedY * sin);
  const finalY = currentOriginY + (combinedX * sin + combinedY * cos);

  return {
    x: finalX,
    y: finalY,
    scaleX: baseScale * currentExpansion,
    scaleY: baseScale * currentExpansion,
    rotation: baseRotation - currentRotOffset,
    opacity: 1 
  };
}

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
  const isTarget = focusedConstellation?.name === data.name;
  const isFocused = isTarget; 

  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;

  // --- STATE TRACKING ---
  
  // 1. Identity of previous focus (to detect return type)
  const lastFocusStateRef = useRef<{ name: string } | null>(null);

  // 2. Geometry of previous focus (to prevent math jitter)
  const lockedFocusState = useRef<{
    focusX: number;
    focusY: number;
    worldZoom: number;
    targetRotation: number;
  } | null>(null);

  const { focusedObject, parallaxFocusData, navigateToStar } = useFocusContext();

  // Update State Refs
  useEffect(() => {
    if (focusedConstellation) {
        lastFocusStateRef.current = { name: focusedConstellation.name };
        
        if (parallaxFocusData) {
            lockedFocusState.current = {
                focusX: parallaxFocusData.unfocusedX,
                focusY: parallaxFocusData.unfocusedY,
                worldZoom: focusedConstellation.focusScale ?? 1,
                targetRotation: focusedConstellation.rotation ?? 0,
            };
        }
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
    if (!isFocused && isElevare) setElevareZoom(MIN_ZOOM);
  }, [isFocused, isElevare]);

  const groupRef = useRef<Konva.Group>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const focusScale: number = data.focusScale;
  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);

  // --- BOUNDING BOX (Standard) ---
  const hasLabels = stars.some((s) => !!s.data?.label);
  const SHOULD_MEASURE_LABELS = useExactLabelFit && hasLabels;
  const measuredExtents = (() => {
    const defaultMinX = Math.min(...xs); const defaultMaxX = Math.max(...xs);
    const defaultMinY = Math.min(...ys); const defaultMaxY = Math.max(...ys);
    if (!SHOULD_MEASURE_LABELS) return { minX: defaultMinX - boundingBoxPaddingX, maxX: defaultMaxX + boundingBoxPaddingX, minY: defaultMinY - boundingBoxPaddingY, maxY: defaultMaxY + boundingBoxPaddingY };
    return { minX: defaultMinX - boundingBoxPaddingX, maxX: defaultMaxX + boundingBoxPaddingX, minY: defaultMinY - boundingBoxPaddingY, maxY: defaultMaxY + boundingBoxPaddingY };
  })();
  const minX = measuredExtents.minX - 10;
  const maxX = measuredExtents.maxX + 10;
  const minY = measuredExtents.minY - 10;
  const maxY = measuredExtents.maxY + 10;
  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const lineSegments = connections && connections.length > 0 ? connections : stars.slice(1).map((_, i) => [i, i + 1] as [number, number]);
  const lineLengths = lineSegments.map(([i1, i2]) => getDistance(stars[i1], stars[i2]));
  const totalLineLength = lineLengths.reduce((sum, l) => sum + l, 0) || 1;
  const lineDurations = lineLengths.map((l) => (l / totalLineLength) * (totalDuration ?? DEFAULT_TOTAL_DURATION));
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
    return pathname.startsWith("/star/") && polarisDisplayState !== "active" ? windowCenter.x / 2 : windowCenter.x;
  }, [pathname, polarisDisplayState, windowCenter.x]);

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  // ========================================================================
  // ANIMATION CONTROLLERS
  // ========================================================================

  const stopAllTweens = () => {
    if (hoverTweenRef.current) { hoverTweenRef.current.destroy(); hoverTweenRef.current = null; }
    if (focusTweenRef.current) { focusTweenRef.current.destroy(); focusTweenRef.current = null; }
  };

  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node || isFocusedRef.current || isReturningRef.current) return;
    stopAllTweens();
    hoverTweenRef.current = new Konva.Tween({
      node, duration: SCALE_ANIMATION_DURATION, scaleX: toScaleX, scaleY: toScaleY, easing: EASING,
      onFinish: () => { hoverTweenRef.current = null; }
    });
    hoverTweenRef.current.play();
  };

  // 1. NEIGHBOR VANISH (Go Deep)
  const animateNeighborVanish = (targetData: NonNullable<typeof lockedFocusState.current>) => {
    const node = groupRef.current;
    if (!node) return;
    isReturningRef.current = true;
    stopAllTweens();

    const startState = calculateParallaxTransform(
        0, unfocusedConstellationX, unfocusedConstellationY, transformData.scaleX ?? 1, transformData.rotation ?? 0,
        targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, targetData.worldZoom, targetData.targetRotation
    );

    node.setAttrs({ ...startState, opacity: 1, visible: true });

    node.setAttr('animProgress', 0);
    focusTweenRef.current = new Konva.Tween({
        node,
        duration: FOCUS_ANIMATION_DURATION,
        easing: EASING,
        animProgress: 1,
        onUpdate: () => {
            const p = node.getAttr('animProgress');
            const state = calculateParallaxTransform(
                p, unfocusedConstellationX, unfocusedConstellationY, transformData.scaleX ?? 1, transformData.rotation ?? 0,
                targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, targetData.worldZoom, targetData.targetRotation
            );
            node.setAttrs({ ...state, opacity: 1 - p });
        },
        onFinish: () => {
            isReturningRef.current = false;
            node.visible(false);
            focusTweenRef.current = null; // Mark done
        }
    });
    focusTweenRef.current.play();
  };

  // 2. NEIGHBOR RETURN (Unfocus)
  const animateNeighborReturn = () => {
    const node = groupRef.current;
    if (!node) return;
    isReturningRef.current = true;
    stopAllTweens();

    const targetData = lockedFocusState.current;
    if (!targetData) {
        node.setAttrs({ x: unfocusedConstellationX, y: unfocusedConstellationY, opacity: 1, visible: true });
        isReturningRef.current = false;
        return;
    }

    // Set Initial State (p=1) -> Deep Space
    const startState = calculateParallaxTransform(
        1, unfocusedConstellationX, unfocusedConstellationY, transformData.scaleX ?? 1, transformData.rotation ?? 0,
        targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, targetData.worldZoom, targetData.targetRotation
    );

    node.setAttrs({ ...startState, opacity: 0, visible: true });

    node.setAttr('animProgress', 1);
    focusTweenRef.current = new Konva.Tween({
        node,
        duration: FOCUS_ANIMATION_DURATION,
        easing: EASING,
        animProgress: 0, // GO BACKWARDS
        onUpdate: () => {
            const p = node.getAttr('animProgress');
            const state = calculateParallaxTransform(
                p, unfocusedConstellationX, unfocusedConstellationY, transformData.scaleX ?? 1, transformData.rotation ?? 0,
                targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, targetData.worldZoom, targetData.targetRotation
            );
            node.setAttrs({ ...state, opacity: 1 - p });
        },
        onFinish: () => {
            isReturningRef.current = false;
            node.setAttrs({
                x: unfocusedConstellationX, y: unfocusedConstellationY, 
                scaleX: transformData.scaleX ?? 1, scaleY: transformData.scaleY ?? 1, 
                rotation: transformData.rotation ?? 0, opacity: 1
            });
            focusTweenRef.current = null;
        }
    });
    focusTweenRef.current.play();
  };

  // 3. TARGET FOCUS (Simple)
  const animateTargetFocus = () => {
    const node = groupRef.current;
    if (!node) return;
    isReturningRef.current = false;
    stopAllTweens();

    focusTweenRef.current = new Konva.Tween({
        node, duration: FOCUS_ANIMATION_DURATION, easing: EASING,
        x: focusedTargetX, y: windowCenter.y,
        scaleX: (transformData.scaleX ?? 1) * focusScale,
        scaleY: (transformData.scaleY ?? 1) * focusScale,
        rotation: 0,
        onFinish: () => { focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  // 4. TARGET UNFOCUS (Simple)
  const animateTargetReturn = () => {
    const node = groupRef.current;
    if (!node) return;
    isReturningRef.current = true;
    stopAllTweens();

    node.setAttrs({
        x: focusedTargetX, y: windowCenter.y,
        scaleX: (transformData.scaleX ?? 1) * (lockedFocusState.current?.worldZoom || focusScale),
        scaleY: (transformData.scaleY ?? 1) * (lockedFocusState.current?.worldZoom || focusScale),
        rotation: 0,
        visible: true, opacity: 1
    });

    focusTweenRef.current = new Konva.Tween({
        node, duration: FOCUS_ANIMATION_DURATION, easing: EASING,
        x: unfocusedConstellationX, y: unfocusedConstellationY,
        scaleX: transformData.scaleX ?? 1,
        scaleY: transformData.scaleY ?? 1,
        rotation: transformData.rotation ?? 0,
        onFinish: () => { 
            isReturningRef.current = false; 
            focusTweenRef.current = null;
        }
    });
    focusTweenRef.current.play();
  };


  // --- MAIN LAYOUT EFFECT ---
  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    // Initialization Logic: If we are not animated and not positioned, snap to Home.
    // This fixes the issue where x={0} props cause the star to appear at top-left on load.
    if (!focusTweenRef.current && !isFocused && !focusedConstellation) {
        // We check if X is 0 (approx) which means it's likely uninitialized by our logic
        // But 0 might be a valid coordinate. 
        // Safer: Just force it every render if we are in "Idle" state.
        node.setAttrs({
            x: unfocusedConstellationX,
            y: unfocusedConstellationY,
            scaleX: transformData.scaleX ?? 1,
            scaleY: transformData.scaleY ?? 1,
            rotation: transformData.rotation ?? 0,
            opacity: 1,
            visible: true
        });
    }

  }, [unfocusedConstellationX, unfocusedConstellationY, transformData, isFocused, focusedConstellation]);

  // --- TRANSITION DETECTOR ---
  useEffect(() => {
    if (isFocused) {
        animateTargetFocus();
    } else {
        if (focusedConstellation) {
            // Someone else focused -> Vanish logic handled by specific data trigger below
        } else {
            // No one focused -> Return
            if (lastFocusStateRef.current?.name === data.name) {
                animateTargetReturn();
            } else {
                animateNeighborReturn();
            }
        }
    }
  }, [isFocused, focusedConstellation]);
  
  // Specific Trigger for Parallax Data (Vanish)
  useEffect(() => {
      if (!isFocused && focusedConstellation && parallaxFocusData && !focusTweenRef.current) {
           const targetData = {
               focusX: parallaxFocusData.unfocusedX,
               focusY: parallaxFocusData.unfocusedY,
               worldZoom: focusedConstellation.focusScale ?? 1,
               targetRotation: focusedConstellation.rotation ?? 0
           };
           lockedFocusState.current = targetData; 
           animateNeighborVanish(targetData);
      }
  }, [parallaxFocusData, focusedConstellation, isFocused]);


  const { setOverlayTextContents: setTopOverlayTextContents, resetOverlayTextContents: resetTopOverlayTextContents } = useTopOverlayContext();
  const { setOverlayTextContents: setCenterOverlayTextContents } = useCenterOverlayContext();
  const { handleConstellationClick, handleInteractionStart, handleInteractionEnd } =
    useConstellationInteractions({
      isFocusedRef, isReturningRef, focusedObjectStar: focusedObject.star, transformData, brightnessHover, HOVER_SCALE, playHoverTween, onClickCallback, onHoverEnterCallback, onHoverLeaveCallback, setBrightness, setIsHovered, groupRef,
    });
  const controlWidth = 40;
  const controlX = minX - controlWidth;

  return (
    <Group
      ref={groupRef}
      // Pass STATIC props to prevent React interference. 
      // LayoutEffect handles position.
      x={0} y={0} offsetX={centerX} offsetY={centerY}
      
      onClick={handleConstellationClick} onTap={handleConstellationClick}
      onMouseEnter={handleInteractionStart} onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart} onTouchEnd={handleInteractionEnd}
    >
      {isElevare && ( <ElevareControl x={controlX} topY={minY} bottomY={maxY} currentZoom={elevareZoom} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} onZoomChange={setElevareZoom} /> )}
      {isElevare && ( <HackathonStatistics x={minX} y={maxY} width={width} /> )}
      <ConstellationContent minX={minX} maxX={maxX} minY={minY} maxY={maxY} width={width} height={height} brightness={brightness} isFocused={isFocused} isHovered={isHovered} showBoundingBox={showBoundingBox} showStarBoundingBox={showStarBoundingBox} data={data} stars={stars} lineSegments={lineSegments} lineDurations={lineDurations} lineDelays={lineDelays} isElevare={isElevare} elevareZoom={elevareZoom} onElevareZoomChange={setElevareZoom} isReturningRef={isReturningRef} isFocusedRef={isFocusedRef} pathname={pathname} focusedObject={focusedObject} mobileState={mobileState} polarisDisplayState={polarisDisplayState} setTopOverlayTextContents={setTopOverlayTextContents} resetTopOverlayTextContents={resetTopOverlayTextContents} setCenterOverlayTextContents={setCenterOverlayTextContents} navigateToStar={navigateToStar} setPolarisDisplayState={setPolarisDisplayState} />
    </Group>
  );
}

export default React.memo(Constellation, areConstellationPropsEqual);