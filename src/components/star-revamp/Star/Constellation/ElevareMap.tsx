import Konva from "konva";
import { Group, Shape, Rect } from "react-konva";
import { useState, useRef, useEffect, useCallback, ReactNode, createContext } from "react";
import { US_MAP_SIMPLE } from "../us_map";
import { SPACE_TEXT_COLOR, hexToRgba } from "@/app/theme";

// Context to provide map scale to child components
export const MapScaleContext = createContext<number>(1);

// Shared zoom constants - exported for use in Constellation
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;

interface ElevareMapProps {
  children: ReactNode;
  isFocused: boolean;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  boundingBoxCenter: {
    x: number;
    y: number;
  };
  constellationBoundingBoxWidth: number;
  constellationBoundingBoxHeight: number;
  externalZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export default function ElevareMap({ children, isFocused, boundingBox, boundingBoxCenter, constellationBoundingBoxWidth, constellationBoundingBoxHeight, externalZoom, onZoomChange }: ElevareMapProps) {
  const [mapScale, setMapScale] = useState(MIN_ZOOM);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const lastDistRef = useRef(0);
  const innerGroupRef = useRef<Konva.Group>(null);
  const backgroundShapeRef = useRef<Konva.Shape>(null);
  const fadeAnimationRef = useRef<Konva.Tween | null>(null);
  const resetTweenRef = useRef<Konva.Tween | null>(null);

  // Native wheel event listener - bypasses Konva event system
  useEffect(() => {
    if (!isFocused) return;

    const node = innerGroupRef.current;
    if (!node) return;

    const stage = node.getStage();
    if (!stage) return;

    const canvas = stage.container();
    if (!canvas) return;

    const handleNativeWheel = (evt: WheelEvent) => {
      evt.preventDefault();

      const scaleBy = 1.1;
      const oldScale = mapScale;

      const newScale = evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

      const stagePointer = stage.getPointerPosition();
      if (!stagePointer) return;

      // Convert stage pointer to parent's coordinate space
      const parent = node.getParent();
      if (!parent) return;

      const parentTransform = parent.getAbsoluteTransform().copy();
      parentTransform.invert();
      const pointer = parentTransform.point(stagePointer);

      // Classic zoom-to-point algorithm
      const contentPoint = {
        x: (pointer.x - mapOffset.x) / oldScale,
        y: (pointer.y - mapOffset.y) / oldScale,
      };

      const newOffset = {
        x: pointer.x - contentPoint.x * clampedScale,
        y: pointer.y - contentPoint.y * clampedScale,
      };

      setMapScale(clampedScale);
      setMapOffset(newOffset);

      if (onZoomChange) {
        onZoomChange(clampedScale);
      }
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [isFocused, mapScale, mapOffset, onZoomChange]);

  const handleDragStart = useCallback(() => {
    if (!isFocused) return;
    document.body.style.cursor = "grabbing";
  }, [isFocused]);

  const handleDragMove = useCallback(() => {
    if (!isFocused) return;
    const node = innerGroupRef.current;
    if (!node) return;
    setMapOffset({ x: node.x(), y: node.y() });
  }, [isFocused]);

  const handleDragEnd = useCallback(() => {
    if (!isFocused) return;
    document.body.style.cursor = "grab";
  }, [isFocused]);

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (!isFocused) return;
      if (e.evt.touches.length !== 2) return;

      e.evt.preventDefault();
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      const dist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastDistRef.current === 0) {
        lastDistRef.current = dist;
        return;
      }

      const scale = mapScale * (dist / lastDistRef.current);
      const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

      setMapScale(clampedScale);
      lastDistRef.current = dist;
    },
    [isFocused, mapScale]
  );

  const handleTouchEnd = useCallback(() => {
    lastDistRef.current = 0;
  }, []);

  // Programmatic zoom control (from ElevareControl)
  // Update internal zoom when external zoom changes, centering around bounding box
  // Only trigger on externalZoom changes, not on internal mapScale changes
  useEffect(() => {
    if (externalZoom !== undefined && externalZoom !== mapScale) {
      const oldScale = mapScale;
      const newScale = externalZoom;
      
      // Calculate the current screen position of the bounding box center
      const screenX = mapOffset.x + boundingBoxCenter.x * oldScale;
      const screenY = mapOffset.y + boundingBoxCenter.y * oldScale;
      
      // Calculate new offset to keep the bounding box center at the same screen position
      const newOffset = {
        x: screenX - boundingBoxCenter.x * newScale,
        y: screenY - boundingBoxCenter.y * newScale
      };
      
      setMapScale(newScale);
      setMapOffset(newOffset);
    }
  }, [externalZoom]); // Only depend on externalZoom, not mapScale!

