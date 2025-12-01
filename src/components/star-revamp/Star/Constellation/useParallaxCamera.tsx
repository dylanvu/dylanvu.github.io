import { useRef, useEffect, useLayoutEffect } from 'react';
import Konva from 'konva';
import { useFocusContext } from '@/hooks/useFocusProvider';

// --- CONFIGURATION ---
const DEBUG = false; // Set to true if you need to debug coordinates again

// --- MATH HELPER: Shortest Angle Distance ---
// Ensures that rotating from 350 -> 10 goes 20 degrees, not -340 degrees.
export function interpolateRotation(start: number, end: number, t: number) {
  const diff = (end - start + 180) % 360 - 180;
  const shortestDiff = diff < -180 ? diff + 360 : diff;
  return start + shortestDiff * t;
}

// Calculate parallax layer transform with rotation-aware offset
export function calculateParallaxLayerTransform(
  t: number,
  depth: number,
  startCam: { x: number; y: number; zoom: number; rotation: number },
  endCam: { x: number; y: number; zoom: number; rotation: number },
  windowCenterX: number,
  windowCenterY: number
) {
  // 1. Interpolate Camera State (same as constellation animation!)
  const camX = startCam.x + (endCam.x - startCam.x) * t;
  const camY = startCam.y + (endCam.y - startCam.y) * t;
  const camZoom = startCam.zoom + (endCam.zoom - startCam.zoom) * t;
  const camRot = interpolateRotation(startCam.rotation, endCam.rotation, t);

  // 2. Vector from camera to "parallax origin" (the window center)
  const vecX = windowCenterX - camX;
  const vecY = windowCenterY - camY;
  
  // 3. Apply rotation to vector (this creates the curved path!)
  const angleRad = (-camRot * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const rotatedX = vecX * cos - vecY * sin;
  const rotatedY = vecX * sin + vecY * cos;
  
  // 4. Apply depth scaling
  const offsetX = rotatedX * depth;
  const offsetY = rotatedY * depth;
  
  // 5. Final position
  const finalX = windowCenterX + offsetX;
  const finalY = windowCenterY + offsetY;
  
  // 6. Scale based on depth
  const parallaxScale = 1 + (camZoom - 1) * depth;

  return {
    x: finalX,
    y: finalY,
    scaleX: parallaxScale,
    scaleY: parallaxScale,
    rotation: -camRot,
    offsetX: windowCenterX,
    offsetY: windowCenterY,
  };
}

// --- MATH HELPER: Direct Camera Transform ---
function calculateRelativeCameraTransform(
  t: number,
  nodeWorldX: number,
  nodeWorldY: number,
  baseScale: number,
  baseRotation: number,
  startFocus: { x: number; y: number; zoom: number; rotation: number },
  endFocus: { x: number; y: number; zoom: number; rotation: number },
  windowCenterX: number,
  windowCenterY: number,
  debugName?: string
) {
  // 1. Interpolate Camera State
  const camX = startFocus.x + (endFocus.x - startFocus.x) * t;
  const camY = startFocus.y + (endFocus.y - startFocus.y) * t;
  const camZoom = startFocus.zoom + (endFocus.zoom - startFocus.zoom) * t;
  
  // 2. Interpolate Rotation (Shortest Path)
  const camRot = interpolateRotation(startFocus.rotation, endFocus.rotation, t);

  // 3. Vector from Camera to Node
  const vecX = nodeWorldX - camX;
  const vecY = nodeWorldY - camY;

  // 4. Rotate Vector (World rotates opposite to Camera)
  const angleRad = (-camRot * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const rotX = vecX * cos - vecY * sin;
  const rotY = vecX * sin + vecY * cos;

  // 5. Final Screen Position
  const finalX = windowCenterX + rotX * camZoom;
  const finalY = windowCenterY + rotY * camZoom;

  if (DEBUG && debugName && (t === 0 || t === 1)) {
    console.groupCollapsed(`[Math Debug] ${debugName} (t=${t})`);
    console.log(`Cam: (${camX.toFixed(0)}, ${camY.toFixed(0)}) Rot: ${camRot.toFixed(0)}`);
    console.log(`Node: (${nodeWorldX}, ${nodeWorldY})`);
    console.log(`Screen: (${finalX.toFixed(0)}, ${finalY.toFixed(0)})`);
    console.groupEnd();
  }

  return {
    x: finalX,
    y: finalY,
    scaleX: baseScale * camZoom,
    scaleY: baseScale * camZoom,
    rotation: baseRotation - camRot, // Counter-rotate node so it appears upright if cam matches base
  };
}

// --- ORIGINAL PARALLAX MATH (Preserved) ---
function calculateParallaxTransform(
  p: number, baseX: number, baseY: number, baseScale: number, baseRotation: number,
  focusX: number, focusY: number, winCX: number, winCY: number,
  worldZoom: number, targetRotation: number, depth: number
) {
  const expansionFactor = 1 + (worldZoom - 1) * depth;
  const currentExpansion = 1 + (expansionFactor - 1) * p;
  const currentRotOffset = targetRotation * p;
  const vecX = baseX - focusX;
  const vecY = baseY - focusY;
  const curOX = focusX + (winCX - focusX) * p;
  const curOY = focusY + (winCY - focusY) * p;
  const combinedX = vecX * currentExpansion;
  const combinedY = vecY * currentExpansion;
  const angleRad = (-currentRotOffset * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: curOX + (combinedX * cos - combinedY * sin),
    y: curOY + (combinedX * sin + combinedY * cos),
    scaleX: baseScale * currentExpansion,
    scaleY: baseScale * currentExpansion,
    rotation: baseRotation - currentRotOffset,
    opacity: 1
  };
}

// --- INTERFACE ---
interface UseParallaxCameraProps {
  nodeRef: React.RefObject<Konva.Group | null>; 
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
  parallaxData,
  depth = 3.5,
  duration = 0.5,
  onFocusComplete
}: UseParallaxCameraProps) => {

  const { focusedObject } = useFocusContext();
  const focusedGlobalId = focusedObject.constellation?.name

  const targetY = focusedTargetY ?? windowCenter.y;
  const focusTweenRef = useRef<Konva.Tween | null>(null);
  const EASING = Konva.Easings.EaseInOut;

  const prevGlobalIdRef = useRef<string | undefined>(null);
  const prevParallaxDataRef = useRef(parallaxData);
  const lastFocusedPositionRef = useRef<{ x: number; y: number } | null>(null);

  const getNode = (): Konva.Node | null => nodeRef.current as Konva.Node | null;

  const stopTween = () => {
    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
      focusTweenRef.current = null;
    }
  };

  // Initialize position on mount - runs before first paint
  useLayoutEffect(() => {
    const node = getNode();
    if (node && !isFocused && !focusedGlobalId) {
      node.setAttrs({
        x: unfocusedX,
        y: unfocusedY,
        scaleX: baseScale,
        scaleY: baseScale,
        rotation: baseRotation,
        opacity: 1,
        visible: true
      });
    }
  }, []); // Run once on mount

  // --- ANIMATIONS ---

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

  // --- HOP IN (I am the Destination) ---
  const animateHopToFocus = (oldFocus: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    // Start: Camera at Old Focus
    const startCam = { 
      x: oldFocus.worldX, 
      y: oldFocus.worldY, 
      zoom: oldFocus.worldZoom, 
      rotation: oldFocus.targetRotation 
    };
    
    // End: Camera at ME.
    // To make ME appear upright (Node Rotation 0) while I have 'baseRotation',
    // the Camera must rotate by 'baseRotation'.
    const endCam = { 
      x: unfocusedX, 
      y: unfocusedY, 
      zoom: focusScale, 
      rotation: baseRotation 
    };

    // Force Start State Immediately (Prevents Snapping)
    const startState = calculateRelativeCameraTransform(
      0, unfocusedX, unfocusedY, baseScale, baseRotation, startCam, endCam, windowCenter.x, windowCenter.y, `HopIn-${identityId}`
    );
    node.setAttrs({ ...startState, visible: true, opacity: 0 }); 

    node.setAttr('animProgress', 0);
    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 1,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateRelativeCameraTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation, startCam, endCam, windowCenter.x, windowCenter.y
        );
        node.setAttrs({ ...state, opacity: p });
      },
      onFinish: () => {
        lastFocusedPositionRef.current = { x: focusedTargetX, y: targetY };
        focusTweenRef.current = null;
        onFocusComplete?.();
      }
    });
    focusTweenRef.current.play();
  };

  // --- HOP OUT (I am the Origin) ---
  const animateHopFromFocus = (newFocus: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();

    // Start: Camera at ME
    const startCam = { 
      x: unfocusedX, 
      y: unfocusedY, 
      zoom: focusScale, 
      rotation: baseRotation 
    };
    
    // End: Camera at New Focus
    const endCam = { 
      x: newFocus.worldX, 
      y: newFocus.worldY, 
      zoom: newFocus.worldZoom, 
      rotation: newFocus.targetRotation 
    };

    // Force Start State Immediately
    const startState = calculateRelativeCameraTransform(
      0, unfocusedX, unfocusedY, baseScale, baseRotation, startCam, endCam, windowCenter.x, windowCenter.y, `HopOut-${identityId}`
    );
    node.setAttrs({ ...startState, visible: true, opacity: 1 });

    node.setAttr('animProgress', 0);
    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 1,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateRelativeCameraTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation, startCam, endCam, windowCenter.x, windowCenter.y
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

  // --- PEER SWITCH (I am a neighbor) ---
  const animatePeerSwitch = (oldFocus: NonNullable<typeof parallaxData>, newFocus: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node || !node.visible()) return;
    stopTween();

    const startCam = { x: oldFocus.worldX, y: oldFocus.worldY, zoom: oldFocus.worldZoom, rotation: oldFocus.targetRotation };
    const endCam = { x: newFocus.worldX, y: newFocus.worldY, zoom: newFocus.worldZoom, rotation: newFocus.targetRotation };

    const startState = calculateRelativeCameraTransform(0, unfocusedX, unfocusedY, baseScale, baseRotation, startCam, endCam, windowCenter.x, windowCenter.y);
    node.setAttrs({ ...startState, visible: true });

    node.setAttr('animProgress', 0);
    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 1,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateRelativeCameraTransform(
          p, unfocusedX, unfocusedY, baseScale, baseRotation, startCam, endCam, windowCenter.x, windowCenter.y
        );
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => { node.visible(false); focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  const animateNeighborVanish = (targetData: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();
    node.setAttrs({ x: unfocusedX, y: unfocusedY, scaleX: baseScale, scaleY: baseScale, rotation: baseRotation, opacity: 1, visible: true });
    
    node.setAttr('animProgress', 0);
    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 1,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateParallaxTransform(p, unfocusedX, unfocusedY, baseScale, baseRotation, targetData.worldX, targetData.worldY, windowCenter.x, windowCenter.y, targetData.worldZoom, targetData.targetRotation, depth);
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => { node.visible(false); focusTweenRef.current = null; }
    });
    focusTweenRef.current.play();
  };

  const animateNeighborReturn = (fromData: NonNullable<typeof parallaxData>) => {
    const node = getNode();
    if (!node) return;
    stopTween();
    node.visible(true);
    node.setAttr('animProgress', 1);

    focusTweenRef.current = new Konva.Tween({
      node, duration, easing: EASING,
      animProgress: 0,
      onUpdate: () => {
        const p = node.getAttr('animProgress');
        const state = calculateParallaxTransform(p, unfocusedX, unfocusedY, baseScale, baseRotation, fromData.worldX, fromData.worldY, windowCenter.x, windowCenter.y, fromData.worldZoom, fromData.targetRotation, depth);
        node.setAttrs({ ...state, opacity: 1 - p });
      },
      onFinish: () => {
        node.setAttrs({ x: unfocusedX, y: unfocusedY, scaleX: baseScale, scaleY: baseScale, rotation: baseRotation, opacity: 1 });
        focusTweenRef.current = null;
      }
    });
    focusTweenRef.current.play();
  };

  useEffect(() => {
    const prevId = prevGlobalIdRef.current;
    const prevData = prevParallaxDataRef.current;
    const isHop = !!(prevId && focusedGlobalId && prevId !== focusedGlobalId);

    if (isFocused) {
      if (isHop && prevData) {
        animateHopToFocus(prevData);
      } else {
        animateTargetFocus();
      }
    } else {
      if (focusedGlobalId) {
        if (prevId === identityId && parallaxData) {
          animateHopFromFocus(parallaxData);
        } else if (isHop && prevData && parallaxData) {
          const node = getNode();
          if (node && node.visible()) {
            animatePeerSwitch(prevData, parallaxData);
          }
        } else if (parallaxData && !focusTweenRef.current) {
          const node = getNode();
          if (node && node.visible()) {
            animateNeighborVanish(parallaxData);
          }
        }
      } else {
        if (prevId === identityId) {
          animateTargetReturn();
        } else if (prevData) {
          animateNeighborReturn(prevData);
        } else {
          const node = getNode();
          if(node) node.setAttrs({ x: unfocusedX, y: unfocusedY, opacity: 1, visible: true });
        }
      }
    }

    prevGlobalIdRef.current = focusedGlobalId;
    prevParallaxDataRef.current = focusedGlobalId ? parallaxData : null;  // Clear when no focus
    // we must include focusedTargetX and targetY target coords to re-animate when focus position changes
  }, [isFocused, focusedGlobalId, parallaxData, identityId, focusedTargetX, targetY]);

  return {
    // we can check the current to see if it is currently animating or not
    animationTweenRef: focusTweenRef
  };
};
