import React, { JSX, useEffect, useMemo, useState, useRef } from "react";
import * as opentype from "opentype.js";
import type { Font } from "opentype.js";
import { SPACE_TEXT_COLOR } from "@/app/theme";

// --- Global Font Cache ---
const fontCache: Record<string, Promise<Font>> = {};

function loadFont(url: string): Promise<Font> {
  if (!fontCache[url]) {
    fontCache[url] = new Promise((resolve, reject) => {
      opentype.load(url, (err, font) => {
        if (err) reject(err);
        else if (font) resolve(font);
      });
    });
  }
  return fontCache[url];
}

interface DrawLettersProps {
  text?: string | null;
  fontUrl?: string;
  fontSize?: number;
  duration?: number;
  stagger?: number;
  color?: string;
  width?: number | string;
  className?: string;
  onComplete?: () => void;
}

interface GlyphData {
  d: string;
  index: number;
  maskId: string;
}

export default function DrawLetters({
  text = "",
  fontUrl = "/fonts/Allura-Regular.ttf",
  fontSize = 100,
  duration = 3000,
  stagger = 50,
  color = SPACE_TEXT_COLOR,
  width = "100%",
  className = "",
  onComplete,
}: DrawLettersProps): JSX.Element {
  const [font, setFont] = useState<Font | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textStr = text || "";

  const uid = useMemo(() => `dl-${Math.random().toString(36).slice(2, 9)}`, []);

  // 1. Load Font
  useEffect(() => {
    let mounted = true;
    loadFont(fontUrl)
      .then((f) => {
        if (mounted) setFont(f);
      })
      .catch((err) => console.error("DrawLetters font error:", err));
    return () => {
      mounted = false;
    };
  }, [fontUrl]);

  // 2. Calculate Paths & Dimensions
  const {
    glyphs,
    width: svgWidth,
    height: svgHeight,
    viewBox,
    totalDuration,
    perLetterDuration,
  } = useMemo(() => {
    if (!font || !textStr) {
      return {
        glyphs: [],
        width: 0,
        height: 0,
        viewBox: "0 0 0 0",
        totalDuration: 0,
        perLetterDuration: 0,
      };
    }

    const glyphData: GlyphData[] = [];
    const fontScale = fontSize / font.unitsPerEm;
    const opentypeGlyphs = font.stringToGlyphs(textStr);

    const ascender = font.ascender * fontScale;
    const descender = font.descender * fontScale || -(fontSize * 0.2);
    const baseline = ascender;

    let cursorX = 0;
    const padX = fontSize * 0.1;
    const padY = fontSize * 0.1;

    opentypeGlyphs.forEach((glyph, i) => {
      const path = glyph.getPath(cursorX + padX, baseline + padY, fontSize);
      const d = path.toPathData(2);

      if (d) {
        glyphData.push({
          d,
          index: i,
          maskId: `${uid}-m-${i}`,
        });
      }

      const advance = (glyph.advanceWidth ?? 0) * fontScale;
      cursorX += advance;

      if (i < opentypeGlyphs.length - 1) {
        const kern = font.getKerningValue(glyph, opentypeGlyphs[i + 1]);
        cursorX += kern * fontScale;
      }
    });

    const boxWidth = cursorX + padX * 2;
    const boxHeight = ascender - descender + padY * 2;

    // --- FIXED TIMING LOGIC ---
    const count = glyphData.length;
    // The delay of the very last letter
    const lastLetterDelay = Math.max(0, (count - 1) * stagger);

    // To finish exactly at 'duration', the individual letter must take:
    // Total Duration - Start Time of Last Letter
    let calculatedLetterDuration = duration - lastLetterDelay;

    // Safety clamp: If stagger is huge, duration might become negative.
    // We enforce a minimum of 300ms per letter to avoid glitches.
    // Note: This means if stagger is too high, the Total Time will exceed the requested 'duration'.
    calculatedLetterDuration = Math.max(300, calculatedLetterDuration);

    // The actual final duration (used for the onComplete timer)
    const realTotalDuration = lastLetterDelay + calculatedLetterDuration;

    return {
      glyphs: glyphData,
      width: boxWidth,
      height: boxHeight,
      viewBox: `0 0 ${boxWidth} ${boxHeight}`,
      totalDuration: realTotalDuration,
      perLetterDuration: calculatedLetterDuration,
    };
  }, [font, textStr, fontSize, uid, duration, stagger]);

  // 3. Animation Trigger
  useEffect(() => {
    if (glyphs.length === 0) return;

    const frame = requestAnimationFrame(() => {
      setIsAnimating(true);
    });
    const timer = setTimeout(() => {
      onComplete?.();
    }, totalDuration + 100);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      setIsAnimating(false);
    };
  }, [glyphs, totalDuration, onComplete]);

  if (!font || !glyphs.length) {
    return (
      <div className={className} style={{ width, height: fontSize }}></div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "flex",
        width,
        color,
        lineHeight: 0,
      }}
    >
      <svg
        viewBox={viewBox}
        width={svgWidth}
        height={svgHeight}
        style={{
          maxWidth: "100%",
          height: "auto",
          overflow: "visible",
        }}
      >
        <defs>
          {glyphs.map((g) => (
            <mask
              key={`mask-${g.index}`}
              id={g.maskId}
              maskUnits="userSpaceOnUse"
            >
              <rect width="100%" height="100%" fill="black" />
              <path
                d={g.d}
                fill="none"
                stroke="white"
                strokeWidth={Math.max(2, fontSize / 15)}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                style={{
                  strokeDasharray: "1",
                  strokeDashoffset: isAnimating ? "0" : "1",
                  // Use the calculated uniform duration
                  transition: `stroke-dashoffset ${perLetterDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`,
                  transitionDelay: `${g.index * stagger}ms`,
                }}
              />
            </mask>
          ))}
        </defs>
        <g>
          {glyphs.map((g) => (
            <path
              key={`fill-${g.index}`}
              d={g.d}
              fill="currentColor"
              mask={`url(#${g.maskId})`}
              style={{
                opacity: isAnimating ? 1 : 0,
                transition: `opacity 50ms linear ${g.index * stagger}ms`,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
