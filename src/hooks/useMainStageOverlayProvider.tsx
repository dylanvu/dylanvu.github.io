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
  titlePosition: "center" | "bottom";
  setTitlePosition: Dispatch<SetStateAction<"center" | "bottom">>;
  resetOverlayTextContents: () => void;
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
  const DEFAULT_INTRO_TEXT = "Codeweaver";
  const DEFAULT_TITLE_TEXT = "Dylan Vu";
  const DEFAULT_ORIGIN_TEXT = "Hover a constellation to explore";
  const DEFAULT_ABOUT_TEXT = "or consult Polaris above to find your way";

  const [titleText, setTitleText] = useState<string>(DEFAULT_TITLE_TEXT);
  const [originText, setOriginText] = useState<string>(DEFAULT_ORIGIN_TEXT);
  const [aboutText, setAboutText] = useState<string>(DEFAULT_ABOUT_TEXT);
  const [introText, setIntroText] = useState<string>(DEFAULT_INTRO_TEXT);
  const [overlayVisibility, setOverlayVisibility] = useState<boolean>(true);
  const [titlePosition, setTitlePosition] = useState<"center" | "bottom">(
    "center"
  );

  function resetOverlayTextContents() {
    setTitleText(DEFAULT_TITLE_TEXT);
    setOriginText(DEFAULT_ORIGIN_TEXT);
    setAboutText(DEFAULT_ABOUT_TEXT);
    setIntroText(DEFAULT_INTRO_TEXT);
  }

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
        titlePosition,
        setTitlePosition,
        resetOverlayTextContents,
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
