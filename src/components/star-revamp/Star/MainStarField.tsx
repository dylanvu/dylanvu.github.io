"use client";
import Constellation from "@/components/star-revamp/Star/Constellation";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useState } from "react";
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";
import { Group, Rect } from "react-konva";
import MainStar from "@/components/star-revamp/Star/MainStar";

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
    scale: 2.2,
  },
  {
    name: "Arete",
    origin: 'Greek: "excellence, skill"',
    about: "A constellation of creations I've built and designed",
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
    // hackathon map constellation
    name: "Elevare",
    origin: 'Latin: "to elevate"',
    about: "A map of hackathons where I've grown and mentored others",
    stars: US_MAP,
    designX: 1600,
    designY: 800,
    rotation: 10,
    scale: 1.5,
    totalDuration: 6,
  },
];

export default function MainStarField() {
  const { width, height } = useWindowSizeContext();
  const { setOverlayVisibility } = useMainStageOverlayContext();
  const windowCenter = { x: width / 2, y: height / 2 };
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height); // uniform scale

  const [selectedConstellation, setSelectedConstellation] =
    useState<ConstellationData | null>(null);

  const windowCenterValue = {
    x: windowCenter.x,
    y: windowCenter.y,
  };

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        // 'transparent' won't reliably pick events; use tiny alpha so Konva treats it as filled
        fill="rgba(0,0,0,0.001)"
        onClick={() => {
          console.log("Clicked background");
          if (selectedConstellation) {
            console.log("Unselecting constellation");
            setSelectedConstellation(null);
            setOverlayVisibility(true);
          }
        }}
      />
      {CONSTELLATIONS.map((c, i) => {
        let isFocused = false;
        if (selectedConstellation) {
          if (selectedConstellation.name === c.name) {
            isFocused = true;
          } else {
            return null;
          }
        }
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

        return (
          <Constellation
            data={c}
            windowCenter={windowCenterValue}
            transformData={transformData}
            key={i}
            onClickCallback={() => {
              setSelectedConstellation(c);
              setOverlayVisibility(false);
            }}
            isFocused={isFocused}
            // showBoundingBox={true}
          />
        );
      })}
      {/* Polaris, the guiding chatbot star */}
      {(() => {
        const polarisDesignX = designCenter.x - 100;
        const polarisDesignY = 400; // biiger number moves it down
        const polarisOffsetX = (polarisDesignX - designCenter.x) * scale;
        const polarisOffsetY = (polarisDesignY - designCenter.y) * scale;
        const polarisScreenX = windowCenter.x + polarisOffsetX;
        const polarisScreenY = windowCenter.y + polarisOffsetY;
        return !selectedConstellation ? (
          <MainStar
            x={polarisScreenX}
            y={polarisScreenY}
            size={5}
            brightness={5}
            twinkleMin={4.9}
            twinkleMax={5.1}
          />
        ) : null;
      })()}
    </Group>
  );
}
