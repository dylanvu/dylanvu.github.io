"use client";

// this provider contains information about what the last focused "thing" was
// it may be a constellation or a star

import {
  ConstellationData,
  ParallaxFocusData,
  StarData,
} from "@/interfaces/StarInterfaces";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { useTopOverlayContext } from "./useTopOverlay";
import { useCenterOverlayContext } from "./useCenterOverlay";
import { usePathname, useRouter } from "next/navigation";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useMobile } from "./useMobile";
import {
  getStarDataBySlug,
  getConstellationDataBySlug,
} from "@/components/star-revamp/Star/ConstellationList";
import { STAR_BASE_URL } from "@/constants/Routes";
import { setConstellationOverlayMobileAware } from "@/utils/overlayHelpers";
import { useWindowSizeContext } from "./useWindowSizeProvider";
import { DESIGN_REFERENCE } from "@/app/theme";
import { computeCenter } from "@/utils/constellationUtils";

interface FocusedObject {
  constellation: ConstellationData | null;
  star: StarData | null;
}

export interface FocusState {
  focusedObject: FocusedObject;
  parallaxFocusData: ParallaxFocusData | null;
  navigateToStar: (slug: string) => void;
  navigateToConstellation: (slug: string) => void;
}

const FocusContext = createContext<FocusState | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusedObject, setFocusedObject] = useState<FocusedObject>({
    constellation: null,
    star: null,
  });

  const [parallaxFocusData, setParallaxFocusData] = useState<ParallaxFocusData | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const { width, height } = useWindowSizeContext();
  const { 
    setOverlayTextContents: setTopOverlayTextContents,
    setOverlayVisibility: setTopOverlayVisibility 
  } = useTopOverlayContext();
  
  const {
    setOverlayVisibility: setCenterOverlayVisibility,
    resetOverlayTextContents: resetCenterOverlayTextContents,
  } = useCenterOverlayContext();

  const { polarisDisplayState } = usePolarisContext();
  const mobileState = useMobile();

  // Track current slug to prevent redundant navigation calls
  const currentStarSlugRef = useRef<string | null>(null);
  const currentConstellationSlugRef = useRef<string | null>(null);

  const calculateParallaxData = useCallback((c: ConstellationData) => {
    const { centerX, centerY } = computeCenter(c.stars);
    
    // Use viewport percentage positioning
    const percentX = c.designX / DESIGN_REFERENCE.width;
    const percentY = c.designY / DESIGN_REFERENCE.height;
    
    // Calculate unfocused position (where the constellation's center is)
    const unfocusedX = percentX * width + centerX;
    const unfocusedY = percentY * height + centerY;

    return {
        unfocusedX,
        unfocusedY,
        focusScale: c.focusScale,
        rotation: c.rotation ?? 0,
        constellation: c
      }
  }, [width, height])

  // Centralized overlay management based on focused object
  useEffect(() => {
    if (focusedObject.constellation) {
      // Something is focused: hide center overlay
      setCenterOverlayVisibility(false);
      
      // Set contents based on whether a specific star or just constellation is focused
      if (!focusedObject.star) {
        setTopOverlayVisibility(true);
        setConstellationOverlayMobileAware(focusedObject.constellation, setTopOverlayTextContents, mobileState);
      }
    } else {
      // Nothing focused: show center overlay, hide top overlay, reset content
      setCenterOverlayVisibility(true);
      setTopOverlayVisibility(false);
      resetCenterOverlayTextContents();
    }
  }, [focusedObject, mobileState, setCenterOverlayVisibility, setTopOverlayVisibility, setTopOverlayTextContents, resetCenterOverlayTextContents]);

  useEffect(() => {
    if (pathname.startsWith(STAR_BASE_URL)) {
      // if polaris is active, then it is in the center
      if (polarisDisplayState === "active") {
        setTopOverlayVisibility(true);
      } else {
        // hide the top, the star panel should be open
        setTopOverlayVisibility(false);
      }
    }
  }, [pathname, polarisDisplayState]);

  // Clear navigation refs when returning to homepage
  useEffect(() => {
    if (pathname === "/") {
      currentStarSlugRef.current = null;
      currentConstellationSlugRef.current = null;

      // This effect feels clean since many places send the path to be home "/" so this eliminates me needing to duplicate the logic
      // or adding a function to reset the focused object
      // or exposing this state change function
      // if it does cause a cascade later, you would need to find whereever we navigate to "/" and add this in
      // but leaving this also enables back button support!
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFocusedObject({ constellation: null, star: null });
      setParallaxFocusData(null);
    }
  }, [pathname]);

  const navigateToStar = useCallback((slug: string) => {
    // Prevent redundant navigation to same slug
    if (currentStarSlugRef.current === slug) {
      return;
    }
    currentStarSlugRef.current = slug;
    currentConstellationSlugRef.current = null; // Clear constellation when navigating to star

    const constellationData = getConstellationDataBySlug(slug);
    if (constellationData) {
      const starData = getStarDataBySlug(slug, constellationData.name);
      
      const oldFocus = focusedObject;
      // Always set the focused object first
      setFocusedObject({
        constellation: constellationData,
        star: starData,
      });

      // set the parallax data as well, only if we have changed constellations
      if (oldFocus.constellation !== constellationData) {
        const parallaxData = calculateParallaxData(constellationData);
        setParallaxFocusData(parallaxData);
      }
      
      // Build target path
      const targetPath = `${STAR_BASE_URL}/${slug}`;
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    }
  }, [pathname, router, calculateParallaxData, focusedObject]);

  const navigateToConstellation = useCallback((slug: string) => {
    // Prevent redundant navigation to same constellation
    if (currentConstellationSlugRef.current === slug) {
      return;
    }
    currentConstellationSlugRef.current = slug;
    currentStarSlugRef.current = null; // Clear star when navigating to constellation
    
    const constellationData = getConstellationDataBySlug(slug);
    
    if (constellationData) {
      const oldFocus = focusedObject;
      // Set focused object with constellation but no specific star
      setFocusedObject({
        constellation: constellationData,
        star: null,
      });

      if (oldFocus.constellation !== constellationData) {
        const parallaxData = calculateParallaxData(constellationData);
        setParallaxFocusData(parallaxData);
      }

      
      // Build target path
      const targetPath = `/constellation/${slug.toLowerCase()}`;
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    } else {
      console.error('[navigateToConstellation] No constellation found for slug:', slug);
    }
  }, [pathname, router, calculateParallaxData, focusedObject]);

  return (
    <FocusContext.Provider
      value={{
        focusedObject,
        parallaxFocusData,
        navigateToStar,
        navigateToConstellation,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  const ctx = useContext(FocusContext);
  if (!ctx) {
    throw new Error("useFocusContext must be used within FocusProvider");
  }
  return ctx;
}
