"use client";
import Constellation from "@/components/star-revamp/Star/Constellation";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";

/**
 * Responsive star field: positions constellations relative to screen center
 * and scales offsets from design center. Star coordinates and sizes stay fixed.
 */

const DESIGN = { width: 2560, height: 1271 }; // design reference

/** Pre-computed offsets from design center */
const designCenter = { x: DESIGN.width / 2, y: DESIGN.height / 2 };

const CONSTELLATIONS: ConstellationData[] = [
  {
    name: "Viae",
    origin: 'Latin: "roads"',
    about: "The gateway to worlds beyond this night sky",
    stars: [
      { x: 80, y: 40, size: 5 },
      { x: 50, y: 70, size: 5 },
      { x: 110, y: 70, size: 5 },
      { x: 80, y: 140, size: 5 },
    ],
    connections: [
      [0, 1],
      [1, 3],
      [0, 2],
      [2, 3],
    ],
    designX: 850,
    designY: 400,
    rotation: 32,
    scale: 1.5,
  },
  {
    name: "Iter",
    origin: 'Latin: "journey, path"',
    about: "The path I've traveled from learning to creating",
    stars: [
      { x: 200, y: 50, size: 5 },
      { x: 220, y: 70, size: 4 },
      { x: 240, y: 60, size: 5 },
      { x: 260, y: 80, size: 4 },
      { x: 280, y: 90, size: 6 },
    ],
    designX: 1300,
    designY: 400,
  },
  {
    name: "Arete",
    origin: 'Greek: "excellence"',
    about: "A constellatiojn of creations I've built and designed",
    stars: [
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
    ],
    designX: 700,
    designY: 700,
  },
  {
    name: "Elevare",
    origin: 'Latin: "to elevate"',
    about: "A map of hackathons where I've grown and guided others",
    stars: US_MAP,
    designX: 1500,
    designY: 600,
    rotation: 10,
    scale: 1.5,
    totalDuration: 6,
  },
];

export default function MainStarField() {
  const { width, height } = useWindowSizeContext();
  const windowCenter = { x: width / 2, y: height / 2 };
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height); // uniform scale

  return (
    <>
      {CONSTELLATIONS.map((c, i) => {
        // compute offset from design center and scale it
        const offsetX = (c.designX - designCenter.x) * scale;
        const offsetY = (c.designY - designCenter.y) * scale;
        const transformData: TransformData = {
          x: windowCenter.x + offsetX,
          y: windowCenter.y + offsetY,
          rotation: c.rotation ?? 0,
          scaleX: c.scale ?? 1,
          scaleY: c.scale ?? 1,
        };
        return <Constellation data={c} transformData={transformData} key={i} />;
      })}
    </>
  );
}
