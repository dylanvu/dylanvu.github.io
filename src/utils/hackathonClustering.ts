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
 * Groups hackathons by city, creating clusters with aggregated information
 */
export function clusterHackathonsByCity(
  hackathons: HackathonInformation[]
): HackathonCluster[] {
  // Group hackathons by city
  const cityMap = new Map<string, HackathonInformation[]>();

  for (const hackathon of hackathons) {
    const cityKey = `${hackathon.city}, ${hackathon.state}`;
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, []);
    }
    cityMap.get(cityKey)!.push(hackathon);
  }

  // Convert to cluster objects
  const clusters: HackathonCluster[] = [];

  for (const [cityKey, cityHackathons] of cityMap.entries()) {
    // Calculate average coordinates
    const avgLatitude =
      cityHackathons.reduce((sum, h) => sum + h.latitude, 0) /
      cityHackathons.length;
    const avgLongitude =
      cityHackathons.reduce((sum, h) => sum + h.longitude, 0) /
      cityHackathons.length;

    // Count participants vs mentors
    const participatedCount = cityHackathons.filter(
      (h) => !h.role.toLowerCase().includes("mentor")
    ).length;
    const mentoredCount = cityHackathons.filter((h) =>
      h.role.toLowerCase().includes("mentor")
    ).length;

    // Count total awards
    const awardsCount = cityHackathons.reduce(
      (sum, h) => sum + h.awards.length,
      0
    );

    clusters.push({
      city: cityHackathons[0].city,
      state: cityHackathons[0].state,
      hackathonCount: cityHackathons.length,
      hackathons: cityHackathons,
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

    return {
      x,
      y,
      data: {
        label,
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
