import { Star } from "@/interfaces/StarInterfaces";

export type Point = {
  x: number;
  y: number;
  size: number;
};

/**
 * Transform points: translate, rotate, scale
 * @param points - array of Point
 * @param options - { tx, ty, rotation (deg), scale }
 * @returns new transformed array of Points
 */
export function transformPoints(
  points: Point[],
  options: {
    tx?: number;
    ty?: number;
    rotation?: number;
    scale?: number;
    starScale?: number;
  } = {}
): Point[] {
  const { tx = 0, ty = 0, rotation = 0, scale = 1, starScale = 1 } = options;
  const rad = (rotation * Math.PI) / 180;

  return points.map((p) => {
    // Scale
    const x = p.x * scale;
    const y = p.y * scale;

    // Rotate around origin (0,0)
    const rotatedX = x * Math.cos(rad) - y * Math.sin(rad);
    const rotatedY = x * Math.sin(rad) + y * Math.cos(rad);

    // Translate
    return {
      x: rotatedX + tx,
      y: rotatedY + ty,
      size: p.size * starScale, // size unchanged
    };
  });
}

/**
 * Creates sequential connections between stars, optionally limiting to a range.
 * @param stars - Array of stars
 * @param startIndex - Starting index (defaults to 0)
 * @param endIndex - Ending index (defaults to stars.length - 1)
 * @returns Array of connection tuples [from, to]
 */
export function createSequentialLoopingConnections(
  stars: Star[],
  startIndex: number = 0,
  endIndex?: number
): [number, number][] {
  const connections: [number, number][] = [];
  const lastIndex = endIndex !== undefined ? endIndex : stars.length - 1;
  
  for (let i = startIndex; i <= lastIndex; i++) {
    if (i === lastIndex) {
      // Loop back to start
      connections.push([i, startIndex]);
    } else {
      connections.push([i, i + 1]);
    }
  }
  return connections;
}
