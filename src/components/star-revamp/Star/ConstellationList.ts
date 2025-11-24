import {
  ConstellationData,
  Star,
  StarDataWithInternalLink,
  isStarDataWithInternalLink,
} from "@/interfaces/StarInterfaces";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { createSequentialLoopingConnections } from "@/components/star-revamp/Star/starUtils";
import { STAR_BASE_URL } from "@/constants/Routes";

export const CONSTELLATIONS: ConstellationData[] = [
  {
    // my contact me links
    name: "Viae",
    origin: 'Latin: "roads". Outlines converging roads.',
    about: "The gateway to worlds beyond this night sky",
    intro: "Constellation",
    stars: [
      {
        x: 80,
        y: 70,
        data: {
          label: "Email",
          origin: "dylanvu9@gmail.com",
          about: "",
          externalLink: "mailto:dylanvu9@gmail.com",
          classification: "Supergiant",
        },
      },
      {
        x: 100,
        y: 40,
        data: {
          label: "GitHub",
          origin: "github.com/dylanvu",
          about: "See my code",
          externalLink: "https://github.com/dylanvu",
          classification: "Giant",
        },
      },
      {
        x: 82,
        y: 26,
        data: {
          label: "Devpost",
          origin: "devpost.com/dylanvu",
          about: "My hackathons",
          externalLink: "https://devpost.com/dylanvu",
          classification: "Star"
        }
      },
      {
        x: 55,
        y: 90,
        data: {
          label: "LinkedIn",
          origin: "/in/dylanvu9",
          about: "Connect with me",
          externalLink: "https://www.linkedin.com/in/dylanvu9/",
          classification: "Star",
        },
      },
      {
        x: 105,
        y: 100,
        data: {
          label: "Medium",
          origin: "@mentor-mementos",
          about: "I write about hackathon mentoring",
          externalLink: "https://medium.com/@mentor-mementos",
          classification: "Dwarf",
        },
      },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [0, 3],
      [0, 4],
    ],
    designX: 850,
    designY: 400,
    rotation: 32,
    scale: 1.5,
    focusScale: 2.4,
  },
  {
    // the career constellation
    name: "Iter",
    origin: 'Latin: "journey, path". Draws a winding path.',
    about: "My journey from learning to creating",
    intro: "The Major & Minor",
    stars: [
      {
        x: 183,
        y: 50,
        data: {
          label: "Resume",
          origin: "Present",
          about: "See Iter outside this night sky",
          externalLink: "/Dylan_Vu_Resume.pdf",
          classification: "Supergiant",
        },
      },
      {
        x: 210,
        y: 55,
        data: {
          label: "Amazon",
          origin: "Jul. 2024 - Present",
          about: "Software Dev Engineer I",
          classification: "Giant",
          slug: "amazon"
        },
      },
      {
        x: 240,
        y: 48,
        data: {
          label: "One Medical",
          origin: "May 2023 - Aug. 2023",
          about: "Software Engineer Intern",
          classification: "Star",
          slug: "one-medical"
        },
      },

      {
        x: 265,
        y: 60,
        data: {
          label: "Ansync Labs",
          origin: "Dec. 2021 - Sept. 2022",
          about: "Software Developer I / Intern",
          classification: "Giant",
          slug: "ansync-labs"
        },
      },

      // education only
      {
        x: 222,
        y: 80,
        data: {
          label: "Georgia Tech",
          origin: "Aug. 2024 - Present",
          about: "Computer Science, M.S.",
          classification: "Star",
          slug: "gatech"
        },
      },
      {
        x: 245,
        y: 94,
        data: {
          label: "UC Irvine",
          origin: "Sept. 2022 - Jun. 2024",
          about: "Computer Science, B.S.",
          classification: "Supergiant",
          slug: "uci"
        },
      },
      {
        x: 274,
        y: 82,
        data: {
          label: "UC Santa Barbara",
          origin: "Aug. 2019 - June 2021",
          about: "Mechanical Engineering / Chemical Engineering",
          classification: "Dwarf",
          slug: "ucsb"
        },
      },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
    ],
    designX: 1300,
    designY: 400,
    scale: 1.8,
    rotation: 30,
    focusScale: 2.4,
  },
  {
    // the projects constellation
    name: "Arete",
    origin: 'Greek: "excellence, skill". Forms a laurel.',
    about: "The creations I've dreamed of and built",
    intro: "Constellation",
    // make this a laurel
    stars: [
      // remember, larger x = right, larger y = down
      {
        x: 88,
        y: 110,
        data: {
          label: "Epicdle",
          origin: "Sep. 2025 - Present",
          about: "A fandom's favorite guessing game with scale built in mind",
          classification: "Supergiant",
          slug: "epicdle",
        },
      },
      {
        x: 75,
        y: 140,
        data: {
          label: "Haptic Definition",
          origin: "Apr. 2024",
          about: "The pinnacle of my hackathon experience: feel temperature and touch wirelessly",
          classification: "Giant",
          slug: "haptic-definition",
        },
      },
      {
        x: 80,
        y: 170,
        data: {
          label: "Trigger Finger Tango",
          origin: "Feb. 2024",
          about: "Custom Mediapipe gestures control an Unreal Engine destruction simulator",
          classification: "Giant",
          slug: "trigger-finger-tango",
        },
      },
      {
        x: 90,
        y: 190,
        data: {
          label: "Amelia",
          origin: "Jan. 2024",
          about: "A cardboard robot with an LLM brain that accidentally learned to play I-Spy",
          classification: "Giant",
          slug: "amelia",
        },
      },
      {
        x: 112,
        y: 210,
        data: {
          label: "SweetStack",
          origin: "Dec. 2023 - Jan. 2024",
          about: "Adorable cake stacking game hiding gnarly recursive algorithms",
          classification: "Star",
          slug: "sweetstack",
        },
      },
      {
        x: 140,
        y: 202,
        data: {
          label: "FishGPT",
          origin: "Nov. 2023",
          about: "Chat with a real fish using ChatGPT, computer vision, and 5 gallons of water",
          classification: "Star",
          slug: "fishgpt",
        },
      },
      {
        x: 160,
        y: 193,
        data: {
          label: "WordShip",
          origin: "Feb. 2022",
          about: "Wordle meets retro arcade shooter with cross-platform WebSocket magic",
          classification: "Dwarf",
          slug: "wordship",
        },
      },
      {
        x: 173,
        y: 167,
        data: {
          label: "AIChE Careers Bot",
          origin: "Dec. 2021 - Feb. 2022",
          about: "TypeScript Discord bot that auto-delivers LinkedIn jobs to an entire department",
          classification: "Star",
          slug: "aiche-careers",
        },
      },
      {
        x: 180,
        y: 148,
        data: {
          label: "GRIP Board",
          origin: "Sep. 2021",
          about: "Camera calibration magic transforms whiteboards into smart boards",
          classification: "Dwarf",
          slug: "grip-board",
        },
      },
      {
        x: 176,
        y: 123,
        data: {
          label: "GRIP Controller",
          origin: "Apr. 2021",
          about: "Tactile VR controller with pneumatic feedback for realistic grasping",
          classification: "Dwarf",
          slug: "grip",
        },
      },
    ],
    designX: 700,
    designY: 700,
    rotation: 200,
    scale: 1.5,
    focusScale: 2.4,
  },
  {
    // hackathon map constellation
    name: "Elevare",
    origin: 'Latin: "to elevate". Depicts a nation.',
    about: "The hackathons where I've grown and mentored",
    intro: "Constellation",
    stars: US_MAP,
    connections: createSequentialLoopingConnections(US_MAP),
    designX: 1600,
    designY: 800,
    rotation: 10,
    scale: 1.5,
    totalDuration: 6,
    focusScale: 2,
  },
];

