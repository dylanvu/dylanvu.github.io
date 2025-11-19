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
} from "react";

import { useTopOverlayContext } from "./useTopOverlay";
import { usePathname } from "next/navigation";

interface FocusedObject {
  constellation: ConstellationData | null;
  star: StarDataWithInternalLink | null;
}

export interface FocusState {
  focusedObject: FocusedObject;
  setFocusedObject: Dispatch<SetStateAction<FocusedObject>>;
}

const FocusContext = createContext<FocusState | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusedObject, setFocusedObject] = useState<FocusedObject>({
    constellation: null,
    star: null,
  });

  const pathname = usePathname();

  const { setHorizontalPosition } = useTopOverlayContext();

  useEffect(() => {
    if (pathname === "/polaris" || pathname === "/") {
      setHorizontalPosition("center");
    } else {
      setHorizontalPosition("left");
    }
  }, [pathname]);

  return (
    <FocusContext.Provider
      value={{
        focusedObject,
        setFocusedObject,
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
