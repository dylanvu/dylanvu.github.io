"use client";
import Constellation from "@/components/star-revamp/Star/Constellation/Constellation";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import {
  ConstellationData,
  TransformData,
  FocusedConstellationPos,
} from "@/interfaces/StarInterfaces";
import { useEffect, useMemo, useState } from "react";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { Circle, Group, Rect, Text } from "react-konva";
import Polaris from "@/components/star-revamp/Star/Polaris/Polaris";
import { CONSTELLATIONS } from "@/components/star-revamp/Star/ConstellationList";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import { useRouter } from "next/navigation";
import { useMobile } from "@/hooks/useMobile";
import React from "react";
import { useFocusContext } from "@/hooks/useFocusProvider";

/**
 * Responsive star field: positions constellations relative to screen center
 * and scales offsets from design center. Star coordinates and sizes stay fixed.
 */

const DESIGN = { width: 2560, height: 1271 }; // design reference

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
    setOverlayVisibility: setTopOverlayVisibility,
  } = useTopOverlayContext();

  const [focusedScreenPos, setFocusedScreenPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { focusedObject, setFocusedObject } = useFocusContext();

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
    if (focusedObject.constellation) {
      const c = focusedObject.constellation;
      const { centerX, centerY } = computeCenter(c.stars);
      // Use viewport percentage positioning
      const percentX = c.designX / DESIGN.width;
      const percentY = c.designY / DESIGN.height;
      const transformDataForSelected = {
        x: percentX * width,
        y: percentY * height,
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
  }, [focusedObject.constellation]);

  const router = useRouter();
  const { isMobileLandscape } = useMobile();

  // Handler for background clicks/taps
  const handleBackgroundInteraction = () => {
    if (focusedObject.constellation) {
      setFocusedObject({ constellation: null, star: null });
      setFocusedConstellationPosAction(null);
      setFocusedScreenPos(null);
      resetCenterOverlayTextContents();
      setCenterOverlayVisibility(true);
      setTopOverlayVisibility(false);
    }

      router.push("/");
  };

  // DEBUG MODE - set to false to hide debug markers
  const DEBUG_MODE = false;

  // Update overlays when focusedObject changes
  useEffect(() => {
    if (focusedObject.constellation) {
      setCenterOverlayVisibility(false);
      if (focusedObject.star) {
        setTopOverlayTextContents({
          intro: focusedObject.star.classification,
          title: focusedObject.star.label ?? "",
          origin: focusedObject.star.origin ?? "",
          about: focusedObject.star.about ?? "",
        });
      } else {
        setTopOverlayTextContents({
          intro: focusedObject.constellation.intro,
          title: focusedObject.constellation.name,
          origin: focusedObject.constellation.about,
          about: "",
        });
      }
    }
  }, [focusedObject]);

  return (
    <Group>
      {/* DEBUG: Screen center marker */}
      {DEBUG_MODE && (
        <>
          <Circle
            x={windowCenter.x}
            y={windowCenter.y}
            radius={10}
            fill="red"
            opacity={0.8}
          />
          <Text
            x={windowCenter.x + 15}
            y={windowCenter.y - 5}
            text={`CENTER ${isMobileLandscape ? "(Mobile)" : "(Desktop)"}`}
            fontSize={14}
            fill="red"
            fontStyle="bold"
          />
          {/* Crosshair lines */}
          <Rect
            x={windowCenter.x - 1}
            y={0}
            width={2}
            height={height}
            fill="red"
            opacity={0.3}
          />
          <Rect
            x={0}
            y={windowCenter.y - 1}
            width={width}
            height={2}
            fill="red"
            opacity={0.3}
          />

          {/* Quadrant center markers - only in mobile landscape */}
          {isMobileLandscape && (
            <>
              {/* Top-left quadrant */}
              <Circle
                x={width / 4}
                y={height / 4}
                radius={6}
                fill="lime"
                opacity={0.9}
              />
              <Text
                x={width / 4 + 10}
                y={height / 4 - 5}
                text="TL"
                fontSize={10}
                fill="lime"
              />

              {/* Top-right quadrant */}
              <Circle
                x={(3 * width) / 4}
                y={height / 4}
                radius={6}
                fill="lime"
                opacity={0.9}
              />
              <Text
                x={(3 * width) / 4 + 10}
                y={height / 4 - 5}
                text="TR"
                fontSize={10}
                fill="lime"
              />

              {/* Bottom-left quadrant */}
              <Circle
                x={width / 4}
                y={(3 * height) / 4}
                radius={6}
                fill="lime"
                opacity={0.9}
              />
              <Text
                x={width / 4 + 10}
                y={(3 * height) / 4 - 5}
                text="BL"
                fontSize={10}
                fill="lime"
              />

              {/* Bottom-right quadrant */}
              <Circle
                x={(3 * width) / 4}
                y={(3 * height) / 4}
                radius={6}
                fill="lime"
                opacity={0.9}
              />
              <Text
                x={(3 * width) / 4 + 10}
                y={(3 * height) / 4 - 5}
                text="BR"
                fontSize={10}
                fill="lime"
              />
            </>
          )}
        </>
      )}

      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.001)"
        onClick={handleBackgroundInteraction}
        onTap={handleBackgroundInteraction}
      />
      {CONSTELLATIONS.map((c, i) => {
        // Calculate constellation's local center offset
        const { centerX, centerY } = computeCenter(c.stars);

        let targetX, targetY;

        if (isMobileLandscape) {
          // Mobile landscape: Position visual center at quadrant centers
          // Viae: top-left, Iter: top-right, Arete: bottom-left, Elevare: bottom-right
          switch (c.name) {
            case "Viae":
              targetX = width / 4 - centerX;
              targetY = height / 4 - centerY;
              break;
            case "Iter":
              targetX = (3 * width) / 4 - centerX;
              targetY = height / 4 - centerY;
              break;
            case "Arete":
              targetX = width / 4 - centerX;
              targetY = (3 * height) / 4 - centerY;
              break;
            case "Elevare":
              targetX = (3 * width) / 4 - centerX;
              targetY = (3 * height) / 4 - centerY;
              break;
            default:
              // Fallback for any other constellations
              targetX = (c.designX / DESIGN.width) * width;
              targetY = (c.designY / DESIGN.height) * height;
          }
        } else {
          // Desktop/other viewports: Use percentage positioning
          targetX = (c.designX / DESIGN.width) * width;
          targetY = (c.designY / DESIGN.height) * height;
        }

        const transformData: TransformData = {
          x: targetX,
          y: targetY,
          rotation: c.rotation ?? 0,
          scaleX: c.scale ?? 1,
          scaleY: c.scale ?? 1,
        };

        // Calculate where constellation actually appears (visual center)
        const actualX = transformData.x + centerX;
        const actualY = transformData.y + centerY;

        return (
          <React.Fragment key={c.name}>
            {/* DEBUG: Constellation markers */}
            {DEBUG_MODE && (
              <>
                {/* Blue dot = transformData position (input) */}
                <Circle
                  x={transformData.x}
                  y={transformData.y}
                  radius={6}
                  fill="blue"
                  opacity={0.5}
                />
                {/* Magenta dot = actual visual center (where it appears after offset) */}
                <Circle
                  x={actualX}
                  y={actualY}
                  radius={8}
                  fill="magenta"
                  opacity={0.8}
                />
                <Text
                  x={actualX + 12}
                  y={actualY - 5}
                  text={c.name}
                  fontSize={12}
                  fill="magenta"
                  fontStyle="bold"
                />
              </>
            )}
            <Constellation
              data={c}
              windowCenter={windowCenter}
              transformData={transformData}
              key={i}
              onClickCallback={() => {
                setFocusedObject({ constellation: c, star: null });
                setTopOverlayTextContents({
                  intro: c.intro,
                  title: c.name,
                  origin: c.about,
                  about: "",
                });
                setCenterOverlayVisibility(false);
                setTopOverlayVisibility(true);
              }}
              focusedConstellation={focusedObject.constellation}
              // pass the unfocused position of the focused constellation (for parallax effect)
              focusedUnfocusedPos={
                focusedObject.constellation
                  ? {
                      x:
                        (focusedObject.constellation.designX / DESIGN.width) * width +
                        computeCenter(focusedObject.constellation.stars).centerX,
                      y:
                        (focusedObject.constellation.designY / DESIGN.height) *
                          height +
                        computeCenter(focusedObject.constellation.stars).centerY,
                    }
                  : null
              }
              onHoverEnterCallback={() => {
                if (!focusedObject.constellation) {
                  setCenterOverlayTextContents({
                    intro: c.intro,
                    title: c.name,
                    origin: c.origin,
                    about: c.about,
                  });
                }
              }}
              onHoverLeaveCallback={() => {
                if (focusedObject.constellation !== c) {
                  resetCenterOverlayTextContents();
                }
              }}
            />
          </React.Fragment>
        );
      })}
      {/* Polaris, the guiding chatbot star */}
      {(() => {
        const polarisDesignX = DESIGN.width / 2 + 2;
        const polarisDesignY = 200; // bigger number moves it down
        const polarisPercentX = polarisDesignX / DESIGN.width;
        const polarisPercentY = polarisDesignY / DESIGN.height;
        const polarisScreenX = polarisPercentX * width;
        const polarisScreenY = polarisPercentY * height;
        return (
          <>
            {/* DEBUG: Polaris position marker */}
            {DEBUG_MODE && (
              <>
                <Circle
                  x={polarisScreenX}
                  y={polarisScreenY}
                  radius={8}
                  fill="yellow"
                  opacity={0.7}
                />
                <Text
                  x={polarisScreenX + 12}
                  y={polarisScreenY - 5}
                  text="Polaris"
                  fontSize={12}
                  fill="yellow"
                  fontStyle="bold"
                />
              </>
            )}
            <Polaris
              x={polarisScreenX}
              y={polarisScreenY}
              size={4}
              brightness={2}
              twinkleMin={4.9}
              twinkleMax={5.1}
              windowCenter={windowCenter}
              focusedScreenPos={focusedScreenPos}
              focusedUnfocusedPos={
                focusedObject.constellation
                  ? {
                      x:
                        (focusedObject.constellation.designX / DESIGN.width) * width +
                        computeCenter(focusedObject.constellation.stars).centerX,
                      y:
                        (focusedObject.constellation.designY / DESIGN.height) *
                          height +
                        computeCenter(focusedObject.constellation.stars).centerY,
                    }
                  : null
              }
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
          </>
        );
      })()}
    </Group>
  );
}
