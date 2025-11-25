/**
 * Utility functions for constellation calculations
 */

/**
 * Computes the center and bounding box of a constellation based on its star positions
 * @param stars Array of star positions with x and y coordinates
 * @returns Object containing bounding box dimensions and center coordinates
 */
export function computeCenter(stars: { x: number; y: number }[]) {
  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const minX = Math.min(...xs) - 10;
  const maxX = Math.max(...xs) + 10;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...ys) + 10;
  const widthLocal = maxX - minX;
  const heightLocal = maxY - minY;
  const centerX = minX + widthLocal / 2;
  const centerY = minY + heightLocal / 2;
  return { minX, minY, widthLocal, heightLocal, centerX, centerY };
}
