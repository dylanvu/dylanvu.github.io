import { ConstellationData, StarData } from "@/interfaces/StarInterfaces";

/**
 * Helper function to set the top overlay content for a constellation
 */
export function setConstellationOverlay(
  constellation: ConstellationData,
  setOverlayTextContents: (contents: {
    intro: string;
    title: string;
    origin: string;
    about: string;
  }) => void
) {
  setOverlayTextContents({
    intro: constellation.intro,
    title: constellation.name,
    origin: constellation.about,
    about: "",
  });
}

/**
 * Helper function to set the top overlay content for a star
 */
export function setStarOverlay(
  star: StarData,
  setOverlayTextContents: (contents: {
    intro: string;
    title: string;
    origin: string;
    about: string;
  }) => void
) {
  setOverlayTextContents({
    intro: star.classification,
    title: star.label ?? "",
    origin: star.origin ?? "",
    about: star.about ?? "",
  });
}
