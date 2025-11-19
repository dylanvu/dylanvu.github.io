"use client";

// this provider contains information about what the last focused "thing" was
// it may be a constellation or a star

import { ConstellationData, StarData } from "@/interfaces/StarInterfaces";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export interface FocusState {
  focusedObject: ConstellationData | StarData | null;
  setFocusedObject: Dispatch<
    SetStateAction<ConstellationData | StarData | null>
  >;
}

const FocusContext = createContext<FocusState | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusedObject, setFocusedObject] = useState<
    ConstellationData | StarData | null
  >(null);

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
