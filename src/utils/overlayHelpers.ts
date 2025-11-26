import { ConstellationData, StarData } from "@/interfaces/StarInterfaces";

// Mobile overlay configuration - adjust these to experiment with different behaviors
type MobileState = {
  isMobile: boolean;
  isMobileLandscape: boolean;
  isMobilePortrait: boolean;
  isSmallScreen: boolean;
  mobileScaleFactor: number;
  mobileFontScaleFactor: number;
};

const MOBILE_OVERLAY_CONFIG = {
  // Which mobile state triggers field hiding
  // Change this function to test different conditions:
  // - mobileState.isMobile: Hide on any mobile device
  // - mobileState.isMobilePortrait: Hide only in portrait mode
  // - mobileState.isSmallScreen: Hide on screens < 1600px
  shouldHideFields: (mobileState: MobileState) => mobileState.isMobileLandscape,

  // Which fields to hide when condition is met
  hideFields: {
    origin: true,
    about: true,
    intro: true,
  },
};

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

/**
 * Mobile-aware helper function to set the top overlay content for a constellation
 * Conditionally hides fields based on mobile state configuration
 */
export function setConstellationOverlayMobileAware(
  constellation: ConstellationData,
  setOverlayTextContents: (contents: {
    intro: string;
    title: string;
    origin: string;
    about: string;
  }) => void,
  mobileState: MobileState
) {
  const shouldHide = MOBILE_OVERLAY_CONFIG.shouldHideFields(mobileState);

  setOverlayTextContents({
    intro:
      shouldHide && MOBILE_OVERLAY_CONFIG.hideFields.intro
        ? ""
        : constellation.intro,
    title: constellation.name,
    origin:
      shouldHide && MOBILE_OVERLAY_CONFIG.hideFields.origin
        ? ""
        : constellation.about,
    about: shouldHide && MOBILE_OVERLAY_CONFIG.hideFields.about ? "" : "",
  });
}

/**
 * Mobile-aware helper function to set the top overlay content for a star
 * Conditionally hides fields based on mobile state configuration
 */
export function setStarOverlayMobileAware(
  star: StarData,
  setOverlayTextContents: (contents: {
    intro: string;
    title: string;
    origin: string;
    about: string;
  }) => void,
  mobileState: MobileState
) {
  const shouldHide = MOBILE_OVERLAY_CONFIG.shouldHideFields(mobileState);

  setOverlayTextContents({
    intro:
      shouldHide && MOBILE_OVERLAY_CONFIG.hideFields.intro
        ? ""
        : star.classification,
    title: star.label ?? "",
    origin:
      shouldHide && MOBILE_OVERLAY_CONFIG.hideFields.origin
        ? ""
        : star.origin ?? "",
    about:
      shouldHide && MOBILE_OVERLAY_CONFIG.hideFields.about
        ? ""
        : star.about ?? "",
  });
}
