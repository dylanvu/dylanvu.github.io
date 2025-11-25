"use client";

// this provider contains information about what the last focused "thing" was
// it may be a constellation or a star

import {
  ConstellationData,
  StarDataWithInternalLink,
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
import { usePathname, useRouter } from "next/navigation";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import {
  getConstellationNameByStarSlug,
  getConstellationDataByName,
  getStarDataBySlug,
} from "@/components/star-revamp/Star/ConstellationList";
import { STAR_BASE_URL } from "@/constants/Routes";
import { setConstellationOverlay, setStarOverlay } from "@/utils/overlayHelpers";

interface FocusedObject {
  constellation: ConstellationData | null;
  star: StarDataWithInternalLink | null;
}

export interface FocusState {
  focusedObject: FocusedObject;
  setFocusedObject: Dispatch<SetStateAction<FocusedObject>>;
  navigateToStar: (slug: string) => void;
  navigateToConstellation: (slug: string) => void;
}

const FocusContext = createContext<FocusState | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusedObject, setFocusedObject] = useState<FocusedObject>({
    constellation: null,
    star: null,
  });

  const pathname = usePathname();
  const router = useRouter();

  const { setHorizontalPosition, setOverlayTextContents } = useTopOverlayContext();

  const { polarisDisplayState } = usePolarisContext();

  // Track current slug to prevent redundant navigation calls
  const currentStarSlugRef = useRef<string | null>(null);
  const currentConstellationSlugRef = useRef<string | null>(null);

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
      
      // Set the top overlay content with star information
      if (starData) {
        setStarOverlay(starData, setOverlayTextContents);
      }
      
      // Build target path
      const targetPath = `${STAR_BASE_URL}/${slug}`;
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    }
  }, [pathname, router, setOverlayTextContents]);

  const navigateToConstellation = useCallback((slug: string) => {
    // Prevent redundant navigation to same constellation
    if (currentConstellationSlugRef.current === slug) {
      return;
    }
    currentConstellationSlugRef.current = slug;
    currentStarSlugRef.current = null; // Clear star when navigating to constellation

    console.log('[navigateToConstellation] Input slug:', slug);
    
    const capitalizedName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
    console.log('[navigateToConstellation] Capitalized name:', capitalizedName);
    
    const constellationData = getConstellationDataByName(capitalizedName);
    console.log('[navigateToConstellation] Found constellation:', constellationData);
    
    if (constellationData) {
      console.log('[navigateToConstellation] Setting focused object');
      // Set focused object with constellation but no specific star
      setFocusedObject({
        constellation: constellationData,
        star: null,
      });
      
      // Set the top overlay content with constellation information
      setConstellationOverlay(constellationData, setOverlayTextContents);
      
      // Build target path
      const targetPath = `/constellation/${slug.toLowerCase()}`;
      console.log('[navigateToConstellation] Target path:', targetPath, 'Current path:', pathname);
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        console.log('[navigateToConstellation] Navigating to:', targetPath);
        router.push(targetPath);
      }
    } else {
      console.error('[navigateToConstellation] No constellation found for name:', capitalizedName);
    }
  }, [pathname, router, setOverlayTextContents]);

  return (
    <FocusContext.Provider
      value={{
        focusedObject,
        setFocusedObject,
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