/**
 * Finds the name of the constellation that contains a star with the specific slug.
 * Returns null if no matching star is found.
 */
export function getConstellationNameByStarSlug(slug: string): string | null {
  // 1. Loop through each constellation
  for (const constellation of CONSTELLATIONS) {
    // 2. Check if this constellation contains the specific star
    const hasMatchingStar = constellation.stars.some((star) => {
      // If star has no data, it's not a match
      if (!star.data) return false;

      // Use typeguard to check if star has internal link and matches slug
      return isStarDataWithInternalLink(star.data) && star.data.slug === slug;
    });

    // 3. If found, return the name immediately
    if (hasMatchingStar) {
      return constellation.name;
    }
  }

  // 4. Return null if not found in any constellation
  return null;
}

/**
 * 1. Retrieves the full constellation object matching the specific name.
 */
export function getConstellationDataByName(
  name: string
): ConstellationData | null {
  const result = CONSTELLATIONS.find((c) => c.name === name);
  if (result) return result;
  return null;
}

/**
 * Retrieves the specific StarData for a given slug.
 *
 * @param slug - The unique slug of the star
 * @param constellationName - (Optional) Optimization: if you know the constellation,
 *                            look only there instead of scanning everything.
 */
export function getStarDataBySlug(
  slug: string,
  constellationName?: string
): StarDataWithInternalLink | null {
  // Helper: Checks a specific list of stars for the slug
  const findStarInList = (stars: Star[]): StarDataWithInternalLink | null => {
    for (const star of stars) {
      if (star.data && isStarDataWithInternalLink(star.data) && star.data.slug === slug) {
        return star.data;
      }
    }
    return null;
  };

  // OPTION 1: Constellation name provided (Shortcut)
  if (constellationName) {
    const constellation = CONSTELLATIONS.find(
      (c) => c.name === constellationName
    );

    // If constellation exists, search only its stars
    if (constellation) {
      return findStarInList(constellation.stars);
    }

    // If constellation name was invalid, return undefined
    // (or remove this return to fallback to searching all constellations)
    return null;
  }

  // OPTION 2: No constellation name provided (Search All)
  for (const constellation of CONSTELLATIONS) {
    const match = findStarInList(constellation.stars);
    if (match) return match;
  }

  return null;
}

