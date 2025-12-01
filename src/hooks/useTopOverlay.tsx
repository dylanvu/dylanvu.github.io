"use client";

import { createOverlayContext } from "./GenericOverlayProvider";

export const {
  OverlayProvider: TopOverlayProvider,
  useOverlayContext: useTopOverlayContext,
} = createOverlayContext({
  introText: "",
  titleText: "",
  originText: "",
  aboutText: "",
  initialVisibility: false,
});
