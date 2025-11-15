import { Group } from "react-konva";
import Constellation from "@/components/star-revamp/Star/Constellation";
import { US_MAP, transformPoints } from "./us_map";

/**
 * This component renders all of the foreground stars which are constellations
 */
export default function MainStarField() {
  const aboutConstellation = [
    { x: 50, y: 50, size: 6 },
    { x: 80, y: 60, size: 5 },
    { x: 110, y: 80, size: 5 },
  ];

  const projectsConstellation = [
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

  const careerConstellation = [
    { x: 200, y: 50, size: 5 },
    { x: 220, y: 70, size: 4 },
    { x: 240, y: 60, size: 5 },
    { x: 260, y: 80, size: 4 },
  ];

  const transformedCareerConstellation = transformPoints(careerConstellation, {
    tx: 2000,
  });

  const hackathonConstellation = transformPoints(US_MAP, {
    scale: 2,
    rotation: 10,
    tx: 1800,
    ty: 700,
  });

  return (
    <Group>
      <Constellation stars={aboutConstellation} />
      <Constellation stars={transformedCareerConstellation} />
      <Constellation stars={projectsConstellation} />
      <Constellation stars={hackathonConstellation} />
    </Group>
  );
}
