"use client";

// this provider contains information about what the last focused "thing" was
// it may be a constellation or a star

import {
  ConstellationData,
  StarDataWithInternalLink,
  ParallaxFocusData,
} from "@/interfaces/StarInterfaces";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
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
  getConstellationNameByStarSlug,
  getConstellationDataByName,
  getStarDataBySlug,
} from "@/components/star-revamp/Star/ConstellationList";
import { STAR_BASE_URL } from "@/constants/Routes";
import { setStarOverlayMobileAware, setConstellationOverlayMobileAware } from "@/utils/overlayHelpers";
import { useWindowSizeContext } from "./useWindowSizeProvider";
import { DESIGN_REFERENCE } from "@/app/theme";
import { computeCenter } from "@/utils/constellationUtils";

interface FocusedObject {
  constellation: ConstellationData | null;
  star: StarDataWithInternalLink | null;
}

export interface FocusState {
  focusedObject: FocusedObject;
  setFocusedObject: Dispatch<SetStateAction<FocusedObject>>;
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
    setHorizontalPosition, 
    setOverlayTextContents: setTopOverlayTextContents,
    setOverlayVisibility: setTopOverlayVisibility 
  } = useTopOverlayContext();
  
  const {
    setOverlayVisibility: setCenterOverlayVisibility,
  } = useCenterOverlayContext();

  const { polarisDisplayState } = usePolarisContext();
  const mobileState = useMobile();

  // Track current slug to prevent redundant navigation calls
  const currentStarSlugRef = useRef<string | null>(null);
  const currentConstellationSlugRef = useRef<string | null>(null);

  // Compute parallax focus data when constellation is focused
  useEffect(() => {
    if (focusedObject.constellation) {
      const c = focusedObject.constellation;
      const { centerX, centerY } = computeCenter(c.stars);
      
      // Use viewport percentage positioning
      const percentX = c.designX / DESIGN_REFERENCE.width;
      const percentY = c.designY / DESIGN_REFERENCE.height;
      
      // Calculate unfocused position (where the constellation's center is)
      const unfocusedX = percentX * width + centerX;
      const unfocusedY = percentY * height + centerY;

      setParallaxFocusData({
        unfocusedX,
        unfocusedY,
      });
    } else {
      // Clear when no constellation is focused
      setParallaxFocusData(null);
    }
  }, [focusedObject.constellation, width, height]);

  // Centralized overlay management based on focused object
  useEffect(() => {
    if (focusedObject.constellation) {
      // Something is focused: hide center overlay, show top overlay
      setCenterOverlayVisibility(false);
      setTopOverlayVisibility(true);
      
      // Set contents based on whether a specific star or just constellation is focused
      if (focusedObject.star) {
        setStarOverlayMobileAware(focusedObject.star, setTopOverlayTextContents, mobileState);
      } else {
        setConstellationOverlayMobileAware(focusedObject.constellation, setTopOverlayTextContents, mobileState);
      }
    } else {
      // Nothing focused: show center overlay, hide top overlay
      setCenterOverlayVisibility(true);
      setTopOverlayVisibility(false);
    }
  }, [focusedObject, mobileState, setCenterOverlayVisibility, setTopOverlayVisibility, setTopOverlayTextContents]);

  useEffect(() => {

    if (pathname.startsWith("/star/")) {
      // if polaris is active, then it is in the center
      if (polarisDisplayState === "active") {
        setHorizontalPosition("center")
      } else {
        setHorizontalPosition("left")
      }
      // otherwise, it is on the left
    } else {
      setHorizontalPosition("center");
    }
  }, [pathname, polarisDisplayState, setHorizontalPosition]);

  // Clear navigation refs when returning to homepage
  useEffect(() => {
    if (pathname === "/") {
      currentStarSlugRef.current = null;
      currentConstellationSlugRef.current = null;
    }
  }, [pathname]);

  const navigateToStar = useCallback((slug: string) => {
    // Prevent redundant navigation to same slug
    if (currentStarSlugRef.current === slug) {
      return;
    }
    currentStarSlugRef.current = slug;
    currentConstellationSlugRef.current = null; // Clear constellation when navigating to star

    const constellationName = getConstellationNameByStarSlug(slug);
    if (constellationName) {
      const constellationData = getConstellationDataByName(constellationName);
      const starData = getStarDataBySlug(slug, constellationName);
      
      // Always set the focused object first
      setFocusedObject({
        constellation: constellationData,
        star: starData,
      });
      
      // Build target path
      const targetPath = `${STAR_BASE_URL}/${slug}`;
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    }
  }, [pathname, router]);

  const navigateToConstellation = useCallback((slug: string) => {
    // Prevent redundant navigation to same constellation
    if (currentConstellationSlugRef.current === slug) {
      return;
    }
    currentConstellationSlugRef.current = slug;
    currentStarSlugRef.current = null; // Clear star when navigating to constellation

    
    const capitalizedName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
    
    const constellationData = getConstellationDataByName(capitalizedName);
    
    if (constellationData) {
      // Set focused object with constellation but no specific star
      setFocusedObject({
        constellation: constellationData,
        star: null,
      });
      
      // Build target path
      const targetPath = `/constellation/${slug.toLowerCase()}`;
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    } else {
      console.error('[navigateToConstellation] No constellation found for name:', capitalizedName);
    }
  }, [pathname, router]);

  return (
    <FocusContext.Provider
      value={{
        focusedObject,
        setFocusedObject,
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
