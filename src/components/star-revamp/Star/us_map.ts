import { Star } from "@/interfaces/StarInterfaces";
import { HackathonList } from "@/constants/Hackathons";
import { generateHackathonStars } from "@/utils/hackathonClustering";

// Original simple US map outline (kept for reference/fallback)
export const US_MAP_SIMPLE: Star[] = [
  { x: 198, y: 50, data: { classification: "Giant" } },
  { x: 49, y: 52, data: { classification: "Giant" } },
  { x: 46, y: 59, data: { classification: "Giant" } },
  { x: 36, y: 58, data: { classification: "Dwarf" } },
  { x: 40, y: 127, data: { classification: "Star" } },
  { x: 60, y: 160, data: { classification: "Dwarf" } },
  { x: 70, y: 164, data: { classification: "Dwarf" } },
  { x: 77, y: 173, data: { classification: "Star" } },
  { x: 87, y: 171, data: { classification: "Giant" } },
  { x: 112, y: 180, data: { classification: "Dwarf" } },
  { x: 136, y: 178, data: { classification: "Dwarf" } },
  { x: 153, y: 195, data: { classification: "Star" } },
  { x: 161, y: 190, data: { classification: "Giant" } },
  { x: 166, y: 193, data: { classification: "Star" } },
  { x: 182, y: 213, data: { classification: "Giant" } },
  { x: 186, y: 213, data: { classification: "Star" } },
  { x: 186, y: 203, data: { classification: "Dwarf" } },
  { x: 190, y: 199, data: { classification: "Dwarf" } },
  { x: 205, y: 191, data: { classification: "Dwarf" } },
  { x: 230, y: 194, data: { classification: "Dwarf" } },
  { x: 232, y: 186, data: { classification: "Star" } },
  { x: 261, y: 189, data: { classification: "Star" } },
  { x: 280, y: 219, data: { classification: "Giant" } },
  { x: 274, y: 185, data: { classification: "Giant" } },
  { x: 277, y: 175, data: { classification: "Dwarf" } },
  { x: 305, y: 151, data: { classification: "Giant" } },
  { x: 305, y: 141, data: { classification: "Dwarf" } },
  { x: 316, y: 117, data: { classification: "Giant" } },
  { x: 338, y: 108, data: { classification: "Dwarf" } },
  { x: 334, y: 106, data: { classification: "Star" } },
  { x: 335, y: 96, data: { classification: "Giant" } },
  { x: 353, y: 86, data: { classification: "Star" } },
  { x: 348, y: 66, data: { classification: "Dwarf" } },
  { x: 339, y: 69, data: { classification: "Giant" } },
  { x: 331, y: 82, data: { classification: "Dwarf" } },
  { x: 311, y: 85, data: { classification: "Dwarf" } },
  { x: 302, y: 97, data: { classification: "Giant" } },
  { x: 292, y: 97, data: { classification: "Star" } },
  { x: 281, y: 107, data: { classification: "Star" } },
  { x: 266, y: 111, data: { classification: "Dwarf" } },
  { x: 266, y: 93, data: { classification: "Giant" } },
  { x: 256, y: 73, data: { classification: "Dwarf" } },
  { x: 242, y: 73, data: { classification: "Dwarf" } },
  { x: 236, y: 65, data: { classification: "Dwarf" } },
  { x: 222, y: 70, data: { classification: "Giant" } },
  { x: 226, y: 61, data: { classification: "Star" } },
  { x: 233, y: 60, data: { classification: "Star" } },
  { x: 213, y: 58, data: { classification: "Star" } },
];

/**
 * Dynamically generated hackathon stars based on city clustering.
 * These represent actual hackathon locations with labels and metadata.
 */
export const US_MAP_HACKATHONS: Star[] = generateHackathonStars(HackathonList);

/**
 * Combined US map: outline + hackathon locations.
 * - First 48 stars (indices 0-47): US outline for drawing the shape
 * - Remaining stars (indices 48+): Hackathon locations with labels
 * 
 * This allows connections to only draw the outline while showing hackathon data.
 */
export const US_MAP: Star[] = [
  ...US_MAP_SIMPLE,      // Indices 0-47: US outline
  ...US_MAP_HACKATHONS   // Indices 48+: Hackathon locations
];

/**
 * Number of outline stars (for use in creating connections)
 */
export const US_OUTLINE_STAR_COUNT = US_MAP_SIMPLE.length;
