/**
 * Utility functions for converting geographic coordinates (latitude/longitude)
 * to custom map coordinates for the Elevare constellation.
 */

// US geographic bounds (approximate mainland US)
const US_LAT_MIN = 24.396308; // southernmost point (Key West, FL)
const US_LAT_MAX = 49.384358; // northernmost point (northern border)
const US_LONG_MIN = -125.0; // westernmost point (Pacific coast)
const US_LONG_MAX = -66.93457; // easternmost point (Atlantic coast)

// Custom map bounds (from us_map.ts analysis)
const MAP_X_MIN = 36;
const MAP_X_MAX = 353;
const MAP_Y_MIN = 50;
const MAP_Y_MAX = 219;

/**
 * Converts geographic coordinates (latitude, longitude) to custom map coordinates.
 * 
 * The transformation accounts for:
 * - Latitude decreases as you go down (north to south)
 * - Longitude increases as you go right (west to east)
 * - Map coordinates: origin at top-left, x increases right, y increases down
 * 
 * @param lat - Latitude in degrees (positive = north)
 * @param long - Longitude in degrees (negative = west for US)
 * @returns Object with x, y coordinates for the custom map
 */
export function latLongToMapCoordinates(
  lat: number,
  long: number
): { x: number; y: number } {
  // Normalize latitude to 0-1 range (1 = north, 0 = south)
  const latNormalized = (lat - US_LAT_MIN) / (US_LAT_MAX - US_LAT_MIN);

  // Normalize longitude to 0-1 range (0 = west, 1 = east)
  const longNormalized = (long - US_LONG_MIN) / (US_LONG_MAX - US_LONG_MIN);

  // Map to custom coordinate space
  // x: west (0) to east (1) maps to MAP_X_MIN to MAP_X_MAX
  const x = MAP_X_MIN + longNormalized * (MAP_X_MAX - MAP_X_MIN);

  // y: north (1) to south (0) maps to MAP_Y_MIN to MAP_Y_MAX
  // Invert because higher latitude = lower y coordinate on screen
  const y = MAP_Y_MIN + (1 - latNormalized) * (MAP_Y_MAX - MAP_Y_MIN);

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

/**
 * Calculates the distance between two points in map coordinate space.
 * Useful for clustering nearby locations.
 * 
 * @param p1 - First point with x, y coordinates
 * @param p2 - Second point with x, y coordinates
 * @returns Euclidean distance between the points
 */
export function calculateMapDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
