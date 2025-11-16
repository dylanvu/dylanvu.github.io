import React, { JSX, useEffect, useRef, useState } from "react";
import * as opentype from "opentype.js";
import type { Font } from "opentype.js";
import { SPACE_TEXT_COLOR } from "@/app/theme";

interface DrawLettersProps {
  text?: string | null;
  fontUrl?: string;
  fontSize?: number;
  duration?: number; // total ms to spend drawing all glyphs
  stagger?: number; // ms between glyph animations starting
  color?: string;
  width?: number | string;
  className?: string;
  onComplete?: () => void; // Callback when animation finishes
}

export default function DrawLetters({
  text,
  fontUrl = "/fonts/Allura-Regular.ttf",
  fontSize = 100,
  // faster defaults so animation feels snappier
  duration = 7500,
  stagger = 40,
  color = SPACE_TEXT_COLOR,
  width = "100%",
  className = "",
  onComplete,
}: DrawLettersProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [font, setFont] = useState<Font | undefined>(undefined);
  const loadingRef = useRef<boolean>(false);
  // uid for mask IDs — regenerated whenever text changes to avoid collisions
  const uidRef = useRef<string>(`dl-${Math.floor(Math.random() * 1e9)}`);
  const completedRef = useRef(false);
  const fallbackTimeoutRef = useRef<number | null>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset completed / uid whenever text changes so a new animation always runs.
  useEffect(() => {
    completedRef.current = false;
    uidRef.current = `dl-${Math.floor(Math.random() * 1e9)}`;
    // clear any pending fallback
    if (fallbackTimeoutRef.current) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }, [text]);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    opentype.load(fontUrl, (err: any, f?: Font) => {
      if (err) {
        console.error("DrawLetters: could not load font", err);
        setFont(undefined);
        loadingRef.current = false;
        return;
      }
      setFont(f);
      loadingRef.current = false;
    });
  }, [fontUrl]);

  function createSVG<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs: Record<string, string> = {}
  ): SVGElementTagNameMap[K] {
    const el = document.createElementNS(
      "http://www.w3.org/2000/svg",
      tag
    ) as SVGElementTagNameMap[K];
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function buildPathsAtBaseline(
    fontInstance: Font | undefined,
    textValue: string,
    baselineY: number
  ): { group: SVGGElement; defs: SVGDefsElement } | null {
    const svg = svgRef.current;
    if (!svg || !fontInstance) return null;

    // clear previous children
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const defs = createSVG("defs");
    svg.appendChild(defs);

    const group = createSVG("g");
    svg.appendChild(group);

    let currX = 0;
    const glyphs = fontInstance.stringToGlyphs(textValue || "");
    for (let i = 0; i < glyphs.length; i++) {
      const glyph: any = glyphs[i];
      const glyphPath: any = glyph.getPath(currX, baselineY, fontSize);
      const d: string = glyphPath.toPathData(4);

      const glyphG = createSVG("g");
      glyphG.setAttribute("data-glyph-index", String(i));

      const fillPath = createSVG("path", {
        d,
        fill: color || "currentColor",
        stroke: "none",
        opacity: "0",
      }) as SVGPathElement;
      fillPath.dataset.type = "fill";

      glyphG.appendChild(fillPath);
      group.appendChild(glyphG);

      const adv =
        glyph.advanceWidth * (fontSize / (fontInstance.unitsPerEm || 1000));
      currX += adv;
      if (i < glyphs.length - 1) {
        const kern = fontInstance.getKerningValue(
          glyph,
          glyphs[i + 1] || null
        ) as number;
        currX += kern * (fontSize / (fontInstance.unitsPerEm || 1000));
      }
    }

    return { group, defs };
  }

  function animateGroup(
    groupEl: SVGGElement | null,
    defsEl: SVGDefsElement | null
  ) {
    if (!groupEl || !defsEl) return;
    const glyphGroups = Array.from(
      groupEl.querySelectorAll("g[data-glyph-index]")
    ) as SVGGElement[];
    if (!glyphGroups.length) {
      // nothing to animate -> complete immediately
      onCompleteRef.current?.();
      return;
    }

    // cleanup any previous fallback timer
    if (fallbackTimeoutRef.current) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    const brushSize = Math.max(1, Math.round(fontSize / 12));
    type AnimEntry = {
      maskPath: SVGPathElement;
      len: number;
      fillPath: SVGPathElement;
    };
    const animEntries: AnimEntry[] = [];

    glyphGroups.forEach((g, gi) => {
      const fillPath = g.querySelector(
        'path[data-type="fill"]'
      ) as SVGPathElement | null;
      if (!fillPath) return;

      const maskId = `${uidRef.current}-mask-${gi}`;
      const mask = createSVG("mask", {
        id: maskId,
        maskUnits: "userSpaceOnUse",
      }) as SVGMaskElement;
      const rect = createSVG("rect", {
        x: "0",
        y: "0",
        width: "100%",
        height: "100%",
        fill: "black",
      }) as SVGRectElement;
      mask.appendChild(rect);

      const maskPath = createSVG("path", {
        d: fillPath.getAttribute("d") || "",
        fill: "none",
        stroke: "#fff",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }) as SVGPathElement;

      maskPath.style.strokeWidth = String(brushSize);
      maskPath.setAttribute("vector-effect", "non-scaling-stroke");

      mask.appendChild(maskPath);
      defsEl.appendChild(mask);

      // attach mask before revealing fill so no flash
      fillPath.setAttribute("mask", `url(#${maskId})`);

      let len = 0;
      try {
        len = maskPath.getTotalLength();
      } catch {
        len = 0;
      }
      len = Number.isFinite(len) ? len : 0;

      // prepare stroke-dash technique
      maskPath.style.transition = "none";
      maskPath.style.strokeDasharray = String(len);
      maskPath.style.strokeDashoffset = String(len);
      maskPath.style.strokeLinecap = "round";
      maskPath.style.strokeLinejoin = "round";
      maskPath.style.stroke = "#fff";

      // force layout so transitions apply reliably
      maskPath.getBoundingClientRect();

      animEntries.push({ maskPath, len, fillPath });
    });

    if (!animEntries.length) {
      onCompleteRef.current?.();
      return;
    }

    const totalLen = animEntries.reduce((s, e) => s + (e.len || 0), 0) || 1;
    const count = animEntries.length;
    const totalStagger = Math.max(0, stagger * Math.max(0, count - 1));
    const available = Math.max(0, duration - totalStagger);
    const minPer = 40; // shorter minimum so small glyphs don't slow things down

    let accumulatedPer = 0;
    const perList = animEntries.map((e, idx) => {
      let per =
        totalLen <= 0
          ? Math.round(available / count)
          : Math.round((available * e.len) / totalLen);
      per = Math.max(minPer, per);
      if (idx === animEntries.length - 1) {
        const remainder = Math.max(0, available - accumulatedPer);
        per = Math.max(minPer, remainder);
      } else accumulatedPer += per;
      return per;
    });

    // set transitions and trigger animations — use a single requestAnimationFrame to start sooner
    animEntries.forEach(({ maskPath, fillPath }, i) => {
      const per = perList[i] || minPer;
      const startDelay = i * stagger;
      // assign transition including delay
      maskPath.style.transition = `stroke-dashoffset ${per}ms cubic-bezier(.2,.9,.3,1) ${startDelay}ms`;
      // reveal fill + start stroke in next frame
      requestAnimationFrame(() => {
        fillPath.style.opacity = "1";
        maskPath.style.strokeDashoffset = "0";
      });
    });

    // compute finish time of last animation precisely
    const lastIndex = animEntries.length - 1;
    const lastDelay = lastIndex * stagger;
    const lastDuration = perList[lastIndex] || minPer;
    const totalMs = lastDelay + lastDuration;

    const lastEntry = animEntries[lastIndex];

    // ensure we only call completion once
    const onFinish = (ev?: TransitionEvent) => {
      if (ev && ev.propertyName && ev.propertyName !== "stroke-dashoffset")
        return;
      if (completedRef.current) return;
      completedRef.current = true;
      try {
        lastEntry.maskPath.removeEventListener(
          "transitionend",
          onFinish as any
        );
      } catch {}
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      onCompleteRef.current?.();
    };

    // listen once and also provide a short fallback
    lastEntry.maskPath.addEventListener("transitionend", onFinish as any, {
      once: true,
    });
    fallbackTimeoutRef.current = window.setTimeout(
      () => {
        onFinish();
      },
      Math.max(80, totalMs + 60)
    ); // short buffer
  }

  useEffect(() => {
    if (!font) return;
    const svg = svgRef.current;
    if (!svg) return;

    const unitsPerEm = font.unitsPerEm || 1000;
    const scale = fontSize / unitsPerEm;
    const ascender =
      (font as any).ascender ??
      (font as any).tables?.hhea?.ascender ??
      Math.round(unitsPerEm * 0.8);
    const descender =
      (font as any).descender ??
      (font as any).tables?.hhea?.descender ??
      Math.round(-unitsPerEm * 0.2);
    const ascPx = ascender * scale;
    const descPx = descender * scale;
    const stableHeightPx = ascPx - descPx;
    const padY = Math.max(1, Math.round(fontSize * 0.06));
    const baselineY = ascPx + padY;

    const built = buildPathsAtBaseline(font, String(text || ""), baselineY);
    if (!built) return;
    const { group, defs } = built;

    // only a single requestAnimationFrame before measuring / sizing / starting the animation
    requestAnimationFrame(() => {
      try {
        const bbox = group.getBBox();
        const padX = Math.max(1, Math.round(fontSize * 0.03));
        const minX = bbox.x - padX;
        const w = Math.max(1, bbox.width + padX * 2);
        const h = Math.max(1, Math.ceil(stableHeightPx + padY * 2));

        svg.setAttribute("viewBox", `${minX} 0 ${w} ${h}`);
        svg.setAttribute("height", String(h));
        svg.style.height = `${h}px`;
        if (typeof width === "number") svg.setAttribute("width", String(width));
        else svg.setAttribute("width", String(width));
        svg.setAttribute("preserveAspectRatio", "xMinYMid meet");
      } catch {
        const fallbackH = Math.max(1, Math.round(fontSize * 1.2));
        svg.setAttribute("viewBox", `0 0 1000 ${fallbackH}`);
        svg.setAttribute("height", String(fallbackH));
        svg.style.height = `${fallbackH}px`;
        if (typeof width === "number") svg.setAttribute("width", String(width));
        else svg.setAttribute("width", String(width));
      }

      animateGroup(group as SVGGElement, defs as SVGDefsElement);
    });

    return () => {
      // cleanup svg children and fallback timer
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if (svg) while (svg.firstChild) svg.removeChild(svg.firstChild);
    };
  }, [font, text, fontSize, duration, stagger, color, width]);

  return (
    <div className={className} style={{ display: "inline-block", color }}>
      <svg
        ref={svgRef}
        viewBox="0 0 1 1"
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      />
    </div>
  );
}
