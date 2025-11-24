import Konva from "konva";
import { Group, Shape } from "react-konva";
import { useState, useRef, useEffect, useCallback, ReactNode, createContext } from "react";
import { Star } from "@/interfaces/StarInterfaces";
import { US_MAP_SIMPLE } from "../us_map";

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
  externalZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export default function ElevareMap({ children, isFocused, boundingBox, externalZoom, onZoomChange }: ElevareMapProps) {
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const lastDistRef = useRef(0);
  const innerGroupRef = useRef<Konva.Group>(null);

  // Zoom handler
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

      // Get the current position of the inner group
      const oldPos = { x: mapOffset.x, y: mapOffset.y };
      
      // Calculate mouse position relative to the group's current transform
      const mousePointTo = {
        x: (pointer.x - oldPos.x) / oldScale,
        y: (pointer.y - oldPos.y) / oldScale,
      };

      // Calculate new position to keep the point under cursor fixed
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      setMapScale(clampedScale);
      setMapOffset(newPos);
      
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
  // Update internal zoom when external zoom changes
  useEffect(() => {
    if (externalZoom !== undefined && externalZoom !== mapScale) {
      setMapScale(externalZoom);
    }
  }, [externalZoom]);

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
      />
      <MapScaleContext.Provider value={mapScale}>
        {children}
      </MapScaleContext.Provider>
    </Group>
  );
}
