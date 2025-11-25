"use client";
import Constellation from "@/components/star-revamp/Star/Constellation/Constellation";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { TransformData } from "@/interfaces/StarInterfaces";
import { useEffect } from "react";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { Circle, Group, Rect, Text } from "react-konva";
import Polaris from "@/components/star-revamp/Star/Polaris/Polaris";
import { CONSTELLATIONS } from "@/components/star-revamp/Star/ConstellationList";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import { useRouter } from "next/navigation";
import { useMobile } from "@/hooks/useMobile";
import React from "react";
import {
  setConstellationOverlayMobileAware,
  setStarOverlayMobileAware,
} from "@/utils/overlayHelpers";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { usePathname } from "next/navigation";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { DESIGN_REFERENCE } from "@/app/theme";
import { computeCenter } from "@/utils/constellationUtils";

/**
 * Responsive star field: positions constellations relative to screen center
 * and scales offsets from design center. Star coordinates and sizes stay fixed.
 */

export default function MainStarField() {
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

  const { focusedObject, setFocusedObject, navigateToConstellation } = useFocusContext();

  const router = useRouter();
  const pathname = usePathname();
  const { polarisDisplayState, setPolarisDisplayState } = usePolarisContext();
  const { isSmallScreen, mobileScaleFactor } = useMobile();

  // Handler for background clicks/taps
  const handleBackgroundInteraction = () => {
    if (focusedObject.constellation) {
      setFocusedObject({ constellation: null, star: null });
      resetCenterOverlayTextContents();
      setCenterOverlayVisibility(true);
      setTopOverlayVisibility(false);
    }

    if (pathname !== "/") {
      router.push("/");
      // If exiting from a star page and polaris was suppressed, restore it to active
      if (polarisDisplayState === "suppressed") {
        setPolarisDisplayState("active");
      }
    }
  };

  // DEBUG MODE - set to false to hide debug markers
  const DEBUG_MODE = false;

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
            text={`CENTER ${isSmallScreen ? "(Small Screen)" : "(Large Screen)"}`}
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

          {/* Quadrant center markers - only on small screens */}
          {isSmallScreen && (
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

        if (isSmallScreen) {
          // Small screen: Position visual center at quadrant centers
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
              targetX = (c.designX / DESIGN_REFERENCE.width) * width;
              targetY = (c.designY / DESIGN_REFERENCE.height) * height;
          }
        } else {
          // Large screen: Use percentage positioning
          targetX = (c.designX / DESIGN_REFERENCE.width) * width;
          targetY = (c.designY / DESIGN_REFERENCE.height) * height;
        }

        const transformData: TransformData = {
          x: targetX,
          y: targetY,
          rotation: c.rotation ?? 0,
          scaleX: (c.scale ?? 1) * mobileScaleFactor,
          scaleY: (c.scale ?? 1) * mobileScaleFactor,
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
                navigateToConstellation(c.name.toLowerCase());
              }}
              focusedConstellation={focusedObject.constellation}
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
        const polarisDesignX = DESIGN_REFERENCE.width / 2 + 2;
        const polarisDesignY = 200; // bigger number moves it down
        const polarisPercentX = polarisDesignX / DESIGN_REFERENCE.width;
        const polarisPercentY = polarisDesignY / DESIGN_REFERENCE.height;
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