  // Reset on unfocus with smooth tween animation
  useEffect(() => {
    const node = innerGroupRef.current;
    if (!node) return;

    if (!isFocused) {
      // Cancel any existing reset animation
      if (resetTweenRef.current) {
        resetTweenRef.current.destroy();
        resetTweenRef.current = null;
      }

      resetTweenRef.current = new Konva.Tween({
        node,
        duration: 0.5,
        x: 0,
        y: 0,
        scaleX: MIN_ZOOM,
        scaleY: MIN_ZOOM,
        easing: Konva.Easings.EaseInOut,
        onUpdate: () => {
          // Update React state during animation to keep everything in sync
          const currentScale = node.scaleX();
          const currentPos = { x: node.x(), y: node.y() };
          
          setMapScale(currentScale);
          setMapOffset(currentPos);
          
          if (onZoomChange) {
            onZoomChange(currentScale);
          }
        },
        onFinish: () => {
          // Ensure final state is exact
          setMapScale(MIN_ZOOM);
          setMapOffset({ x: 0, y: 0 });
          if (onZoomChange) {
            onZoomChange(MIN_ZOOM);
          }
          
          if (resetTweenRef.current) {
            resetTweenRef.current.destroy();
            resetTweenRef.current = null;
          }
        },
      });

      resetTweenRef.current.play();
    } else {
      // If focusing, cancel any ongoing reset animation
      if (resetTweenRef.current) {
        resetTweenRef.current.destroy();
        resetTweenRef.current = null;
      }
    }

    return () => {
      if (resetTweenRef.current) {
        resetTweenRef.current.destroy();
        resetTweenRef.current = null;
      }
    };
  }, [isFocused, onZoomChange]);

  // Fade animation for subtle background fill
  useEffect(() => {
    const node = backgroundShapeRef.current;
    if (!node) return;

    // Cancel any existing animation
    if (fadeAnimationRef.current) {
      fadeAnimationRef.current.destroy();
      fadeAnimationRef.current = null;
    }

    const targetOpacity = isFocused ? 1 : 0;
    
    fadeAnimationRef.current = new Konva.Tween({
      node,
      duration: 0.5,
      opacity: targetOpacity,
      easing: Konva.Easings.EaseInOut,
      onUpdate: () => {
        setBackgroundOpacity(node.opacity());
      },
      onFinish: () => {
        if (fadeAnimationRef.current) {
          fadeAnimationRef.current.destroy();
          fadeAnimationRef.current = null;
        }
      },
    });

    fadeAnimationRef.current.play();

    return () => {
      if (fadeAnimationRef.current) {
        fadeAnimationRef.current.destroy();
        fadeAnimationRef.current = null;
      }
    };
  }, [isFocused]);

  return (
    <Group
      ref={innerGroupRef}
      x={mapOffset.x}
      y={mapOffset.y}
      scaleX={mapScale}
      scaleY={mapScale}
      draggable={isFocused}
      onDragStart={isFocused ? handleDragStart : undefined}
      onDragMove={isFocused ? handleDragMove : undefined}
      onDragEnd={isFocused ? handleDragEnd : undefined}
      onTouchMove={isFocused ? handleTouchMove : undefined}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full constellation bounding box for drag interaction and cursor */}
      <Rect
        x={boundingBox.minX}
        y={boundingBox.minY}
        width={constellationBoundingBoxWidth}
        height={constellationBoundingBoxHeight}
        fill="transparent"
        listening={isFocused}
        onMouseEnter={isFocused ? () => {
          document.body.style.cursor = "grab";
        } : undefined}
        onMouseLeave={isFocused ? () => {
          document.body.style.cursor = "default";
        } : undefined}
      />
      
      {/* Permanent stroke outline - always visible, never fades */}
      <Shape
        sceneFunc={(context) => {
          // Draw stroked US outline polygon
          context.beginPath();
          US_MAP_SIMPLE.forEach((star, i) => {
            if (i === 0) {
              context.moveTo(star.x, star.y);
            } else {
              context.lineTo(star.x, star.y);
            }
          });
          context.closePath();
          context.lineWidth = 2;
        }}
        listening={false}
      />
      
      {/* Subtle background fill - fades in/out when focused */}
      <Shape
        ref={backgroundShapeRef}
        sceneFunc={(context) => {
          // Draw filled US outline polygon
          context.beginPath();
          US_MAP_SIMPLE.forEach((star, i) => {
            if (i === 0) {
              context.moveTo(star.x, star.y);
            } else {
              context.lineTo(star.x, star.y);
            }
          });
          context.closePath();
          context.fillStyle = hexToRgba(SPACE_TEXT_COLOR, 0.05);
          context.fill();
        }}
        opacity={backgroundOpacity}
        listening={false}
      />
      
      {/* Invisible shape with hitFunc for precise US outline hit detection */}
      <Shape
        sceneFunc={() => {
          // Don't draw anything - this is just for hit detection
        }}
        hitFunc={(context, shape) => {
          // Create a path from US outline stars for hit detection
          context.beginPath();
          US_MAP_SIMPLE.forEach((star, i) => {
            if (i === 0) {
              context.moveTo(star.x, star.y);
            } else {
              context.lineTo(star.x, star.y);
            }
          });
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        listening={isFocused}
        onMouseEnter={isFocused ? () => {
          document.body.style.cursor = "grab";
        } : undefined}
        onMouseLeave={isFocused ? () => {
          document.body.style.cursor = "default";
        } : undefined}
      />
      <MapScaleContext.Provider value={mapScale}>
        {children}
      </MapScaleContext.Provider>
    </Group>
  );
}
