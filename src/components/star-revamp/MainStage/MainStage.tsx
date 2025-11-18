"use client";

import { SPACE_BACKGROUND_COLOR } from "@/app/theme";
import { Layer, Stage } from "react-konva";
import BackgroundStarField from "@/components/star-revamp/Star/BackgroundStarField";
import MainStarField from "@/components/star-revamp/Star/MainStarField";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import CenterOverlay from "@/components/star-revamp/ScreenOverlay/CenterOverlay";
import TopOverlay from "@/components/star-revamp/ScreenOverlay/TopOverlay";

export default function MainStage({ children }: { children: React.ReactNode }) {
  // use the hook. ready becomes true after the first synchronous measurement.
  const { width, height, ready } = useWindowSizeContext();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CenterOverlay />
      <TopOverlay />
      {/* children here should be the side panels that appear when you go to a specific link */}
      {children}
      {ready && width > 0 && height > 0 && (
        <Stage
          width={width}
          height={height}
          style={{ background: SPACE_BACKGROUND_COLOR }}
        >
          <Layer>
            <BackgroundStarField
              width={width}
              height={height}
              starCount={200}
            />
            <MainStarField />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
