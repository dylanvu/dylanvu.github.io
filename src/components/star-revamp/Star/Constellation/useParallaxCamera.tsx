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
// We use "any" for the RefObject generic to accept RefObject<Group>, RefObject<Shape>, etc.
// Casting occurs inside the hook.
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
  
  // Global State
  isFocused: boolean;        
  focusedGlobalId: string | null; 
  
  // Data about the CURRENTLY focused item
  parallaxData: { 
    worldX: number;
    worldY: number;
    worldZoom: number;
    targetRotation: number;
  } | null;
  
  depth?: number;            
  duration?: number;         
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
  isFocused,
  focusedGlobalId,
  parallaxData,
  depth = 3.5,
  duration = 0.5
}: UseParallaxCameraProps) => {

  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const EASING = Konva.Easings.EaseInOut;

  const lastFocusStateRef = useRef<{ id: string } | null>(null);
  const lockedFocusState = useRef<{
    focusX: number;
    focusY: number;
    worldZoom: number;
    targetRotation: number;
  } | null>(null);

  useEffect(() => {
    if (focusedGlobalId) {
      lastFocusStateRef.current = { id: focusedGlobalId };
      if (parallaxData) {
        lockedFocusState.current = {
          focusX: parallaxData.worldX,
          focusY: parallaxData.worldY,
          worldZoom: parallaxData.worldZoom,
          targetRotation: parallaxData.targetRotation,
        };
      }
    }
  }, [focusedGlobalId, parallaxData]);

  // Safe getter for Konva Node
  const getNode = (): Konva.Node | null => {
    return nodeRef.current as Konva.Node | null;
  };

  const stopTween = () => {
    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
      focusTweenRef.current = null;
    }
  };

  // A. TARGET FOCUS
  const animateTargetFocus = () => {
    const node = getNode();
    if (!node) return;
    stopTween();

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: focusedTargetX, 
      y: windowCenter.y,
      scaleX: baseScale * focusScale,
      scaleY: baseScale * focusScale,
      rotation: 0,
      onFinish: () => { focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  // B. TARGET RETURN
  const animateTargetReturn = () => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const startZoom = lockedFocusState.current?.worldZoom || focusScale;
    
    node.setAttrs({
      x: focusedTargetX, y: windowCenter.y,
      scaleX: baseScale * startZoom,
      scaleY: baseScale * startZoom,
      rotation: 0,
      visible: true, opacity: 1
    });

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      x: unfocusedX, y: unfocusedY,
      scaleX: baseScale, scaleY: baseScale,
      rotation: baseRotation,
      onFinish: () => { focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  // C. NEIGHBOR VANISH
  const animateNeighborVanish = (targetData: NonNullable<typeof lockedFocusState.current>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const startState = calculateParallaxTransform(
      0, unfocusedX, unfocusedY, baseScale, baseRotation,
      targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, 
      targetData.worldZoom, targetData.targetRotation, depth
    );

    node.setAttrs({ ...startState, opacity: 1, visible: true });
    node.setAttr('animProgress', 0);

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 1,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateParallaxTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation,
          targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, 
          targetData.worldZoom, targetData.targetRotation, depth
        );
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => {
        node.visible(false);
        focusTweenRef.current = null;
      }
    });
    focusTweenRef.current.play();
  };

  // D. NEIGHBOR RETURN
  const animateNeighborReturn = () => {
    const node = getNode();
    if (!node) return;
    stopTween();

    const targetData = lockedFocusState.current;
    if (!targetData) {
      node.setAttrs({ x: unfocusedX, y: unfocusedY, opacity: 1, visible: true });
      return;
    }

    const startState = calculateParallaxTransform(
      1, unfocusedX, unfocusedY, baseScale, baseRotation,
      targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, 
      targetData.worldZoom, targetData.targetRotation, depth
    );

    node.setAttrs({ ...startState, opacity: 0, visible: true });
    node.setAttr('animProgress', 1);

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 0,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateParallaxTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation,
          targetData.focusX, targetData.focusY, windowCenter.x, windowCenter.y, 
          targetData.worldZoom, targetData.targetRotation, depth
        );
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => {
        node.setAttrs({
          x: unfocusedX, y: unfocusedY,
          scaleX: baseScale, scaleY: baseScale,
          rotation: baseRotation,
          opacity: 1
        });
        focusTweenRef.current = null;
      }
    });
    focusTweenRef.current.play();
  };

  // --- TRIGGERS ---

  useEffect(() => {
    if (isFocused) {
      animateTargetFocus();
    } else {
      if (focusedGlobalId) {
        // Handled by parallaxData trigger
      } else {
        if (lastFocusStateRef.current?.id === identityId) {
          animateTargetReturn();
        } else {
          animateNeighborReturn();
        }
      }
    }
  }, [isFocused, focusedGlobalId, identityId]); 

  useEffect(() => {
    if (!isFocused && focusedGlobalId && parallaxData && !focusTweenRef.current) {
      const targetData = {
        focusX: parallaxData.worldX,
        focusY: parallaxData.worldY,
        worldZoom: parallaxData.worldZoom,
        targetRotation: parallaxData.targetRotation
      };
      lockedFocusState.current = targetData;
      animateNeighborVanish(targetData);
    }
  }, [parallaxData, focusedGlobalId, isFocused]);

  useLayoutEffect(() => {
    const node = getNode();
    if (!node) return;

    if (!focusTweenRef.current && !isFocused && !focusedGlobalId) {
       node.setAttrs({
         x: unfocusedX, y: unfocusedY,
         scaleX: baseScale, scaleY: baseScale,
         rotation: baseRotation,
         opacity: 1, visible: true
       });
    }
  }, [unfocusedX, unfocusedY, baseScale, baseRotation, isFocused, focusedGlobalId]);

  return {
    stopTweens: stopTween,
    isAnimatingOrFocused: !!focusTweenRef.current || isFocused || !!focusedGlobalId
  };
};