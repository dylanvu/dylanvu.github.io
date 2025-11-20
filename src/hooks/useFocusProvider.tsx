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

interface FocusedObject {
  constellation: ConstellationData | null;
  star: StarDataWithInternalLink | null;
}

export interface FocusState {
  focusedObject: FocusedObject;
  setFocusedObject: Dispatch<SetStateAction<FocusedObject>>;
  navigateToStar: (slug: string) => void;
}

const FocusContext = createContext<FocusState | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusedObject, setFocusedObject] = useState<FocusedObject>({
    constellation: null,
    star: null,
  });

  const pathname = usePathname();
  const router = useRouter();

  const { setHorizontalPosition } = useTopOverlayContext();

  const { polarisActivated, setPolarisActivated } = usePolarisContext();

  useEffect(() => {
    if (polarisActivated || pathname === "/") {
      setHorizontalPosition("center");
    } else {
      setHorizontalPosition("left");
    }
  }, [pathname, polarisActivated, setHorizontalPosition]);

  const navigateToStar = useCallback((slug: string) => {
    const constellationName = getConstellationNameByStarSlug(slug);
    if (constellationName) {
      const constellationData = getConstellationDataByName(constellationName);
      const starData = getStarDataBySlug(slug, constellationName);
      
      // Build target path
      const targetPath = `${STAR_BASE_URL}/${slug}`;
      
      // Only navigate if the path is different
      if (pathname !== targetPath) {
        router.push(targetPath);
        
        // Only deactivate Polaris when navigating to a DIFFERENT star
        // This prevents StarPanel from fighting with Polaris activation
        if (polarisActivated) {
          setPolarisActivated(false);
        }
      }
      
      // Set the focused object
      setFocusedObject({
        constellation: constellationData,
        star: starData,
      });
    }
  }, [pathname, router, polarisActivated, setPolarisActivated]);

  return (
    <FocusContext.Provider
      value={{
        focusedObject,
        setFocusedObject,
        navigateToStar,
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
