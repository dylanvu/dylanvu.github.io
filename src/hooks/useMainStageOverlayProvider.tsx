"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define the shape of the context
interface MainStageOverlayContextType {
  titleText: string;
  setTitleText: Dispatch<SetStateAction<string>>;
  originText: string;
  setOriginText: Dispatch<SetStateAction<string>>;
  aboutText: string;
  setAboutText: Dispatch<SetStateAction<string>>;
  introText: string;
  setIntroText: Dispatch<SetStateAction<string>>;
  overlayVisibility: boolean;
  setOverlayVisibility: Dispatch<SetStateAction<boolean>>;
  DEFAULT_INTRO_TEXT: string;
  DEFAULT_TITLE_TEXT: string;
  DEFAULT_ORIGIN_TEXT: string;
  DEFAULT_ABOUT_TEXT: string;
}

// Create the context
const MainStageOverlayContext = createContext<
  MainStageOverlayContextType | undefined
>(undefined);

// Provider component
export function MainStageOverlayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const DEFAULT_INTRO_TEXT = "Software Engineer";
  const DEFAULT_TITLE_TEXT = "Dylan Vu";
  const DEFAULT_ORIGIN_TEXT =
    "Hover constellations to explore, or consult Polaris above to find your way";
  const DEFAULT_ABOUT_TEXT = " ";

  const [titleText, setTitleText] = useState<string>(DEFAULT_TITLE_TEXT);
  const [originText, setOriginText] = useState<string>(DEFAULT_ORIGIN_TEXT);
  const [aboutText, setAboutText] = useState<string>(DEFAULT_ABOUT_TEXT);
  const [introText, setIntroText] = useState<string>(DEFAULT_INTRO_TEXT);
  const [overlayVisibility, setOverlayVisibility] = useState<boolean>(true);

  return (
    <MainStageOverlayContext.Provider
      value={{
        titleText,
        setTitleText,
        originText,
        setOriginText,
        aboutText,
        setAboutText,
        introText,
        setIntroText,
        overlayVisibility,
        setOverlayVisibility,
        DEFAULT_TITLE_TEXT,
        DEFAULT_ORIGIN_TEXT,
        DEFAULT_ABOUT_TEXT,
        DEFAULT_INTRO_TEXT,
      }}
    >
      {children}
    </MainStageOverlayContext.Provider>
  );
}

// Custom hook for easy access
export function useMainStageOverlayContext(): MainStageOverlayContextType {
  const ctx = useContext(MainStageOverlayContext);
  if (!ctx) {
    throw new Error(
      "useMainStageOverlayContext must be used within MainStageOverlayProvider"
    );
  }
  return ctx;
}
