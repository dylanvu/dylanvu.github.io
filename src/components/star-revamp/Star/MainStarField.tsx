"use client";
import Constellation from "@/components/star-revamp/Star/Constellation";
import { US_MAP_SIMPLE as US_MAP } from "./us_map";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";
import { useState } from "react";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { Group, Rect } from "react-konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import { createSequentialLoopingConnections } from "@/components/star-revamp/Star/starUtils";

/**
 * Responsive star field: positions constellations relative to screen center
 * and scales offsets from design center. Star coordinates and sizes stay fixed.
 */

const DESIGN = { width: 2560, height: 1271 }; // design reference

/** Pre-computed offsets from design center */
const designCenter = { x: DESIGN.width / 2, y: DESIGN.height / 2 };

const ViaeStars = [
  { x: 80, y: 70, size: 5, label: "Email" },
  { x: 100, y: 40, size: 4, label: "GitHub" },
  { x: 55, y: 90, size: 4, label: "LinkedIn" },
  { x: 105, y: 100, size: 3, label: "Medium" },
];

const CONSTELLATIONS: ConstellationData[] = [
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
      { x: 200, y: 50, size: 5, label: "Resume" },
      { x: 220, y: 55, size: 4, label: "Amazon" },
      { x: 240, y: 48, size: 5, label: "UC Irvine" },
      { x: 260, y: 54, size: 4, label: "Ansync Labs" },
      { x: 280, y: 60, size: 6, label: "UC Santa Barbara" },
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
      { x: 88, y: 110, size: 4, label: "Epicdle" },
      { x: 75, y: 140, size: 5, label: "Amelia" },
      { x: 80, y: 170, size: 4, label: "SweetStack" },
      { x: 90, y: 190, size: 5, label: "Haptic Definition" },
      { x: 112, y: 210, size: 3, label: "FishGPT" },
      { x: 140, y: 202, size: 4, label: "WordShip" },
      { x: 160, y: 193, size: 5, label: "GRIP Board" },
      { x: 173, y: 167, size: 3, label: "GRIP Controller" },
      { x: 180, y: 138, size: 4, label: "Trigger Finger Tango" },
      { x: 176, y: 123, size: 4, label: "Discord Careers Bot" },
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

export default function MainStarField() {
  const { width, height } = useWindowSizeContext();
  const {
    setTitlePosition,
    setTitleText,
    setOriginText,
    setAboutText,
    setIntroText,
    resetOverlayTextContents,
  } = useCenterOverlayContext();
  const windowCenter = { x: width / 2, y: height / 2 };
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height); // uniform scale

  const [selectedConstellation, setSelectedConstellation] =
    useState<ConstellationData | null>(null);

  // helper to compute the constellation center in its local coordinates
  const computeCenter = (stars: { x: number; y: number }[]) => {
    const xs = stars.map((s) => s.x);
    const ys = stars.map((s) => s.y);
    const minX = Math.min(...xs) - 10;
    const maxX = Math.max(...xs) + 10;
    const minY = Math.min(...ys) - 10;
    const maxY = Math.max(...ys) + 10;
    const widthLocal = maxX - minX;
    const heightLocal = maxY - minY;
    const centerX = minX + widthLocal / 2;
    const centerY = minY + heightLocal / 2;
    return { minX, minY, widthLocal, heightLocal, centerX, centerY };
  };

  // compute focused constellation screen center (if any)
  let focusedScreenPos: { x: number; y: number } | null = null;
  if (selectedConstellation) {
    const c = selectedConstellation;
    const { centerX, centerY } = computeCenter(c.stars);
    const offsetX = (c.designX - designCenter.x) * scale;
    const offsetY = (c.designY - designCenter.y) * scale;
    const transformDataForSelected = {
      x: windowCenter.x + offsetX,
      y: windowCenter.y + offsetY,
      rotation: c.rotation ?? 0,
      scaleX: c.scale ?? 1,
      scaleY: c.scale ?? 1,
    } as TransformData;

    focusedScreenPos = {
      x: transformDataForSelected.x + centerX,
      y: transformDataForSelected.y + centerY,
    };
  }

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.001)"
        onClick={() => {
          if (selectedConstellation) {
            setSelectedConstellation(null);
            resetOverlayTextContents();
            setTitlePosition("center");
          }
        }}
      />
      {CONSTELLATIONS.map((c, i) => {
        // compute offset from design center and scale it (same as you already have)
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
            windowCenter={windowCenter}
            transformData={transformData}
            key={i}
            onClickCallback={() => {
              setSelectedConstellation(c);
              setTitlePosition("bottom");
              setIntroText("");
              setOriginText(c.about);
              setAboutText("");
            }}
            focusedConstellation={selectedConstellation}
            // pass the focused constellation screen position (same for all constellations)
            focusedScreenPos={focusedScreenPos}
            onHoverEnterCallback={() => {
              if (!selectedConstellation) {
                setTitleText(c.name);
                setOriginText(c.origin);
                setAboutText(c.about);
                setIntroText("Constellation");
              }
            }}
            onHoverLeaveCallback={() => {
              if (selectedConstellation !== c) {
                resetOverlayTextContents();
              }
            }}
          />
        );
      })}
      {/* Polaris, the guiding chatbot star */}
      {(() => {
        const polarisDesignX = designCenter.x + 2;
        const polarisDesignY = 200; // biiger number moves it down
        const polarisOffsetX = (polarisDesignX - designCenter.x) * scale;
        const polarisOffsetY = (polarisDesignY - designCenter.y) * scale;
        const polarisScreenX = windowCenter.x + polarisOffsetX;
        const polarisScreenY = windowCenter.y + polarisOffsetY;
        return (
          <MainStar
            x={polarisScreenX}
            y={polarisScreenY}
            size={5}
            brightness={5}
            twinkleMin={4.9}
            twinkleMax={5.1}
            windowCenter={windowCenter} // fallback
            focusedScreenPos={focusedScreenPos} // pass in the focused constellation's screen center
            onHoverEnterCallback={() => {
              setTitleText("Polaris");
              setOriginText("The Celestial Guide");
              setAboutText("A beacon to help you navigate the stars");
              setIntroText("Star");
            }}
            onHoverLeaveCallback={() => {
              resetOverlayTextContents();
              // polaris is outside of any constellation, so leaving the star should bring the cursor back to normal, whereas other constellations still have the pointer style
              document.body.style.cursor = "default";
            }}
            // label="Polaris"
          />
        );
      })()}
    </Group>
  );
}
