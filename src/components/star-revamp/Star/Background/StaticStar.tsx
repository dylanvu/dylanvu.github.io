import { Shape } from "react-konva";
import { useEffect, useRef } from "react";
import React from "react";
import { BACKGROUND_STAR_COLORS, getRandomColor, OPACITY } from "@/app/theme";
import Konva from "konva";

const BG_STAR_COLORS = BACKGROUND_STAR_COLORS;

function StaticStar({
  x,
  y,
  radius,
}: {
  x: number;
  y: number;
  radius: number;
}) {
  // Stable color per instance
  const color = useRef(
    getRandomColor(BG_STAR_COLORS)
  ).current;
  
  const shapeRef = useRef<Konva.Shape>(null);

  // Cache the shape after initial render for better performance
  useEffect(() => {
    const shape = shapeRef.current;
    if (!shape) return;
    
    // Cache this static shape to improve rendering performance
    // Must provide explicit bounds since we're using custom sceneFunc
    shape.cache({
      x: -radius,
      y: -radius,
      width: radius * 2,
      height: radius * 2,
    });
    
    // Cleanup: clear cache on unmount
    return () => {
      shape.clearCache();
    };
  }, []); // Empty deps - only run once on mount

  return (
    <Shape
      ref={shapeRef}
      x={x}
      y={y}
      // Opacity is now 1, because the Parent Layer handles the fade
      opacity={1}
      listening={false}
      sceneFunc={(ctx) => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, `rgba(255,255,255,${OPACITY.bold})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }}
    />
  );
}

// Memoize to prevent unnecessary re-renders of 390 background stars
export default React.memo(StaticStar);
