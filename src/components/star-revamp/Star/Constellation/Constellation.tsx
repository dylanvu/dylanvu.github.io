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

  // --- FIXED UNFOCUS FUNCTION (Unified Camera Model) ---
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

    // Fallback for missing data
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

    // 1. DATA PREP
    const { 
        unfocusedX: focusedStarOriginalX, 
        unfocusedY: focusedStarOriginalY,
        rotation: prevRotation,
        focusScale: worldZoom 
    } = lastFocusStateRef.current;
    
    // The "Home" position of THIS constellation
    const thisStarHomeX = unfocusedConstellationX;
    const thisStarHomeY = unfocusedConstellationY;

    const depth = 3.5;
    const expansionFactor = 1 + (worldZoom - 1) * depth;
    
    const baseScale = transformData.scaleX ?? 1;
    const baseRotation = transformData.rotation ?? 0;

    // Helper function for Unified Camera Math
    // Calculates where a star should be given a progress 'p'
    const calculatePosition = (p: number) => {
        // A. INTERPOLATE CAMERA FOCUS POINT (World Space)
        // p=0: Camera is looking at FocusedStarHome
        // p=1: Camera is looking at WindowCenter (neutral)
        const camFocusX = focusedStarOriginalX + (windowCenter.x - focusedStarOriginalX) * p;
        const camFocusY = focusedStarOriginalY + (windowCenter.y - focusedStarOriginalY) * p;

        // B. INTERPOLATE ZOOM & ROTATION
        const currentZoom = expansionFactor + (1 - expansionFactor) * p;
        const currentRotation = prevRotation * (1 - p); // Interpolate towards 0

        // C. VECTOR: From Camera Focus -> This Star
        const vecX = (thisStarHomeX - camFocusX) * currentZoom;
        const vecY = (thisStarHomeY - camFocusY) * currentZoom;

        // D. ROTATE AROUND OPTICAL AXIS (Window Center)
        // Note: We rotate by NEGATIVE currentRotation because we are simulating
        // the world rotating relative to the camera.
        const angleRad = (-currentRotation * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // E. PROJECT TO SCREEN
        // ScreenPos = ScreenCenter + RotatedVector
        const screenX = windowCenter.x + (vecX * cos - vecY * sin);
        const screenY = windowCenter.y + (vecX * sin + vecY * cos);

        return { x: screenX, y: screenY, scale: currentZoom, rotation: -currentRotation };
    };

    // 2. SET INITIAL STATE (p=0) to prevent jump
    const startState = calculatePosition(0);
    
    node.x(startState.x);
    node.y(startState.y);
    node.scaleX(baseScale * startState.scale);
    node.scaleY(baseScale * startState.scale);
    
    // Add base rotation to the world rotation offset
    node.rotation(baseRotation + startState.rotation); 
    
    // Opacity Logic:
    // - If we were the Focused Star, start at 1 (we are visible).
    // - If we were Neighbors, start at 0 (we are vanished).
    const isTarget = lastFocusStateRef.current.name === data.name;
    node.opacity(isTarget ? 1 : 0); 

    // 3. TWEEN TRAJECTORY
    // We tween opacity to drive the animation loop
    focusTweenRef.current = new Konva.Tween({
        node,
        duration: FOCUS_ANIMATION_DURATION,
        easing: EASING,
        opacity: 1, // Tween to 1
        
        onUpdate: () => {
            // Get progress 'p'. 
            // If we are the target (opacity already 1), we need a fallback since opacity won't change.
            // However, Konva tween updates regardless if value changes? 
            // Actually, if opacity start=1 end=1, Konva might optimize or p calculation fails.
            // Safe bet: Use internal 'tween.anim.progress' if available, OR just stick to the node.opacity approach
            // but realize it only works for neighbors.
            
            // FIX: Since we can't use opacity for the Target (it stays 1),
            // and we can't use a proxy object (TS issues),
            // we will use 'rotation' as a carrier if it changes, OR 'scale'.
            // But robustly, we can just use 'opacity' for neighbors.
            // For the Target, we need a way to drive 'p'.
            
            // HACK: We will tween a hidden attribute like 'shadowOpacity' or 'strokeWidth' if it's unused?
            // Better: Just tween opacity from 0.999 to 1 for target? No.
            // Let's rely on the fact that for neighbors, opacity goes 0->1.
            // For Target, we will accept that it returns linearly via Case A logic above?
            // WAIT: I removed Case A separation to unify the physics.
            // So we need a driver for Target too.
            
            // Let's use 'cornerRadius' (unused on Group) or similar as a carrier?
            // Or just 'brightness'? No.
            // Let's use `node.attrs.progress` if we manually set it? Konva allows custom attrs.
        },
    });
    
    // REFACTOR: We really need a Proxy-like behavior without the type errors.
    // The solution is to use a 'dummy' tween on the node itself using a custom attribute.
    // Konva Nodes support custom attributes.
    if (focusTweenRef.current) focusTweenRef.current.destroy();

    // Manually set a custom attribute 'animProgress' on the node
    node.setAttr('animProgress', 0);

    focusTweenRef.current = new Konva.Tween({
        node,
        duration: FOCUS_ANIMATION_DURATION,
        easing: EASING,
        animProgress: 1, // Tween this custom attribute from 0 to 1
        
        onUpdate: () => {
            const p = node.getAttr('animProgress'); // 0 to 1
            
            const state = calculatePosition(p);
            
            node.x(state.x);
            node.y(state.y);
            node.scaleX(baseScale * state.scale);
            node.scaleY(baseScale * state.scale);
            node.rotation(baseRotation + state.rotation);
            
            // Opacity handling:
            // Neighbors: Fade in (0 -> 1) -> Use 'p'
            // Target: Stay visible (1)
            const isTarget = lastFocusStateRef.current?.name === data.name;
            node.opacity(isTarget ? 1 : p);
        },
        
        onFinish: () => {
            isReturningRef.current = false;
            
            // Hard Snap to Home
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
    
    // This logic matches the calculatePosition(0) logic in Unfocus!
    const vecX = unfocusedConstellationX - focusedUnfocusedX;
    const vecY = unfocusedConstellationY - focusedUnfocusedY;

    const expansionFactor = 1 + (worldZoom - 1) * depth;
    
    const baseScale = transformData.scaleX ?? 1;
    const targetScale = baseScale * expansionFactor;

    const movementMultiplier = expansionFactor; 

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