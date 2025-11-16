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
    let x = p.x * scale;
    let y = p.y * scale;

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

export function createSequentialLoopingConnections(
  stars: Point[]
): [number, number][] {
  const connections: [number, number][] = [];
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    if (i === stars.length - 1) {
      connections.push([i, 0]);
    } else {
      connections.push([i, i + 1]);
    }
  }
  return connections;
}
