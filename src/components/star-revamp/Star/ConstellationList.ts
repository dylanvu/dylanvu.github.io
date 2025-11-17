import { ConstellationData } from "@/interfaces/StarInterfaces";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { createSequentialLoopingConnections } from "@/components/star-revamp/Star/starUtils";

const ViaeStars = [
  { x: 80, y: 70, size: 5, label: "Email" },
  { x: 100, y: 40, size: 4, label: "GitHub" },
  { x: 55, y: 90, size: 4, label: "LinkedIn" },
  { x: 105, y: 100, size: 3, label: "Medium" },
];

export const CONSTELLATIONS: ConstellationData[] = [
  {
    // my contact me links
    name: "Viae",
    origin: 'Latin: "roads". Outlines converging roads.',
    about: "The gateway to worlds beyond this night sky",
    stars: ViaeStars,
    connections: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    designX: 850,
    designY: 400,
    rotation: 32,
    scale: 1.5,
  },
  {
    // the career constellation
    name: "Iter",
    origin: 'Latin: "journey, path". Draws a winding path.',
    about: "My journey from learning to creating",
    stars: [
      {
        x: 188,
        y: 50,
        size: 5,
        data: {
          label: "Resume",
          origin: "Present",
          about: "",
        },
      },
      {
        x: 220,
        y: 55,
        size: 4,
        data: {
          label: "Amazon",
          origin: "Jul. 2024 - Present",
          about: "Software Dev Engineer I",
        },
      },
      {
        x: 240,
        y: 48,
        size: 5,
        data: {
          label: "One Medical",
          origin: "May 2023 - Aug. 2023",
          about: "Software Engineer Intern",
        },
      },

      {
        x: 280,
        y: 60,
        size: 6,
        data: {
          label: "Ansync Labs",
          origin: "Dec. 2021 - Sept. 2022",
          about: "Software Developer I / Intern",
        },
      },

      // education only
      {
        x: 200,
        y: 80,
        size: 4,
        data: {
          label: "Georgia Institute of Technology",
          origin: "Aug. 2024 - Present",
          about: "Computer Science, M.S.",
        },
      },
      {
        x: 260,
        y: 84,
        size: 4,
        data: {
          label: "UC Irvine",
          origin: "Sept. 2022 - Jun. 2024",
          about: "Computer Science, B.S.",
        },
      },
      {
        x: 305,
        y: 82,
        size: 4,
        data: {
          label: "UC Santa Barbara",
          origin: "Aug. 2019 - June 2021",
          about: "Mechanical Engineering / Chemical Engineering",
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
  },
  {
    // the projects constellation
    name: "Arete",
    origin: 'Greek: "excellence, skill". Forms a laurel.',
    about: "The creations I've dreamed of and built",
    // make this a crown
    stars: [
      // remember, larger x = right, larger y = down
      {
        x: 88,
        y: 110,
        size: 4,
        data: {
          label: "Epicdle",
          origin: "Web Development",
          about: "A fandom's favorite guessing game",
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
        },
      },
      {
        x: 80,
        y: 170,
        size: 4,
        data: {
          label: "SweetStack",
          origin: "Game Development",
          about: "A cute cake stacking game that was hard to code",
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
        },
      },
      {
        x: 112,
        y: 210,
        size: 3,
        data: {
          label: "FishGPT",
          origin: "Web Development",
          about: "Talk to your fish",
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
        },
      },
      {
        x: 160,
        y: 193,
        size: 5,
        data: {
          label: "GRIP Board",
          origin: "Embedded Systems",
          about: "Turn any whiteboard into a smartboard",
        },
      },
      {
        x: 173,
        y: 167,
        size: 3,
        data: {
          label: "GRIP Controller",
          origin: "Game Development",
          about: "A custom tactile feedback VR controller",
        },
      },
      {
        x: 180,
        y: 148,
        size: 4,
        data: {
          label: "Trigger Finger Tango",
          origin: "Game Development",
          about: "Shoot in a game with your hands",
        },
      },
      {
        x: 176,
        y: 123,
        size: 4,
        data: {
          label: "AIChE Careers Bot",
          origin: "Web Development",
          about: "A Discord bot to solve a club's career crisis",
        },
      },
    ],
    designX: 700,
    designY: 700,
    rotation: 200,
    scale: 1.5,
  },
  {
    // hackathon map constellation
    name: "Elevare",
    origin: 'Latin: "to elevate". Depicts a nation.',
    about: "The hackathons where I've grown and mentored",
    stars: US_MAP,
    connections: createSequentialLoopingConnections(US_MAP),
    designX: 1600,
    designY: 800,
    rotation: 10,
    scale: 1.5,
    totalDuration: 6,
  },
];
