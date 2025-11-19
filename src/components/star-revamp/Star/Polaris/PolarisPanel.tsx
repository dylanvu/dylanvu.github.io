"use client";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useEffect } from "react";
import { StarPanelMotionDiv } from "@/components/star-revamp/ScreenOverlay/StarPanelMotionDiv";
import PolarisChat from "@/components/star-revamp/Star/Polaris/PolarisChat";

export default function StarPanel({}: {}) {
  const { setFocusedObject } = useFocusContext();
  useEffect(() => {
    // move polaris to its rightful home on the side of the screen
  }, []);
  return (
    // should be idential to StarPanel
    <StarPanelMotionDiv
      styleOverride={{
        height: "70%",
      }}
    >
      <PolarisChat />
    </StarPanelMotionDiv>
  );
}
