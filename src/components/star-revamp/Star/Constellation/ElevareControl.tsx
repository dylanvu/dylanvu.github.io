import { Group, Rect, Text, Line, Circle } from "react-konva";
import { useState, useRef, useEffect } from "react";
import Konva from "konva";
import { SPACE_TEXT_COLOR } from "@/app/theme";
import { useFocusContext } from "@/hooks/useFocusProvider";

interface ElevareControlProps {
  x: number;
  topY: number;
  bottomY: number;
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (zoom: number) => void;
}

export default function ElevareControl({
  x,
  topY,
  bottomY,
  currentZoom,
  minZoom,
  maxZoom,
  onZoomChange,
}: ElevareControlProps) {
  const { focusedObject } = useFocusContext();
  const isFocused = focusedObject.constellation?.name === "Elevare";
  
  const controlWidth = 40;
  const controlHeight = bottomY - topY;
  const y = topY;
  const [controlOpacity, setControlOpacity] = useState(0);
  const sliderRef = useRef<Konva.Circle>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<number | null>(null);
  const groupRef = useRef<Konva.Group>(null);
  const fadeAnimationRef = useRef<Konva.Tween | null>(null);

  const buttonSize = 30;
  const sliderHeight = controlHeight - buttonSize * 2 - 20;

  // Calculate slider position based on zoom level
  const zoomToSliderY = (zoom: number) => {
    const normalized = (zoom - minZoom) / (maxZoom - minZoom);
    return buttonSize + 10 + sliderHeight * (1 - normalized); // Inverted: top = max zoom
  };

  const sliderYToZoom = (sliderY: number) => {
    const localY = sliderY - (buttonSize + 10);
    const normalized = 1 - localY / sliderHeight; // Inverted
    return Math.max(minZoom, Math.min(maxZoom, minZoom + normalized * (maxZoom - minZoom)));
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(maxZoom, currentZoom * 1.2);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(minZoom, currentZoom / 1.2);
    onZoomChange(newZoom);
  };

  const handleSliderDragMove = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    // Keep X centered
    slider.x(controlWidth / 2);
    
    // Get current Y position (relative to parent Group)
    const currentY = slider.y();
    
    // Clamp to slider bounds
    const minY = buttonSize + 10;
    const maxY = buttonSize + 10 + sliderHeight;
    const clampedY = Math.max(minY, Math.min(maxY, currentY));
    
    // Update position if it was clamped
    if (clampedY !== currentY) {
      slider.y(clampedY);
    }
    
    // Calculate zoom from clamped position
    const newZoom = sliderYToZoom(clampedY);
    pendingZoomRef.current = newZoom;
    
    // Use RAF to batch updates
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingZoomRef.current !== null) {
          onZoomChange(pendingZoomRef.current);
          pendingZoomRef.current = null;
        }
        rafIdRef.current = null;
      });
    }
  };

  const handleSliderDragEnd = () => {
    // Cancel any pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    const slider = sliderRef.current;
    if (!slider) return;
    
    // Keep X centered
    slider.x(controlWidth / 2);
    
    // Get current Y position and clamp it
    const currentY = slider.y();
    const minY = buttonSize + 10;
    const maxY = buttonSize + 10 + sliderHeight;
    const clampedY = Math.max(minY, Math.min(maxY, currentY));
    
    // Update position if it was clamped
    if (clampedY !== currentY) {
      slider.y(clampedY);
    }
    
    // Final update on drag end
    const newZoom = sliderYToZoom(clampedY);
    onZoomChange(newZoom);
    pendingZoomRef.current = null;
  };

  // Fade animation for control panel
  useEffect(() => {
    const node = groupRef.current;
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
        setControlOpacity(node.opacity());
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
      ref={groupRef}
      x={x - 10}
      y={y}
      opacity={controlOpacity}
    >
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={controlWidth}
        height={controlHeight}
        fill="rgba(0, 0, 0, 0.5)"
        stroke={SPACE_TEXT_COLOR}
        strokeWidth={1}
        cornerRadius={5}
      />

      {/* Zoom In Button (+) */}
      <Group
        x={controlWidth / 2}
        y={buttonSize / 2}
        onClick={handleZoomIn}
        onTap={handleZoomIn}
        onMouseEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onMouseLeave={() => {
          document.body.style.cursor = "default";
        }}
      >
        <Rect
          x={-12}
          y={-12}
          width={24}
          height={24}
          fill="transparent"
          listening
        />
        <Text
          text="+"
          fontSize={20}
          fill={SPACE_TEXT_COLOR}
          align="center"
          verticalAlign="middle"
          offsetX={6}
          offsetY={10}
          listening={false}
        />
      </Group>

      {/* Slider Track */}
      <Line
        points={[
          controlWidth / 2,
          buttonSize + 10,
          controlWidth / 2,
          buttonSize + 10 + sliderHeight,
        ]}
        stroke={SPACE_TEXT_COLOR}
        strokeWidth={2}
        listening={false}
      />

      {/* Slider Thumb */}
      <Circle
        ref={sliderRef}
        x={controlWidth / 2}
        y={zoomToSliderY(currentZoom)}
        radius={6}
        fill={SPACE_TEXT_COLOR}
        stroke="rgba(0, 0, 0, 0.5)"
        strokeWidth={2}
        draggable
        onDragMove={handleSliderDragMove}
        onDragEnd={handleSliderDragEnd}
        onMouseEnter={() => {
          document.body.style.cursor = "grab";
        }}
        onMouseLeave={() => {
          document.body.style.cursor = "default";
        }}
        onDragStart={() => {
          document.body.style.cursor = "grabbing";
        }}
      />

      {/* Zoom Out Button (-) */}
      <Group
        x={controlWidth / 2}
        y={controlHeight - buttonSize / 2}
        onClick={handleZoomOut}
        onTap={handleZoomOut}
        onMouseEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onMouseLeave={() => {
          document.body.style.cursor = "default";
        }}
      >
        <Rect
          x={-12}
          y={-12}
          width={24}
          height={24}
          fill="transparent"
          listening
        />
        <Text
          text="-"
          fontSize={20}
          fill={SPACE_TEXT_COLOR}
          align="center"
          verticalAlign="middle"
          offsetX={5}
          offsetY={10}
          listening={false}
        />
      </Group>
    </Group>
  );
}
