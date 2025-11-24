import Konva from "konva";
import { Group, Shape, Rect } from "react-konva";
import { useState, useRef, useEffect, useCallback, ReactNode, createContext } from "react";
import { Star } from "@/interfaces/StarInterfaces";
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
  const lastDistRef = useRef(0);
  const innerGroupRef = useRef<Konva.Group>(null);

  // Zoom handler - zooms centered on mouse position
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      if (!isFocused) return;

      e.evt.preventDefault();
      const node = innerGroupRef.current;
      if (!node) return;

      const scaleBy = 1.1;
      const oldScale = mapScale;

      const newScale =
        e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

      const stage = node.getStage();
      if (!stage) return;

      const stagePointer = stage.getPointerPosition();
      if (!stagePointer) return;

      // Convert stage pointer to parent's coordinate space
      // (mapOffset is in parent coordinates, not stage coordinates!)
      const parent = node.getParent();
      if (!parent) return;

      const parentTransform = parent.getAbsoluteTransform().copy();
      parentTransform.invert();
      const pointer = parentTransform.point(stagePointer);

      // Classic zoom-to-point algorithm in parent's coordinate space:
      // 1. Find which content point (in unscaled space) is under the mouse
      //    Formula: pointer = groupOffset + contentPoint * groupScale
      //    So: contentPoint = (pointer - groupOffset) / groupScale
      const contentPoint = {
        x: (pointer.x - mapOffset.x) / oldScale,
        y: (pointer.y - mapOffset.y) / oldScale,
      };

      // 2. Calculate new group offset to keep that content point under the mouse
      //    We want: pointer = newOffset + contentPoint * newScale
      //    So: newOffset = pointer - contentPoint * newScale
      const newOffset = {
        x: pointer.x - contentPoint.x * clampedScale,
        y: pointer.y - contentPoint.y * clampedScale,
      };

      setMapScale(clampedScale);
      setMapOffset(newOffset);
      
      // Sync with external zoom control (safe now since useEffect only depends on externalZoom)
      if (onZoomChange) {
        onZoomChange(clampedScale);
      }
    },
    [isFocused, mapScale, mapOffset]
  );

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

  // Reset on unfocus
  useEffect(() => {
    if (!isFocused) {
      setMapScale(MIN_ZOOM);
      setMapOffset({ x: 0, y: 0});
      if (onZoomChange) {
        onZoomChange(MIN_ZOOM);
      }
    }
  }, [isFocused, onZoomChange]);

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
      {/* Full constellation bounding box for wheel/drag interaction */}
      <Rect
        x={boundingBox.minX}
        y={boundingBox.minY}
        width={constellationBoundingBoxWidth}
        height={constellationBoundingBoxHeight}
        fill="transparent"
        listening={isFocused}
        onWheel={isFocused ? handleWheel : undefined}
        onMouseEnter={isFocused ? () => {
          document.body.style.cursor = "grab";
        } : undefined}
        onMouseLeave={isFocused ? () => {
          document.body.style.cursor = "default";
        } : undefined}
      />
      
      {/* Subtle background using US map polygon */}
      <Shape
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
        listening={false}
      />
      
      {/* Invisible shape with hitFunc for precise US outline hit detection */}
      <Shape
        sceneFunc={(context, shape) => {
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
        onWheel={isFocused ? handleWheel : undefined}
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
