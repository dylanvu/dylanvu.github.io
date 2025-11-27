"use client";

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type WindowCenter = { x: number; y: number };
type Size = {
  width: number;
  height: number;
  windowCenter: WindowCenter;
  ready: boolean;
};

const WindowSizeContext = createContext<Size | undefined>(undefined);

export function WindowSizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // FIX: Always initialize to "not ready" (zeros).
  // This ensures Server and First Client Render match exactly.
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
    windowCenter: { x: 0, y: 0 },
    ready: false,
  });

  useLayoutEffect(() => {
    let raf = 0;

    const measure = () => {
      const width = Math.max(0, Math.round(window.innerWidth));
      const height = Math.max(0, Math.round(window.innerHeight));

      setSize({
        width,
        height,
        windowCenter: { x: width / 2, y: height / 2 },
        ready: true,
      });
    };

    // This runs immediately after mount, populating the size
    // and triggering the second render (which shows the Stage)
    measure();

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const value = useMemo(() => size, [size, size.width, size.height, size.ready]);

  return (
    <WindowSizeContext.Provider value={value}>
      {children}
    </WindowSizeContext.Provider>
  );
}

export function useWindowSizeContext() {
  const ctx = useContext(WindowSizeContext);
  if (!ctx)
    throw new Error(
      "useWindowSizeContext must be used within WindowSizeProvider"
    );
  return ctx;
}
