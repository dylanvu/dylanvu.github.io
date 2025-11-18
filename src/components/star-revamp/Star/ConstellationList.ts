import { ConstellationData } from "@/interfaces/StarInterfaces";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { createSequentialLoopingConnections } from "@/components/star-revamp/Star/starUtils";

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
        size: 5,
        data: {
          label: "Epicdle",
          origin: "Web Development",
          about: "A fandom's favorite guessing game",
          intro: "Giant",
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
    intro: "Constellation",
    stars: US_MAP,
    connections: createSequentialLoopingConnections(US_MAP),
    designX: 1600,
    designY: 800,
    rotation: 10,
    scale: 1.5,
    totalDuration: 6,
  },
];
