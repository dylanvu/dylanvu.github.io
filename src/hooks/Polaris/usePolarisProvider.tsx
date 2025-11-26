"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChatMessage, ErrorMessages, talkToAgent } from "@/hooks/Polaris/tools/talk";
import { useCenterOverlayContext } from "../useCenterOverlay";
import { usePathname } from "next/navigation";

export type PolarisDisplayState = "hidden" | "active" | "suppressed";

interface PolarisContextInterface {
  polarisHistory: ChatMessage[];
  setPolarisHistory: (newHistory: ChatMessage[]) => void;
  talkToPolaris: (newMessage: string) => void;
  isThinking: boolean;
  isTalking: boolean;
  /**
   * This state shows whether polaris is on the bottom left or not
   */
  isReady: boolean;
  setIsReady: (newState: boolean) => void;
  polarisDisplayState: PolarisDisplayState;
  setPolarisDisplayState: (newState: PolarisDisplayState | ((prev: PolarisDisplayState) => PolarisDisplayState)) => void;
  registerStreamChunkCallback: (callback: () => void) => void;
}

const PolarisContext = createContext<PolarisContextInterface | undefined>(
  undefined
);

export function PolarisProvider({ children }: { children: React.ReactNode }) {
  const initialMessage: ChatMessage = {
    role: "model",
    message:
      "Good evening, stargazer. What would you like to know about Dylan's night sky?",
  };

  const {
    setDEFAULT_ABOUT_TEXT,
    setOverlayTextContents,
    introText,
    titleText,
    aboutText,
    originText,
  } = useCenterOverlayContext();

  const [polarisHistory, setPolarisHistory] = useState<ChatMessage[]>([
    initialMessage,
  ]);

  const pathname = usePathname();

  /**
   * This state shows whether Polaris LLM is thinking
   */
  const [isThinking, setIsThinking] = useState<boolean>(false);

  /**
   * This state is true when the message is being streamed
   */
  const [isTalking, setIsTalking] = useState<boolean>(false);

  /**
   * This state tracks the display state of the polaris panel
   */
  const [polarisDisplayState, setPolarisDisplayState] = useState<PolarisDisplayState>("hidden");

  /**
   * This state shows whether polaris is on the bottom left or not
   */
  const [isReady, setIsReady] = useState<boolean>(false);

  /**
   * Ref to store the stream chunk callback for triggering pulses
   */
  const streamChunkCallbackRef = useRef<(() => void) | null>(null);

  /**
   * Function to register the stream chunk callback from the Polaris component
   */
  const registerStreamChunkCallback = (callback: () => void) => {
    streamChunkCallbackRef.current = callback;
  };

  /**
   * Internal function to trigger the registered callback
   */
  const onStreamChunk = () => {
    if (streamChunkCallbackRef.current) {
      streamChunkCallbackRef.current();
    }
  };

  useEffect(() => {
    if (isReady) {
      let newDefaultAbout = "or consult Polaris to find your way";
      if (polarisDisplayState === "active") {
        newDefaultAbout = "or consult Polaris below to find your way"
      }
      setDEFAULT_ABOUT_TEXT(newDefaultAbout);
      if (titleText === "Dylan Vu" && aboutText !== newDefaultAbout) {
        setOverlayTextContents({
          intro: introText,
          title: titleText,
          origin: originText,
          about: newDefaultAbout,
        });
      }
    }
  }, [isReady, polarisDisplayState]);

  const PLACEHOLDER_MSG = "Polaris is navigating the night sky..."
  
  const ERROR_MESSAGES: ErrorMessages = {
    default: "I apologize, stargazer. Something went wrong while reading the stars. Please try again.",
    rateLimit: "Forgive me, stargazer. I've been reading the stars too often and quickly. Please wait a moment and ask me again.",
    serverError: "I apologize, stargazer. The cosmic winds have obscured my vision. Please try again in a moment.",
    network: "I apologize, stargazer. The celestial connection has been interrupted. Please check the connection and try again."
  };

  async function talkToPolaris(newMessage: string) {
    await talkToAgent(
      newMessage,
      polarisHistory,
      setPolarisHistory,
      setIsThinking,
      setIsTalking,
      PLACEHOLDER_MSG,
      ERROR_MESSAGES,
      onStreamChunk
    );
  }

  useEffect(() => {
    // auto suppress polaris if you just entered a star page
    if (pathname.startsWith("/star/")) {
      if (polarisDisplayState === "active") {
        setPolarisDisplayState("suppressed");
      }
    } else if (pathname === "/") {
      // If exiting from a star page and polaris was suppressed, restore it to active
      if (polarisDisplayState === "suppressed") {
          setPolarisDisplayState("active");
        }
    }

  }, [pathname])

  return (
    <PolarisContext.Provider
      value={{
        isThinking,
        polarisHistory,
        setPolarisHistory,
        talkToPolaris,
        isReady,
        setIsReady,
        polarisDisplayState,
        setPolarisDisplayState,
        isTalking,
        registerStreamChunkCallback
      }}
    >
      {children}
    </PolarisContext.Provider>
  );
}

export function usePolarisContext() {
  const ctx = useContext(PolarisContext);
  if (!ctx) {
    throw new Error("usePolarisContext must be used within PolarisProvider");
  }
  return ctx;
}
