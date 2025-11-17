"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export type TitlePosition = "center" | "bottom" | "top";

export interface GenericOverlayState {
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
  titlePosition: TitlePosition;
  setTitlePosition: Dispatch<SetStateAction<TitlePosition>>;
  resetOverlayTextContents: () => void;
}

export function createOverlayContext(defaults: {
  introText?: string;
  titleText?: string;
  originText?: string;
  aboutText?: string;
  titlePosition?: TitlePosition;
}) {
  const OverlayContext = createContext<GenericOverlayState | undefined>(
    undefined
  );

  function OverlayProvider({ children }: { children: ReactNode }) {
    const DEFAULT_INTRO_TEXT = defaults.introText ?? "";
    const DEFAULT_TITLE_TEXT = defaults.titleText ?? "";
    const DEFAULT_ORIGIN_TEXT = defaults.originText ?? "";
    const DEFAULT_ABOUT_TEXT = defaults.aboutText ?? "";
    const DEFAULT_TITLE_POSITION = defaults.titlePosition ?? "center";

    const [titleText, setTitleText] = useState(DEFAULT_TITLE_TEXT);
    const [originText, setOriginText] = useState(DEFAULT_ORIGIN_TEXT);
    const [aboutText, setAboutText] = useState(DEFAULT_ABOUT_TEXT);
    const [introText, setIntroText] = useState(DEFAULT_INTRO_TEXT);
    const [overlayVisibility, setOverlayVisibility] = useState(true);
    const [titlePosition, setTitlePosition] = useState<TitlePosition>(
      DEFAULT_TITLE_POSITION
    );

    const resetOverlayTextContents = () => {
      setTitleText(DEFAULT_TITLE_TEXT);
      setOriginText(DEFAULT_ORIGIN_TEXT);
      setAboutText(DEFAULT_ABOUT_TEXT);
      setIntroText(DEFAULT_INTRO_TEXT);
      setTitlePosition(DEFAULT_TITLE_POSITION);
    };

    return (
      <OverlayContext.Provider
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
          titlePosition,
          setTitlePosition,
          resetOverlayTextContents,
        }}
      >
        {children}
      </OverlayContext.Provider>
    );
  }

  function useOverlayContext() {
    const ctx = useContext(OverlayContext);
    if (!ctx) {
      throw new Error("useOverlayContext must be used within OverlayProvider");
    }
    return ctx;
  }

  return { OverlayProvider, useOverlayContext };
}
