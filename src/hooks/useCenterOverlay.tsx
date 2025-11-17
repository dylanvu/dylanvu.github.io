"use client";

import { createOverlayContext } from "./GenericOverlayProvider";

export const {
  OverlayProvider: CenterOverlayProvider,
  useOverlayContext: useCenterOverlayContext,
} = createOverlayContext({
  introText: "Codeweaver",
  titleText: "Dylan Vu",
  originText: "Hover a constellation to explore",
  aboutText: "or consult Polaris above to find your way",
  titlePosition: "center",
});
