import Konva from "konva";
import { Group, Shape, Rect } from "react-konva";
import { useState, useRef, useEffect, useCallback, ReactNode, createContext } from "react";
import { Star } from "@/interfaces/StarInterfaces";
import { US_MAP_SIMPLE } from "../us_map";
import { SPACE_TEXT_COLOR, hexToRgba } from "@/app/theme";

// Context to provide map scale to child components
export const MapScaleContext = createContext<number>(1);

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
  const [mapScale, setMapScale] = useState(1);
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
      const clampedScale = Math.max(0.5, Math.min(5, newScale));

      const stage = node.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Convert mouse position from stage coordinates to local coordinates
      const mousePointLocal = {
        x: (pointer.x - mapOffset.x) / oldScale,
        y: (pointer.y - mapOffset.y) / oldScale,
      };

      // Calculate new offset to keep the mouse point at the same stage position
      const newOffset = {
        x: pointer.x - mousePointLocal.x * clampedScale,
        y: pointer.y - mousePointLocal.y * clampedScale,
      };

      setMapScale(clampedScale);
      setMapOffset(newOffset);
      
      if (onZoomChange) {
        onZoomChange(clampedScale);
      }
    },
    [isFocused, mapScale, mapOffset, onZoomChange]
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
      const clampedScale = Math.max(0.5, Math.min(5, scale));

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
  }, [externalZoom, mapScale, mapOffset, boundingBoxCenter]);

  // Reset on unfocus
  useEffect(() => {
    if (!isFocused) {
      setMapScale(1);
      setMapOffset({ x: 0, y: 0});
      if (onZoomChange) {
        onZoomChange(1);
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
