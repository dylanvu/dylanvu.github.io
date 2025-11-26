import { useRef, useEffect, useLayoutEffect } from 'react';
import Konva from 'konva';

// --- PURE MATH: Unified Camera Transform ---
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
  targetRotation: number,
  depth: number = 3.5
) {
  if (p === 0) {
    return {
      x: baseX,
      y: baseY,
      scaleX: baseScale,
      scaleY: baseScale,
      rotation: baseRotation,
      opacity: 1
    };
  }

  const expansionFactor = 1 + (worldZoom - 1) * depth;
  const currentExpansion = 1 + (expansionFactor - 1) * p;
  const currentRotOffset = targetRotation * p;

  const vecX = baseX - focusX;
  const vecY = baseY - focusY;

  const currentOriginX = focusX + (windowCenterX - focusX) * p;
  const currentOriginY = focusY + (windowCenterY - focusY) * p;

  const combinedX = vecX * currentExpansion;
  const combinedY = vecY * currentExpansion;

  const angleRad = (-currentRotOffset * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  return {
    x: currentOriginX + (combinedX * cos - combinedY * sin),
    y: currentOriginY + (combinedX * sin + combinedY * cos),
    scaleX: baseScale * currentExpansion,
    scaleY: baseScale * currentExpansion,
    rotation: baseRotation - currentRotOffset,
    opacity: 1 
  };
}

// --- INTERFACE ---
interface UseParallaxCameraProps {
  nodeRef: React.RefObject<any>; 
  identityId: string;        
  unfocusedX: number;        
  unfocusedY: number;        
  baseScale?: number;
  baseRotation?: number;
  focusScale: number;        
  windowCenter: { x: number; y: number };
  focusedTargetX: number;
  focusedTargetY?: number;
  
  isFocused: boolean;        
  focusedGlobalId: string | null; 
  
  parallaxData: { 
    worldX: number;
    worldY: number;
    worldZoom: number;
    targetRotation: number;
  } | null;
  
  depth?: number;            
  duration?: number;
  onFocusComplete?: () => void;
}

export const useParallaxCamera = ({
  nodeRef,
  identityId,
  unfocusedX,
  unfocusedY,
  baseScale = 1,
  baseRotation = 0,
  focusScale,
  windowCenter,
  focusedTargetX,
  focusedTargetY,
  isFocused,
  focusedGlobalId,
  parallaxData,
  depth = 3.5,
  duration = 0.5,
  onFocusComplete
}: UseParallaxCameraProps) => {

  const targetY = focusedTargetY ?? windowCenter.y;
  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const EASING = Konva.Easings.EaseInOut;

  // Track Previous State
  const prevGlobalIdRef = useRef<string | null>(null);
  const prevParallaxDataRef = useRef(parallaxData);
  const lastFocusedPositionRef = useRef<{ x: number; y: number } | null>(null);

  const getNode = (): Konva.Node | null => {
    return nodeRef.current as Konva.Node | null;
  };

  const stopTween = () => {
    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
      focusTweenRef.current = null;
    }
  };

  // --- ANIMATION ROUTINES ---

  // A. TARGET FOCUS (Home -> Center)
  const animateTargetFocus = () => {
    const node = getNode();
    if (!node) return;
    stopTween();

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: focusedTargetX, y: targetY,
      scaleX: baseScale * focusScale,
      scaleY: baseScale * focusScale,
      rotation: 0, opacity: 1,
      onFinish: () => { 
        lastFocusedPositionRef.current = { x: focusedTargetX, y: targetY };
        focusTweenRef.current = null;
        onFocusComplete?.();
      }
    });
    focusTweenRef.current.play();
  };

  // B. TARGET RETURN (Center -> Home)
  const animateTargetReturn = () => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const snapX = lastFocusedPositionRef.current?.x ?? focusedTargetX;
    const snapY = lastFocusedPositionRef.current?.y ?? targetY;
    
    node.setAttrs({ x: snapX, y: snapY, rotation: 0, visible: true, opacity: 1 });

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: unfocusedX, y: unfocusedY,
      scaleX: baseScale, scaleY: baseScale,
      rotation: baseRotation,
      onFinish: () => { 
        lastFocusedPositionRef.current = null;
        focusTweenRef.current = null; 
      }
    });
    focusTweenRef.current.play();
  };

  // C. NEIGHBOR VANISH (Home -> Parallax Offset)
  const animateNeighborVanish = (targetData: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    // Force home state start
    node.setAttrs({ 
      x: unfocusedX, y: unfocusedY, 
      scaleX: baseScale, scaleY: baseScale, 
      rotation: baseRotation, opacity: 1, visible: true 
    });

    node.setAttr('animProgress', 0);

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 1,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateParallaxTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation,
          targetData.worldX, targetData.worldY, windowCenter.x, windowCenter.y, 
          targetData.worldZoom, targetData.targetRotation, depth
        );
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => { node.visible(false); focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  // D. NEIGHBOR RETURN (Parallax Offset -> Home)
  const animateNeighborReturn = (fromData: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    node.setAttr('animProgress', 1);
    node.visible(true);

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 0,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateParallaxTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation,
          fromData.worldX, fromData.worldY, windowCenter.x, windowCenter.y, 
          fromData.worldZoom, fromData.targetRotation, depth
        );
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => {
        node.setAttrs({
          x: unfocusedX, y: unfocusedY, scaleX: baseScale, scaleY: baseScale,
          rotation: baseRotation, opacity: 1
        });
        focusTweenRef.current = null;
      }
    });
    focusTweenRef.current.play();
  };

  // E. PEER SWITCH (Offset A -> Offset B)
  const animatePeerSwitch = (
    oldFocus: NonNullable<typeof parallaxData>, 
    newFocus: NonNullable<typeof parallaxData>
  ) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const startState = calculateParallaxTransform(
      1, unfocusedX, unfocusedY, baseScale, baseRotation,
      oldFocus.worldX, oldFocus.worldY, windowCenter.x, windowCenter.y, 
      oldFocus.worldZoom, oldFocus.targetRotation, depth
    );

    const endState = calculateParallaxTransform(
      1, unfocusedX, unfocusedY, baseScale, baseRotation,
      newFocus.worldX, newFocus.worldY, windowCenter.x, windowCenter.y, 
      newFocus.worldZoom, newFocus.targetRotation, depth
    );

    node.setAttrs({ ...startState, visible: true, opacity: 0 }); 

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: endState.x, y: endState.y,
      scaleX: endState.scaleX, scaleY: endState.scaleY,
      rotation: endState.rotation,
      opacity: 0,
      onFinish: () => { focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  // F. HOP IN (Offset A -> Center)
  const animateHopToFocus = (oldFocus: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const startState = calculateParallaxTransform(
      1, unfocusedX, unfocusedY, baseScale, baseRotation,
      oldFocus.worldX, oldFocus.worldY, windowCenter.x, windowCenter.y, 
      oldFocus.worldZoom, oldFocus.targetRotation, depth
    );

    node.setAttrs({ ...startState, visible: true, opacity: 0 });

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: focusedTargetX, y: targetY,
      scaleX: baseScale * focusScale,
      scaleY: baseScale * focusScale,
      rotation: 0, opacity: 1,
      onFinish: () => {
        lastFocusedPositionRef.current = { x: focusedTargetX, y: targetY };
        focusTweenRef.current = null;
        onFocusComplete?.();
      }
    });
    focusTweenRef.current.play();
  };

  // G. HOP OUT (Center -> Offset B)
  const animateHopFromFocus = (newFocus: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const snapX = lastFocusedPositionRef.current?.x ?? focusedTargetX;
    const snapY = lastFocusedPositionRef.current?.y ?? targetY;
    
    node.setAttrs({ 
      x: snapX, y: snapY, 
      scaleX: baseScale * focusScale, scaleY: baseScale * focusScale, 
      rotation: 0, opacity: 1, visible: true 
    });

    const endState = calculateParallaxTransform(
      1, unfocusedX, unfocusedY, baseScale, baseRotation,
      newFocus.worldX, newFocus.worldY, windowCenter.x, windowCenter.y, 
      newFocus.worldZoom, newFocus.targetRotation, depth
    );

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: endState.x, y: endState.y,
      scaleX: endState.scaleX, scaleY: endState.scaleY,
      rotation: endState.rotation,
      opacity: 0,
      onFinish: () => { node.visible(false); focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  // --- TRIGGER LOGIC ---
  useEffect(() => {
    const prevId = prevGlobalIdRef.current;
    const prevData = prevParallaxDataRef.current;
    const isHop = !!(prevId && focusedGlobalId && prevId !== focusedGlobalId);

    if (isFocused) {
      // 1. I AM THE TARGET
      if (isHop && prevData) {
        animateHopToFocus(prevData);
      } else {
        animateTargetFocus();
      }
    } else {
      // 2. I AM NOT THE TARGET
      if (focusedGlobalId) {
        if (prevId === identityId && parallaxData) {
          // A. I WAS the target -> Become Neighbor (Hop Out)
          animateHopFromFocus(parallaxData);
        } else if (isHop && prevData && parallaxData) {
          // B. Peer Switch (Focus A -> Focus B)
          animatePeerSwitch(prevData, parallaxData);
        } else if (parallaxData && !focusTweenRef.current) {
          // C. Standard Vanish / Late Data Fix
          // If I am visible (at home) and have no tween, I need to vanish.
          // This catches the Initial Click where data might be 1 frame late.
          const node = getNode();
          if (node && node.visible()) {
            animateNeighborVanish(parallaxData);
          }
        }
      } else {
        // 3. NO ONE IS FOCUSED (Return to Home)
        if (prevId === identityId) {
          animateTargetReturn();
        } else if (prevData) {
          animateNeighborReturn(prevData);
        } else {
          // Fallback reset
          const node = getNode();
          if(node) node.setAttrs({ x: unfocusedX, y: unfocusedY, opacity: 1, visible: true });
        }
      }
    }

    // Update Refs
    prevGlobalIdRef.current = focusedGlobalId;
    prevParallaxDataRef.current = parallaxData;

  }, [isFocused, focusedGlobalId, parallaxData, identityId]);

  useLayoutEffect(() => {
    const node = getNode();
    if (!node || focusTweenRef.current) return;

    if (!isFocused && !focusedGlobalId) {
       node.setAttrs({
         x: unfocusedX, y: unfocusedY,
         scaleX: baseScale, scaleY: baseScale,
         rotation: baseRotation,
         opacity: 1, visible: true
       });
    }
  }, []);

  return {
    stopTweens: stopTween,
    isAnimatingOrFocused: !!focusTweenRef.current || isFocused || !!focusedGlobalId
  };
};