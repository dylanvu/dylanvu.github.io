"use client";

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type Size = { width: number; height: number; ready: boolean };

const WindowSizeContext = createContext<Size | undefined>(undefined);

export function WindowSizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [size, setSize] = useState<Size>(() => {
    // SSR-friendly initial (will be replaced on mount)
    if (typeof window === "undefined")
      return { width: 0, height: 0, ready: false };
    return {
      width: Math.round(window.innerWidth),
      height: Math.round(window.innerHeight),
      ready: true,
    };
  });

  useLayoutEffect(() => {
    let raf = 0;
    const measure = () => {
      setSize({
        width: Math.max(0, Math.round(window.innerWidth)),
        height: Math.max(0, Math.round(window.innerHeight)),
        ready: true,
      });
    };

    // measure before paint
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

  // memo to keep stable reference unless values change
  const value = useMemo(() => size, [size.width, size.height, size.ready]);

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
