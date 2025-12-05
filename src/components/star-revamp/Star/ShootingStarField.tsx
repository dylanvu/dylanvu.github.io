"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Group } from "react-konva";
import ShootingStar from "./ShootingStar";
import { BACKGROUND_STAR_COLORS } from "@/app/theme";

// ===========================
// SHOOTING STAR CONFIGURATION
// ===========================
const CONFIG = {
  // Spawn timing (milliseconds) - RARE for subtle atmosphere
  SPAWN_INTERVAL_MIN: 5000,     // Minimum time between spawns 
  SPAWN_INTERVAL_MAX: 15000,     // Maximum time between spawns
  
  // Performance limits
  MAX_ACTIVE_STARS: 1,           // Maximum simultaneous shooting stars
  
  // Animation duration (milliseconds) - FAST for fleeting effect
  DURATION_MIN: 600,             // Fastest shooting star 
  DURATION_MAX: 1200,            // Slowest shooting star
  
  // Tail length (pixels) - SHORTER for subtlety
  TAIL_LENGTH_MIN: 30,           // Shortest trail
  TAIL_LENGTH_MAX: 80,           // Longest trail
  
  // Trajectory angles
  ANGLE_MIN_DEGREES: 20,         // Minimum angle from horizontal
  ANGLE_MAX_DEGREES: 70,         // Maximum angle from horizontal
  
  // Entry/exit positioning
  EDGE_BUFFER: 50,               // Distance outside viewport to start/end
  TRAVEL_DISTANCE_MULTIPLIER: 1.2, // How far across screen (1.0 = exact screen size)
  
  // Visual variety - DIMMER colors for background atmosphere
  COLORS: BACKGROUND_STAR_COLORS, // Use dimmer background star colors
} as const;

interface ShootingStarInstance {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  maxTailLength: number;
  color: string;
}

interface ShootingStarFieldProps {
  width: number;
  height: number;
  spawnIntervalMin?: number; // ms
  spawnIntervalMax?: number; // ms
  maxActiveStars?: number;
}

/**
 * Manages spawning and cleanup of shooting stars
 * Optimized for performance with rate limiting and proper memory management
 */
export default function ShootingStarField({
  width,
  height,
  spawnIntervalMin = CONFIG.SPAWN_INTERVAL_MIN,
  spawnIntervalMax = CONFIG.SPAWN_INTERVAL_MAX,
  maxActiveStars = CONFIG.MAX_ACTIVE_STARS,
}: ShootingStarFieldProps) {
  const [activeStars, setActiveStars] = useState<ShootingStarInstance[]>([]);
  const nextIdRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateShootingStar = useCallback((): ShootingStarInstance => {
    const id = nextIdRef.current++;
    
    const angleRange = CONFIG.ANGLE_MAX_DEGREES - CONFIG.ANGLE_MIN_DEGREES;
    const angle = (CONFIG.ANGLE_MIN_DEGREES + Math.random() * angleRange) * (Math.PI / 180);
    
    const behavior = Math.random();
    const screenSize = Math.max(width, height);
    let startX, startY, endX, endY, distance;
    
    const edge = Math.floor(Math.random() * 4);
    
    if (behavior < 0.3) {
      // 30% - Start off-screen, burn out mid-screen
      distance = (0.3 + Math.random() * 0.3) * screenSize;
      
      switch (edge) {
        case 0:
          startX = Math.random() * width * 0.5;
          startY = -CONFIG.EDGE_BUFFER;
          break;
        case 1:
          startX = width + CONFIG.EDGE_BUFFER;
          startY = Math.random() * height * 0.5;
          break;
        case 2:
          startX = width + CONFIG.EDGE_BUFFER;
          startY = -CONFIG.EDGE_BUFFER;
          break;
        default:
          startX = -CONFIG.EDGE_BUFFER;
          startY = Math.random() * height * 0.5;
      }
      
      endX = startX + Math.cos(angle) * distance * (edge === 1 ? -1 : 1);
      endY = startY + Math.sin(angle) * distance;
      
    } else if (behavior < 0.6) {
      // 30% - Start mid-screen, exit off-screen
      distance = (0.5 + Math.random() * 0.5) * screenSize;
      
      startX = width * (0.2 + Math.random() * 0.6);
      startY = height * (0.2 + Math.random() * 0.4);
      
      endX = startX + Math.cos(angle) * distance * (Math.random() > 0.5 ? -1 : 1);
      endY = startY + Math.sin(angle) * distance;
      
    } else if (behavior < 0.9) {
      // 50% - Full edge-to-edge
      distance = (1.0 + Math.random() * 0.5) * screenSize;
      
      switch (edge) {
        case 0:
          startX = Math.random() * width * 0.5;
          startY = -CONFIG.EDGE_BUFFER;
          break;
        case 1:
          startX = width + CONFIG.EDGE_BUFFER;
          startY = Math.random() * height * 0.5;
          break;
        case 2:
          startX = width + CONFIG.EDGE_BUFFER;
          startY = -CONFIG.EDGE_BUFFER;
          break;
        default:
          startX = -CONFIG.EDGE_BUFFER;
          startY = Math.random() * height * 0.5;
      }
      
      endX = startX + Math.cos(angle) * distance * (edge === 1 ? -1 : 1);
      endY = startY + Math.sin(angle) * distance;
      
    } else {
      // 10% - Appear and disappear entirely mid-screen
      distance = (0.2 + Math.random() * 0.3) * screenSize;
      
      startX = width * (0.3 + Math.random() * 0.4);
      startY = height * (0.2 + Math.random() * 0.3);
      
      endX = startX + Math.cos(angle) * distance * (Math.random() > 0.5 ? -1 : 1);
      endY = startY + Math.sin(angle) * distance;
    }
    
    const durationRange = CONFIG.DURATION_MAX - CONFIG.DURATION_MIN;
    const tailLengthRange = CONFIG.TAIL_LENGTH_MAX - CONFIG.TAIL_LENGTH_MIN;
    
    return {
      id,
      startX,
      startY,
      endX,
      endY,
      duration: CONFIG.DURATION_MIN + Math.random() * durationRange,
      maxTailLength: CONFIG.TAIL_LENGTH_MIN + Math.random() * tailLengthRange,
      color: CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)],
    };
  }, [width, height]);

  // Spawn a new shooting star if under limit
  const spawnStar = useCallback(() => {
    setActiveStars((current) => {
      if (current.length >= maxActiveStars) {
        return current;
      }
      return [...current, generateShootingStar()];
    });
  }, [maxActiveStars, generateShootingStar]);

  // Schedule next spawn
  const scheduleNextSpawn = useCallback(() => {
    const delay = spawnIntervalMin + Math.random() * (spawnIntervalMax - spawnIntervalMin);
    timeoutRef.current = setTimeout(() => {
      spawnStar();
      scheduleNextSpawn();
    }, delay);
  }, [spawnIntervalMin, spawnIntervalMax, spawnStar]);

  // Handle star completion
  const handleStarComplete = useCallback((id: number) => {
    setActiveStars((current) => current.filter((star) => star.id !== id));
  }, []);

  // Initialize spawning
  useEffect(() => {
    scheduleNextSpawn();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleNextSpawn]);

  return (
    <Group>
      {activeStars.map((star) => (
        <ShootingStar
          key={star.id}
          startX={star.startX}
          startY={star.startY}
          endX={star.endX}
          endY={star.endY}
          duration={star.duration}
          maxTailLength={star.maxTailLength}
          color={star.color}
          onComplete={() => handleStarComplete(star.id)}
        />
      ))}
    </Group>
  );
}