/**
 * Formats constellation data for LLM consumption by removing all transformation
 * and position data, keeping only semantic information about the constellations
 * and stars.
 *
 * This function removes:
 * - Star positioning (x, y, size)
 * - Constellation transformations (designX, designY, rotation, scale, focusScale, totalDuration)
 * - Visual connections between stars
 *
 * It preserves:
 * - Constellation metadata (name, origin, about, intro)
 * - Star data (label, origin, about, intro, color, links)
 *
 * @returns A formatted string representing all constellations and their stars
 */
export function formatConstellationForLLM(): string {
  const formattedData = CONSTELLATIONS.map((constellation) => {
    // Extract only semantic constellation data
    const constellationInfo = {
      name: constellation.name,
      origin: constellation.origin,
      about: constellation.about,
      intro: constellation.intro,
      stars: constellation.stars
        .filter((star) => star.data) // Only include stars with data
        .map((star) => {
          const starData = star.data!;
          return {
            label: starData.label,
            origin: starData.origin,
            about: starData.about,
            classification: starData.classification,
            ...(starData.color && { color: starData.color }),
            ...(isStarDataWithInternalLink(starData) && { 
              slug: starData.slug,
              internalLink: `${STAR_BASE_URL}/${starData.slug}`
            }),
            ...("externalLink" in starData &&
              starData.externalLink && {
                externalLink: starData.externalLink,
              }),
          };
        }),
    };

    return constellationInfo;
  });

  // Convert to JSON string for easy LLM consumption
  return JSON.stringify(formattedData, null, 2);
}
