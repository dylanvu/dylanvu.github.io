import {
  ConstellationData,
  Star,
  StarData,
  StarDataWithInternalLink,
} from "@/interfaces/StarInterfaces";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { createSequentialLoopingConnections } from "@/components/star-revamp/Star/starUtils";

const STAR_BASE_URL = "/star";

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
        size: 6,
        data: {
          label: "Email",
          origin: "dylanvu9@gmail.com",
          about: "",
          externalLink: "mailto:dylanvu9@gmail.com",
          intro: "Supergiant",
        },
      },
      {
        x: 100,
        y: 40,
        size: 5,
        data: {
          label: "GitHub",
          origin: "github.com/dylanvu",
          about: "See my code",
          externalLink: "https://github.com/dylanvu",
          intro: "Giant",
        },
      },
      {
        x: 55,
        y: 90,
        size: 4,
        data: {
          label: "LinkedIn",
          origin: "/in/dylanvu9",
          about: "Connect with me",
          externalLink: "https://www.linkedin.com/in/dylanvu9/",
          intro: "Star",
        },
      },
      {
        x: 105,
        y: 100,
        size: 3,
        data: {
          label: "Medium",
          origin: "@mentor-mementos",
          about: "I write about hackathon mentoring",
          externalLink: "https://medium.com/@mentor-mementos",
          intro: "Dwarf",
        },
      },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [0, 3],
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
        size: 6,
        data: {
          label: "Resume",
          origin: "Present",
          about: "See Iter outside this night sky",
          externalLink: "/Dylan_Vu_Resume.pdf",
          intro: "Supergiant",
        },
      },
      {
        x: 210,
        y: 55,
        size: 5,
        data: {
          label: "Amazon",
          origin: "Jul. 2024 - Present",
          about: "Software Dev Engineer I",
          intro: "Giant",
        },
      },
      {
        x: 240,
        y: 48,
        size: 4,
        data: {
          label: "One Medical",
          origin: "May 2023 - Aug. 2023",
          about: "Software Engineer Intern",
          intro: "Star",
        },
      },

      {
        x: 265,
        y: 60,
        size: 5,
        data: {
          label: "Ansync Labs",
          origin: "Dec. 2021 - Sept. 2022",
          about: "Software Developer I / Intern",
          intro: "Giant",
        },
      },

      // education only
      {
        x: 222,
        y: 80,
        size: 4,
        data: {
          label: "Georgia Tech",
          origin: "Aug. 2024 - Present",
          about: "Computer Science, M.S.",
          intro: "Star",
        },
      },
      {
        x: 245,
        y: 94,
        size: 6,
        data: {
          label: "UC Irvine",
          origin: "Sept. 2022 - Jun. 2024",
          about: "Computer Science, B.S.",
          intro: "Supergiant",
        },
      },
      {
        x: 274,
        y: 82,
        size: 3,
        data: {
          label: "UC Santa Barbara",
          origin: "Aug. 2019 - June 2021",
          about: "Mechanical Engineering / Chemical Engineering",
          intro: "Dwarf",
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
        size: 6,
        data: {
          label: "Epicdle",
          origin: "Web Development",
          about: "A fandom's favorite guessing game",
          intro: "Supergiant",
          internalLink: `${STAR_BASE_URL}/epicdle`,
          slug: "epicdle",
        },
      },
      {
        x: 75,
        y: 140,
        size: 5,
        data: {
          label: "Amelia",
          origin: "Embedded Systems",
          about: "Google Gemini becomes a robotic tour guide",
          intro: "Giant",
          internalLink: `${STAR_BASE_URL}/amelia`,
          slug: "amelia",
        },
      },
      {
        x: 80,
        y: 170,
        size: 5,
        data: {
          label: "SweetStack",
          origin: "Game Development",
          about: "A cute cake stacking game that was hard to code",
          intro: "Giant",
          internalLink: `${STAR_BASE_URL}/sweetstack`,
          slug: "sweetstack",
        },
      },
      {
        x: 90,
        y: 190,
        size: 5,
        data: {
          label: "Haptic Definition",
          origin: "Embedded Systems",
          about: "Bluetooth haptic and thermal feedback gloves and suit",
          intro: "Giant",
          internalLink: `${STAR_BASE_URL}/haptic-definition`,
          slug: "haptic-definition",
        },
      },
      {
        x: 112,
        y: 210,
        size: 4,
        data: {
          label: "FishGPT",
          origin: "Web Development",
          about: "Talk to your fish",
          intro: "Star",
          internalLink: `${STAR_BASE_URL}/fishgpt`,
          slug: "fishgpt",
        },
      },
      {
        x: 140,
        y: 202,
        size: 4,
        data: {
          label: "WordShip",
          origin: "Game Development",
          about: "A fast-paced manic shooter for Wordle",
          intro: "Star",
          internalLink: `${STAR_BASE_URL}/wordship`,
          slug: "wordship",
        },
      },
      {
        x: 160,
        y: 193,
        size: 3,
        data: {
          label: "GRIP Board",
          origin: "Embedded Systems",
          about: "Turn any whiteboard into a smartboard",
          intro: "Dwarf",
          internalLink: `${STAR_BASE_URL}/grip-board`,
          slug: "grip-board",
        },
      },
      {
        x: 173,
        y: 167,
        size: 5,
        data: {
          label: "GRIP Controller",
          origin: "Game Development",
          about: "A custom tactile feedback VR controller",
          intro: "Star",
          internalLink: `${STAR_BASE_URL}/grip`,
          slug: "grip",
        },
      },
      {
        x: 180,
        y: 148,
        size: 3,
        data: {
          label: "Trigger Finger Tango",
          origin: "Game Development",
          about: "Shoot in a game with your hands",
          intro: "Dwarf",
          internalLink: `${STAR_BASE_URL}/trigger-finger-tango`,
          slug: "trigger-finger-tango",
        },
      },
      {
        x: 176,
        y: 123,
        size: 3,
        data: {
          label: "AIChE Careers Bot",
          origin: "Web Development",
          about: "A Discord bot to solve a club's career crisis",
          intro: "Dwarf",
          internalLink: `${STAR_BASE_URL}/aiche-careers`,
          slug: "aiche-careers",
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

      // Check if 'slug' exists in data (Type Guard for StarDataWithInternalLink)
      // and if it matches the input slug
      if ("slug" in star.data && star.data.slug === slug) {
        return true;
      }

      return false;
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
      if (star.data && "slug" in star.data && star.data.slug === slug) {
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
            intro: starData.intro,
            ...(starData.color && { color: starData.color }),
            ...("internalLink" in starData &&
              starData.internalLink && {
                internalLink: starData.internalLink,
              }),
            ...("slug" in starData && starData.slug && { slug: starData.slug }),
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
