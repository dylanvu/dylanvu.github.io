import { Group, Rect } from "react-konva";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import ConstellationBoundingBox from "./ConstellationBoundingBox";
import ElevareMap from "./ElevareMap";
import { ConstellationData } from "@/interfaces/StarInterfaces";
import { setConstellationOverlay, setStarOverlayMobileAware } from "@/utils/overlayHelpers";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useMobile } from "@/hooks/useMobile";
import { usePathname } from "next/navigation";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import Konva from "konva";
import { useRef, useState, useLayoutEffect } from "react";

interface ConstellationContentProps {
  // Bounding box dimensions
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;

  // Visual state
  brightness: number;
  isHovered: boolean;
  showBoundingBox?: boolean;
  showStarBoundingBox?: boolean;

  // Constellation data
  data: ConstellationData;
  lineSegments: [number, number][];
  lineDurations: number[];
  lineDelays: number[];

  // Elevare-specific
  isElevare: boolean;
  elevareZoom?: number;
  elevareMapOffset?: { x: number; y: number };
  onElevareZoomOffsetChange?: (zoom: number, offset: { x: number; y: number }) => void;

  // Callbacks and context
  animationTweenRef: React.RefObject<Konva.Tween | null>;
}

export default function ConstellationContent({
  minX,
  maxX,
  minY,
  maxY,
  width,
  height,
  brightness,
  isHovered,
  showBoundingBox,
  showStarBoundingBox,
  data,
  lineSegments,
  lineDurations,
  lineDelays,
  isElevare,
  elevareZoom,
  elevareMapOffset,
  onElevareZoomOffsetChange,
  animationTweenRef,
}: ConstellationContentProps) {
  const { stars } = data;
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const { focusedObject, navigateToConstellation, navigateToStar } = useFocusContext();
  const isFocused = focusedObject.constellation === data;
  const { setOverlayTextContents: setTopOverlayTextContents, resetOverlayTextContents: resetTopOverlayTextContents } = useTopOverlayContext();
  const { setOverlayTextContents: setCenterOverlayTextContents } = useCenterOverlayContext();
  const mobileState = useMobile();
  const pathname = usePathname();

  // Track animation key for bounding box - increments when visibility transitions from false to true
  const animationCounterRef = useRef(0);
  const prevBoundingBoxVisibleRef = useRef(false);
  const [animationKey, setAnimationKey] = useState(0);
  const isBoundingBoxVisible = isFocused || showStarBoundingBox || isHovered;
  
  // Use useLayoutEffect to track visibility transitions and update animation key
  useLayoutEffect(() => {
    const wasVisible = prevBoundingBoxVisibleRef.current;
    prevBoundingBoxVisibleRef.current = isBoundingBoxVisible;
    
    // Increment animation key when transitioning from invisible to visible
    if (isBoundingBoxVisible && !wasVisible) {
      animationCounterRef.current += 1;
      setAnimationKey(animationCounterRef.current);
    }
  }, [isBoundingBoxVisible]);

  // Helper function to render a single star
  const renderStar = (star: typeof stars[0], i: number) => {
    const incomingLineIndex = lineSegments.findIndex(
      ([start, end]) => end === i || start === i
    );
    const delay =
      incomingLineIndex >= 0
        ? lineDelays[incomingLineIndex] + lineDurations[incomingLineIndex]
        : 0;

    return (
      <MainStar
        key={i}
        x={star.x}
        y={star.y}
        brightness={brightness}
        delay={delay}
        data={star.data}
        showLabel={isFocused}
        labelSize={4}
        isConstellationFocused={isFocused}
        onHoverEnterCallback={() => {
          console.log("returning")
          // for some reason, this always stops here
          if (animationTweenRef.current) return;


          if (star.data) {
            if (isFocused) {
              setStarOverlayMobileAware(star.data, setTopOverlayTextContents, mobileState);
            } else {
              setCenterOverlayTextContents({
                intro: star.data.classification,
                title: star.data.label ?? "",
                origin: star.data.origin ?? "",
                about: star.data.about ?? "",
              });
            }
          }
        }}
        onHoverLeaveCallback={() => {
          if (animationTweenRef.current) return;

          if (star.data?.label) {
            if (isFocused) {
              if (pathname === "/") {
                setConstellationOverlay(data, setTopOverlayTextContents);
              } else if (focusedObject.star) {
                setStarOverlayMobileAware(focusedObject.star, setTopOverlayTextContents, mobileState);
              } else if (focusedObject.constellation) {
                setConstellationOverlay(focusedObject.constellation, setTopOverlayTextContents);
              }
            } else {
              resetTopOverlayTextContents();
              setCenterOverlayTextContents({
                intro: data.intro,
                title: data.name,
                origin: data.origin,
                about: data.about,
              });
            }
          }
          if (isFocused) {
            document.body.style.cursor = "default";
          }
        }}
        cancelBubble={true}
        onClickCallback={() => {
          const starData = star.data;
          if (starData) {
            if (starData.slug) {
              // if we are currently on the page, bring it back to the base
              if (focusedObject.star && starData.slug === pathname.split("/").at(-1)) {
                navigateToConstellation(data.slug);
              } else {
                // navigate to the star
                navigateToStar(starData.slug);
              }
            }
          }
        }}
        onHoverScale={isFocused ? 1.3 : 1.8}
      />
    );
  };

  const renderLines = () => {
    return lineSegments.map(([i1, i2], idx) => (
      <AnimatedLine
        key={`conn-${idx}`}
        p1={stars[i1]}
        p2={stars[i2]}
        duration={lineDurations[idx]}
        delay={lineDelays[idx]}
        constellationData={data}
      />
    ));
  };

  return (
    <Group
      clipFunc={isElevare && isFocused ? (ctx) => {
        ctx.rect(minX, minY, width, height);
      } : undefined}
    >
      <Rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        fill={showBoundingBox ? "rgba(255,0,0,0.2)" : ""}
        listening={!(isElevare && isFocused)}
      />

      <ConstellationBoundingBox
        isVisible={isBoundingBoxVisible}
        animationKey={animationKey}
        tl={{ x: minX, y: minY }}
        tr={{ x: maxX, y: minY }}
        br={{ x: maxX, y: maxY }}
        bl={{ x: minX, y: maxY }}
        width={width}
        height={height}
        brightness={brightness}
        totalDuration={data.totalDuration}
      />

      {isElevare && elevareZoom !== undefined && elevareMapOffset !== undefined && onElevareZoomOffsetChange ? (
        <ElevareMap 
          isFocused={isFocused}
          boundingBox={{ minX, maxX, minY, maxY }}
          boundingBoxCenter={{ x: centerX, y: centerY }}
          constellationBoundingBoxWidth={width}
          constellationBoundingBoxHeight={height}
          externalZoom={elevareZoom}
          externalOffset={elevareMapOffset}
          onZoomOffsetChange={onElevareZoomOffsetChange}
        >
          {renderLines()}
          {stars.map(renderStar)}
        </ElevareMap>
      ) : (
        <>
          {renderLines()}
          {stars.map(renderStar)}
        </>
      )}
    </Group>
  );
}
