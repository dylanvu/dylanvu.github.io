"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
  useCallback,
} from "react";

export interface GenericOverlayState {
  titleText: string;
  originText: string;
  aboutText: string;
  introText: string;
  overlayVisibility: boolean;
  setOverlayVisibility: Dispatch<SetStateAction<boolean>>;
  resetOverlayTextContents: () => void;
  setOverlayTextContents: (text: {
    intro: string;
    title: string;
    origin: string;
    about: string;
  }) => void;
  horizontalPosition: "left" | "center" | "right";
  setHorizontalPosition: Dispatch<SetStateAction<"left" | "center" | "right">>;
  setDEFAULT_ABOUT_TEXT: Dispatch<SetStateAction<string>>;
}

export function createOverlayContext(defaults: {
  introText?: string;
  titleText?: string;
  originText?: string;
  aboutText?: string;
}) {
  const OverlayContext = createContext<GenericOverlayState | undefined>(
    undefined
  );

  function OverlayProvider({ children }: { children: ReactNode }) {
    const DEFAULT_INTRO_TEXT = defaults.introText ?? "";
    const DEFAULT_TITLE_TEXT = defaults.titleText ?? "";
    const DEFAULT_ORIGIN_TEXT = defaults.originText ?? "";

    const [DEFAULT_ABOUT_TEXT, setDEFAULT_ABOUT_TEXT] = useState(
      defaults.aboutText ?? ""
    );
    const [titleText, setTitleText] = useState(DEFAULT_TITLE_TEXT);
    const [originText, setOriginText] = useState(DEFAULT_ORIGIN_TEXT);
    const [aboutText, setAboutText] = useState(DEFAULT_ABOUT_TEXT);
    const [introText, setIntroText] = useState(DEFAULT_INTRO_TEXT);
    const [overlayVisibility, setOverlayVisibility] = useState(true);
    const [horizontalPosition, setHorizontalPosition] = useState<
      "left" | "center" | "right"
    >("center");

    // Memoize callback functions to prevent unnecessary re-renders of consumers
    const resetOverlayTextContents = useCallback(() => {
      setTitleText(DEFAULT_TITLE_TEXT);
      setOriginText(DEFAULT_ORIGIN_TEXT);
      setAboutText(DEFAULT_ABOUT_TEXT);
      setIntroText(DEFAULT_INTRO_TEXT);
    }, [DEFAULT_TITLE_TEXT, DEFAULT_ORIGIN_TEXT, DEFAULT_ABOUT_TEXT, DEFAULT_INTRO_TEXT]);

    const setOverlayTextContents = useCallback((textObject: {
      intro: string;
      title: string;
      origin: string;
      about: string;
    }) => {
      const { intro, title, origin, about } = textObject;
      setIntroText(intro);
      setTitleText(title);
      setOriginText(origin);
      setAboutText(about);
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    // Only re-create when dependencies actually change
    const contextValue = useMemo(
      () => ({
        titleText,
        originText,
        aboutText,
        introText,
        overlayVisibility,
        setOverlayVisibility,
        resetOverlayTextContents,
        setOverlayTextContents,
        horizontalPosition,
        setHorizontalPosition,
        setDEFAULT_ABOUT_TEXT,
      }),
      [
        titleText,
        originText,
        aboutText,
        introText,
        overlayVisibility,
        resetOverlayTextContents,
        setOverlayTextContents,
        horizontalPosition,
      ]
    );

    return (
      <OverlayContext.Provider value={contextValue}>
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
