"use client";
import Constellation from "@/components/star-revamp/Star/Constellation";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { ConstellationData, TransformData, FocusedConstellationPos } from "@/interfaces/StarInterfaces";
import { use, useEffect, useMemo, useState } from "react";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { Group, Rect } from "react-konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import { CONSTELLATIONS } from "@/components/star-revamp/Star/ConstellationList";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import { usePathname, useRouter } from "next/navigation";

/**
 * Responsive star field: positions constellations relative to screen center
 * and scales offsets from design center. Star coordinates and sizes stay fixed.
 */

const DESIGN = { width: 2560, height: 1271 }; // design reference

/** Pre-computed offsets from design center */
const designCenter = { x: DESIGN.width / 2, y: DESIGN.height / 2 };

export default function MainStarField({
  setFocusedConstellationPosAction,
}: {
  setFocusedConstellationPosAction: React.Dispatch<
    React.SetStateAction<FocusedConstellationPos | null>
  >;
}) {
  const { width, height, windowCenter } = useWindowSizeContext();
  const {
    setOverlayTextContents: setCenterOverlayTextContents,
    resetOverlayTextContents: resetCenterOverlayTextContents,
    setOverlayVisibility: setCenterOverlayVisibility,
  } = useCenterOverlayContext();

  const {
    setOverlayTextContents: setTopOverlayTextContents,
    resetOverlayTextContents: resetTopOverlayTextContents,
    setOverlayVisibility: setTopOverlayVisibility,
  } = useTopOverlayContext();

  const scale = Math.min(width / DESIGN.width, height / DESIGN.height); // uniform scale

  const [selectedConstellation, setSelectedConstellation] =
    useState<ConstellationData | null>(null);
  const [focusedScreenPos, setFocusedScreenPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

  useMemo(() => {
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

      // Calculate unfocused position (where the constellation starts)
      const unfocusedX = transformDataForSelected.x + centerX;
      const unfocusedY = transformDataForSelected.y + centerY;

      // Focused position is at windowCenter
      focusedScreenPos = {
        x: windowCenter.x,
        y: windowCenter.y,
      };
      
      setFocusedConstellationPosAction({
        x: focusedScreenPos.x,
        y: focusedScreenPos.y,
        unfocusedX,
        unfocusedY,
        constellation: c,
      });
      setFocusedScreenPos(focusedScreenPos);
    }
  }, [selectedConstellation]);

  const router = useRouter();
  const pathname = usePathname();

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
            setFocusedConstellationPosAction(null);
            resetCenterOverlayTextContents();
            setCenterOverlayVisibility(true);
            setTopOverlayVisibility(false);
          }
          // if we are not in the root path, navigate to the root
          if (pathname !== "/") {
            router.push("/");
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
              setTopOverlayTextContents({
                intro: c.intro,
                title: c.name,
                origin: c.about,
                about: "",
              });
              setCenterOverlayVisibility(false);
              setTopOverlayVisibility(true);
            }}
            focusedConstellation={selectedConstellation}
            // pass the focused constellation screen position (same for all constellations)
            focusedScreenPos={focusedScreenPos}
            onHoverEnterCallback={() => {
              if (!selectedConstellation) {
                setCenterOverlayTextContents({
                  intro: c.intro,
                  title: c.name,
                  origin: c.origin,
                  about: c.about,
                });
              }
            }}
            onHoverLeaveCallback={() => {
              if (selectedConstellation !== c) {
                resetCenterOverlayTextContents();
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
              setCenterOverlayTextContents({
                intro: "The North Star",
                title: "Polaris",
                origin: 'Latin: "pole star". A celestial guide.',
                about: "A beacon to help you navigate the stars",
              });
            }}
            onHoverLeaveCallback={() => {
              resetCenterOverlayTextContents();
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
