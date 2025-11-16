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
    // my contact me links
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
      [3, 2],
      [2, 0],
    ],
    designX: 850,
    designY: 400,
    rotation: 32,
    scale: 1.5,
  },
  {
    // the career constellation
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
    scale: 1.8,
  },
  {
    // the projects constellation
    name: "Arete",
    origin: 'Greek: "excellence, skill"',
    about: "A constellation of creations I've built and designed",
    // make this a crown
    stars: [
      // remember, larger x = right, larger y = down
      { x: 80, y: 145, size: 4 }, // bottom left of first spike
      { x: 100, y: 120, size: 5 }, // first spike
      { x: 140, y: 142, size: 4 }, // left base of middle spike
      { x: 180, y: 100, size: 5 }, // top of middle spike
      { x: 200, y: 145, size: 3 }, // right base of middle spike
      { x: 225, y: 115, size: 4 }, // top of right spike
      { x: 240, y: 140, size: 5 }, // bottom right of right spike
      { x: 238, y: 190, size: 3 }, // directly down from right spike
      { x: 168, y: 190, size: 4 }, // mid of spike base
      { x: 82, y: 190, size: 4 }, // now directly left
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 0],
    ],
    designX: 700,
    designY: 700,
    rotation: 2,
    scale: 1.5,
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
  const {
    setOverlayVisibility,
    setTitleText,
    setOriginText,
    setAboutText,
    setIntroText,
    DEFAULT_INTRO_TEXT,
    DEFAULT_ABOUT_TEXT,
    DEFAULT_ORIGIN_TEXT,
    DEFAULT_TITLE_TEXT,
  } = useMainStageOverlayContext();
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
            showBoundingBox={true}
          />
        );
      })}
      {/* Polaris, the guiding chatbot star */}
      {(() => {
        const polarisDesignX = designCenter.x;
        const polarisDesignY = 200; // biiger number moves it down
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
            onHoverEnterCallback={() => {
              setTitleText("Polaris");
              setOriginText("The Guiding Star");
              setAboutText("A beacon to help you navigate the night sky");
              setIntroText("Star");
            }}
            onHoverLeaveCallback={() => {
              setTitleText(DEFAULT_TITLE_TEXT);
              setOriginText(DEFAULT_ORIGIN_TEXT);
              setAboutText(DEFAULT_ABOUT_TEXT);
              setIntroText(DEFAULT_INTRO_TEXT);
            }}
            label="Polaris"
          />
        ) : null;
      })()}
    </Group>
  );
}
