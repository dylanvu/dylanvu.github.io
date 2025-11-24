import HackathonInformation from "@/interfaces/HackathonInformation";
import { Star } from "@/interfaces/StarInterfaces";
import { latLongToMapCoordinates } from "./coordinateTransformation";

/**
 * Represents a cluster of hackathons in the same city
 */
export interface HackathonCluster {
  city: string;
  state: string;
  hackathonCount: number;
  hackathons: HackathonInformation[];
  participatedCount: number;
  mentoredCount: number;
  awardsCount: number;
  avgLatitude: number;
  avgLongitude: number;
}

/**
 * Regional groupings for California hackathons
 */
const CALIFORNIA_REGIONS = {
  "Bay Area": [
    "san francisco", "berkeley", "sunnyvale", "oakland", "palo alto",
    "mountain view", "san jose", "santa clara", "fremont", "hayward"
  ],
  "Central Valley": ["sacramento", "davis", "stockton", "modesto", "fresno"],
  "SoCal Central": [
    "los angeles", "irvine", "anaheim", "long beach", "pasadena",
    "santa ana", "riverside", "san bernardino", "orange", "costa mesa", "santa monica", "fullerton"
  ],
  "Santa Barbara": ["santa barbara", "goleta"],
  "San Diego": ["san diego", "la jolla", "chula vista"]
};

/**
 * Determines which region a city belongs to
 */
function getCityRegion(city: string, state: string): string {
  if (state.toLowerCase() !== "california" && state.toLowerCase() !== "ca") {
    // Non-California cities remain as individual cities
    return `${city}, ${state}`;
  }

  const cityLower = city.toLowerCase();
  
  for (const [region, cities] of Object.entries(CALIFORNIA_REGIONS)) {
    if (cities.includes(cityLower)) {
      return region;
    }
  }
  
  // If not in any defined region, keep as individual city
  return `${city}, ${state}`;
}

/**
 * Determines star classification based on the number of hackathons
 */
function getStarClassification(
  count: number
): "Star" | "Supergiant" | "Giant" | "Dwarf" {
  if (count >= 10) return "Supergiant";
  if (count >= 5) return "Giant";
  if (count >= 2) return "Star";
  return "Dwarf";
}

/**
 * Generates a URL-safe slug from a cluster name
 */
function generateSlug(clusterName: string): string {
  return clusterName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Groups hackathons by region (or city for non-CA), creating clusters with aggregated information
 */
export function clusterHackathonsByCity(
  hackathons: HackathonInformation[]
): HackathonCluster[] {
  // Group hackathons by region
  const regionMap = new Map<string, HackathonInformation[]>();

  for (const hackathon of hackathons) {
    const regionKey = getCityRegion(hackathon.city, hackathon.state);
    if (!regionMap.has(regionKey)) {
      regionMap.set(regionKey, []);
    }
    regionMap.get(regionKey)!.push(hackathon);
  }

  // Convert to cluster objects
  const clusters: HackathonCluster[] = [];

  for (const [regionKey, regionHackathons] of regionMap.entries()) {
    // Calculate average coordinates
    const avgLatitude =
      regionHackathons.reduce((sum, h) => sum + h.latitude, 0) /
      regionHackathons.length;
    const avgLongitude =
      regionHackathons.reduce((sum, h) => sum + h.longitude, 0) /
      regionHackathons.length;

    // Count participants vs mentors
    const participatedCount = regionHackathons.filter(
      (h) => !h.role.toLowerCase().includes("mentor")
    ).length;
    const mentoredCount = regionHackathons.filter((h) =>
      h.role.toLowerCase().includes("mentor")
    ).length;

    // Count total awards
    const awardsCount = regionHackathons.reduce(
      (sum, h) => sum + h.awards.length,
      0
    );

    // Use region name as "city" for display
    const displayName = regionKey.includes(",") ? regionHackathons[0].city : regionKey;
    const state = regionHackathons[0].state;

    clusters.push({
      city: displayName,
      state: state,
      hackathonCount: regionHackathons.length,
      hackathons: regionHackathons,
      participatedCount,
      mentoredCount,
      awardsCount,
      avgLatitude,
      avgLongitude,
    });
  }

  return clusters;
}

/**
 * Converts hackathon clusters into Star objects for the constellation
 */
export function convertClustersToStars(
  clusters: HackathonCluster[]
): Star[] {
  return clusters.map((cluster) => {
    const { x, y } = latLongToMapCoordinates(
      cluster.avgLatitude,
      cluster.avgLongitude
    );

    const classification = getStarClassification(cluster.hackathonCount);

    // Create label showing city and hackathon count
    const label =
      cluster.hackathonCount > 1
        ? `${cluster.city} (${cluster.hackathonCount})`
        : cluster.city;

    // Format date range
    const dates = cluster.hackathons.map((h) => h.date.getFullYear());
    const minYear = Math.min(...dates);
    const maxYear = Math.max(...dates);
    const dateRange = minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`;

    // Create about text with stats
    const stats = [];
    if (cluster.participatedCount > 0) {
      stats.push(`${cluster.participatedCount} participated`);
    }
    if (cluster.mentoredCount > 0) {
      stats.push(`${cluster.mentoredCount} mentored`);
    }
    if (cluster.awardsCount > 0) {
      stats.push(`${cluster.awardsCount} awards`);
    }
    const about = stats.join(" | ");

    // Generate slug from cluster city name
    const slug = generateSlug(cluster.city);

    return {
      x,
      y,
      data: {
        label,
        slug,
        origin: dateRange,
        about,
        classification,
      },
    };
  });
}

/**
 * Main function to convert hackathon list to constellation stars
 */
export function generateHackathonStars(
  hackathons: HackathonInformation[]
): Star[] {
  const clusters = clusterHackathonsByCity(hackathons);
  return convertClustersToStars(clusters);
}
