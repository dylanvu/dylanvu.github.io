"use client";
import { useEffect, useRef } from "react";
import { Circle, Group, Line } from "react-konva";
import Konva from "konva";

interface ShootingStarProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  maxTailLength: number;
  color: string;
  onComplete: () => void;
}

/**
 * Individual shooting star with dynamic brightness and tail length
 * Optimized for performance with listening(false) and proper cleanup
 */
export default function ShootingStar({
  startX,
  startY,
  endX,
  endY,
  duration,
  maxTailLength,
  color,
  onComplete,
}: ShootingStarProps) {
  const groupRef = useRef<Konva.Group | null>(null);
  const lineRef = useRef<Konva.Line | null>(null);
  const circleRef = useRef<Konva.Circle | null>(null);
  const animationRef = useRef<Konva.Animation | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    const line = lineRef.current;
    const circle = circleRef.current;

    if (!group || !line || !circle) return;

    const layer = group.getLayer();
    if (!layer) return;

    const startTime = Date.now();
    const totalDistance = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const angle = Math.atan2(endY - startY, endX - startX);

    // Subtle brightness curve: dim entry → subtle peak → fade out
    const getBrightness = (progress: number): number => {
      if (progress < 0.2) {
        return 0.15 + (progress / 0.2) * 0.1;
      } else if (progress < 0.6) {
        return 0.25 + ((progress - 0.2) / 0.4) * 0.15;
      } else {
        return 0.4 - (progress - 0.6) / 0.4 * 0.4;
      }
    };

    const getTailLength = (progress: number): number => {
      const minLength = maxTailLength * 0.25;
      if (progress < 0.2) {
        return minLength + (progress / 0.2) * (maxTailLength * 0.45);
      } else if (progress < 0.6) {
        return maxTailLength * 0.7 + ((progress - 0.2) / 0.4) * (maxTailLength * 0.3);
      } else {
        return maxTailLength * (1 - (progress - 0.6) / 0.4);
      }
    };

    const getGlowRadius = (progress: number): number => {
      if (progress < 0.3) {
        return 2 + progress * 13;
      } else if (progress < 0.6) {
        return 6;
      } else {
        return 6 - ((progress - 0.6) / 0.4) * 6;
      }
    };

    // Konva.Animation for optimal performance
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        // Animation complete
        anim.stop();
        onComplete();
        return;
      }

      // Calculate current position
      const currentDistance = progress * totalDistance;
      const currentX = startX + Math.cos(angle) * currentDistance;
      const currentY = startY + Math.sin(angle) * currentDistance;

      // Get dynamic values
      const brightness = getBrightness(progress);
      const tailLength = getTailLength(progress);
      const glowRadius = getGlowRadius(progress);

      // Calculate tail start position
      const tailStartX = currentX - Math.cos(angle) * tailLength;
      const tailStartY = currentY - Math.sin(angle) * tailLength;

      // Update trail
      line.points([tailStartX, tailStartY, currentX, currentY]);
      line.opacity(brightness);
      line.strokeWidth(1);

      // Update head with glow
      circle.x(currentX);
      circle.y(currentY);
      circle.radius(2);
      circle.opacity(brightness);
      circle.shadowBlur(glowRadius);
      circle.shadowOpacity(brightness * 0.5);

    }, layer);

    animationRef.current = anim;
    anim.start();

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [startX, startY, endX, endY, duration, maxTailLength, color, onComplete]);

  return (
    <Group ref={groupRef}>
      <Line
        ref={lineRef}
        stroke={color}
        strokeWidth={1}
        lineCap="round"
        lineJoin="round"
        listening={false}
        perfectDrawEnabled={false}
      />
      <Circle
        ref={circleRef}
        fill={color}
        shadowColor={color}
        listening={false}
        perfectDrawEnabled={false}
      />
    </Group>
  );
}
