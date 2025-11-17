"use client";

import { createOverlayContext } from "./GenericOverlayProvider";

export const {
  OverlayProvider: CenterOverlayProvider,
  useOverlayContext: useCenterOverlayContext,
} = createOverlayContext({
  introText: "Codeweaver",
  titleText: "Dylan Vu",
  originText: "Explore the night sky to learn more about me",
  aboutText: "or consult the North Star above to find your way",
  titlePosition: "center",
});
