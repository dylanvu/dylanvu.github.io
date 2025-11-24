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
    "mountain view", "san jose", "santa clara", "fremont", "hayward", "cupertino"
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

/**
 * Generates markdown content for a specific cluster by slug
 * @param clusterSlug The URL slug for the cluster (e.g., "irvine", "bay-area")
 * @param hackathons The full list of hackathons
 * @returns Markdown string or null if cluster not found
 */
export function generateClusterMarkdown(
  clusterSlug: string,
  hackathons: HackathonInformation[]
): string | null {
  const clusters = clusterHackathonsByCity(hackathons);
  const cluster = clusters.find((c) => generateSlug(c.city) === clusterSlug);

  if (!cluster) {
    return null;
  }

  // Sort hackathons in reverse chronological order (newest first)
  const sortedHackathons = [...cluster.hackathons].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // Calculate statistics
  const competedHackathons = cluster.hackathons.filter(
    (h) => !h.role.toLowerCase().includes("mentor")
  );
  const mentoredHackathons = cluster.hackathons.filter((h) =>
    h.role.toLowerCase().includes("mentor")
  );
  const totalParticipated = cluster.hackathons.length;
  
  const hoursCompeted = competedHackathons.reduce(
    (sum, h) => sum + h.duration,
    0
  );
  const hoursMentored = mentoredHackathons.reduce(
    (sum, h) => sum + h.duration,
    0
  );
  const totalHours = hoursCompeted + hoursMentored;

  // Build markdown content
  const lines: string[] = [];

  // Title
  lines.push(`# Hackathons in ${cluster.city}`);
  lines.push("");

  // Summary statistics
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Hackathons**: ${totalParticipated}`);
  lines.push(`- **Competed**: ${competedHackathons.length} hackathons (~${hoursCompeted.toLocaleString()} hours)`);
  lines.push(`- **Mentored**: ${mentoredHackathons.length} hackathons (~${hoursMentored.toLocaleString()} hours)`);
  lines.push(`- **Total Hours**: ~${totalHours.toLocaleString()} hours`);
  
  if (cluster.awardsCount > 0) {
    lines.push(`- **Awards Won**: ${cluster.awardsCount}`);
  }
  
  lines.push("");

  // List all hackathons
  lines.push("## Hackathons");
  lines.push("");

  for (const hackathon of sortedHackathons) {
    // Hackathon header
    lines.push(`### ${hackathon.name}`);
    lines.push("");

    // Basic info
    lines.push(`**Date**: ${hackathon.date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })}`);
    lines.push("");
    lines.push(`**Role**: ${hackathon.role}`);
    lines.push("");
    lines.push(`**Location**: ${hackathon.place}, ${hackathon.city}, ${hackathon.state}`);
    lines.push("");
    lines.push(`**Type**: ${hackathon.type}`);
    lines.push("");
    lines.push(`**Duration**: ${hackathon.duration} hours`);
    lines.push("");
    lines.push(`**Organizer**: ${hackathon.organizer}`);

    // Project name (if participant)
    if (hackathon.projectName) {
      lines.push("");
      lines.push(`**Project**: ${hackathon.projectName}`);
    }

    // Awards
    if (hackathon.awards.length > 0) {
      lines.push("");
      lines.push(`**Awards**: ${hackathon.awards.join(", ")}`);
    }

    // Links
    if (hackathon.devpost) {
      lines.push("");
      lines.push(`**Devpost**: [${hackathon.devpost}](${hackathon.devpost})`);
    }

    if (hackathon.github && hackathon.github.length > 0) {
      lines.push("");
      lines.push(`**GitHub**:`);
      for (const repo of hackathon.github) {
        lines.push(`- [${repo}](${repo})`);
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Gets all cluster slugs for static generation
 * @param hackathons The full list of hackathons
 * @returns Array of cluster slugs
 */
export function getAllClusterSlugs(hackathons: HackathonInformation[]): string[] {
  const clusters = clusterHackathonsByCity(hackathons);
  return clusters.map((c) => generateSlug(c.city));
}
