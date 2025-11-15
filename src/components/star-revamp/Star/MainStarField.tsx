import { Group } from "react-konva";
import Constellation from "@/components/star-revamp/Star/Constellation";
import { US_MAP, transformPoints } from "./us_map";

/**
 * This component renders all of the foreground stars which are constellations
 */
export default function MainStarField() {
  const aboutConstellation = [
    { x: 80, y: 40, size: 5 }, // top point
    { x: 50, y: 70, size: 5 }, // left point
    { x: 110, y: 70, size: 5 }, // right point
    { x: 80, y: 140, size: 5 }, // bottom point
  ];

  const transformedAboutConstellation = transformPoints(aboutConstellation, {
    rotation: 32,
    tx: 850,
    ty: 400,
    scale: 1.5,
  });

  // Draw the kite
  const aboutConnections: [number, number][] = [
    [0, 1], // top → left
    [1, 3], // left → bottom
    [0, 2], // top → right
    [2, 3], // right → bottom
  ];

  const projectsConstellation = [
    { x: 80, y: 145, size: 4 },
    { x: 100, y: 150, size: 5 },
    { x: 140, y: 130, size: 4 },
    { x: 180, y: 160, size: 5 },
    { x: 160, y: 190, size: 3 },
    { x: 200, y: 210, size: 4 },
    { x: 240, y: 180, size: 5 },
    { x: 220, y: 150, size: 3 },
    { x: 260, y: 130, size: 4 },
    { x: 280, y: 170, size: 3 },
    { x: 300, y: 150, size: 4 },
  ];

  const transformedProjectsConstellation = transformPoints(
    projectsConstellation,
    {
      ty: 700,
      tx: 700,
    }
  );

  const careerConstellation = [
    { x: 200, y: 50, size: 5 },
    { x: 220, y: 70, size: 4 },
    { x: 240, y: 60, size: 5 },
    { x: 260, y: 80, size: 4 },
    { x: 280, y: 90, size: 6 },
  ];

  const transformedCareerConstellation = transformPoints(careerConstellation, {
    tx: 1300,
    ty: 400,
  });

  const hackathonConstellation = transformPoints(US_MAP, {
    scale: 1.5,
    rotation: 10,
    tx: 1500,
    ty: 600,
  });

  return (
    <Group>
      <Constellation
        stars={transformedAboutConstellation}
        connections={aboutConnections}
      />
      <Constellation stars={transformedCareerConstellation} />
      <Constellation stars={transformedProjectsConstellation} />
      <Constellation stars={hackathonConstellation} />
    </Group>
  );
}
