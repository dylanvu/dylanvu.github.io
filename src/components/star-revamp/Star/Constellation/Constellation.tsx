import Konva from "konva";
import { Group, Rect } from "react-konva";
import { useState, useRef, useEffect, useMemo } from "react";
import MainStar from "@/components/star-revamp/Star/MainStar";
import AnimatedLine from "./AnimatedLine";
import ConstellationBoundingBox from "./ConstellationBoundingBox";
import { ConstellationData, TransformData, isStarDataWithInternalLink } from "@/interfaces/StarInterfaces";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";
import { usePathname, useRouter } from "next/navigation";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { STAR_BASE_URL } from "@/constants/Routes";

export default function Constellation({
  data,
  transformData,
  showBoundingBox,
  showStarBoundingBox,
  boundingBoxPaddingX = 3,
  boundingBoxPaddingY = 3,
  useExactLabelFit = true,
  bboxLabelSize = 4,
  bboxLabelFontFamily = "sans-serif",
  windowCenter,
  focusedConstellation,
  focusedUnfocusedPos,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  onClickCallback,
}: {
  data: ConstellationData;
  transformData: TransformData;
  showBoundingBox?: boolean;
  showStarBoundingBox?: boolean;
  boundingBoxPaddingX?: number;
  boundingBoxPaddingY?: number;
  useExactLabelFit?: boolean;
  bboxLabelSize?: number;
  bboxLabelFontFamily?: string;
  windowCenter: { x: number; y: number };
  focusedConstellation: ConstellationData | null;
  focusedUnfocusedPos?: { x: number; y: number } | null;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
}) {
  let isFocused = false;
  if (focusedConstellation) {
    if (focusedConstellation.name === data.name) {
      isFocused = true;
    }
  }

  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;

  const isReturningRef = useRef(false);

  const pathname = usePathname();

  const { stars, connections, totalDuration } = data;
  const DEFAULT_TOTAL_DURATION = 2;
  const [brightness, setBrightness] = useState(1);
  const brightnessHover = 1.2;
  const [isHovered, setIsHovered] = useState(false);

  const groupRef = useRef<Konva.Group>(null);
  const hoverTweenRef = useRef<Konva.Tween | null>(null);
  const focusTweenRef = useRef<Konva.Tween | null>(null);

  const focusScale: number = data.focusScale;

  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);

  // --- BOUNDING BOX MEASUREMENTS ---
  const hasLabels = stars.some((s) => !!s.data?.label);
  const SHOULD_MEASURE_LABELS = useExactLabelFit && hasLabels;

  const measuredExtents = (() => {
    const defaultMinX = Math.min(...xs);
    const defaultMaxX = Math.max(...xs);
    const defaultMinY = Math.min(...ys);
    const defaultMaxY = Math.max(...ys);

    if (!SHOULD_MEASURE_LABELS) {
      const minX = defaultMinX - boundingBoxPaddingX;
      const maxX = defaultMaxX + boundingBoxPaddingX;
      const minY = defaultMinY - boundingBoxPaddingY;
      const maxY = defaultMaxY + boundingBoxPaddingY;
      return { minX, maxX, minY, maxY };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of stars) {
      const sx = s.x;
      const sy = s.y;
      const starRadius = s.size ?? 5;

      minX = Math.min(minX, sx - starRadius);
      maxX = Math.max(maxX, sx + starRadius);
      minY = Math.min(minY, sy - starRadius);
      maxY = Math.max(maxY, sy + starRadius);

      if (s.data?.label) {
        const temp = new Konva.Text({
          text: String(s.data.label),
          fontSize: bboxLabelSize,
          fontFamily: bboxLabelFontFamily,
        });
        const labelW = temp.width();
        const labelH = temp.height();
        const labelTop = sy + starRadius + bboxLabelSize;
        const labelBottom = labelTop + labelH;

        const labelLeft = sx - labelW / 2;
        const labelRight = sx + labelW / 2;

        minX = Math.min(minX, labelLeft);
        maxX = Math.max(maxX, labelRight);
        minY = Math.min(minY, labelTop);
        maxY = Math.max(maxY, labelBottom);
      }
    }

    minX -= boundingBoxPaddingX;
    maxX += boundingBoxPaddingX;
    minY -= boundingBoxPaddingY;
    maxY += boundingBoxPaddingY;

    if (!isFinite(minX) || !isFinite(minY)) {
      return {
        minX: (Math.min(...xs) || 0) - boundingBoxPaddingX,
        maxX: (Math.max(...xs) || 0) + boundingBoxPaddingX,
        minY: (Math.min(...ys) || 0) - boundingBoxPaddingY,
        maxY: (Math.max(...ys) || 0) + boundingBoxPaddingY,
      };
    }

    return { minX, maxX, minY, maxY };
  })();

  const minX = measuredExtents.minX - 10;
  const maxX = measuredExtents.maxX + 10;
  const minY = measuredExtents.minY - 10;
  const maxY = measuredExtents.maxY + 10;
  const width = maxX - minX;
  const height = maxY - minY;

  // center in local group coordinates
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const getDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const lineSegments =
    connections && connections.length > 0
      ? connections
      : stars.slice(1).map((_, i) => [i, i + 1] as [number, number]);

  const lineLengths = lineSegments.map(([i1, i2]) =>
    getDistance(stars[i1], stars[i2])
  );
  const totalLineLength = lineLengths.reduce((sum, l) => sum + l, 0) || 1;
  const lineDurations = lineLengths.map(
    (l) => (l / totalLineLength) * (totalDuration ?? DEFAULT_TOTAL_DURATION)
  );
  const lineDelays = lineDurations.reduce<number[]>((acc, dur, idx) => {
    if (idx === 0) acc.push(0);
    else acc.push(acc[idx - 1] + lineDurations[idx - 1]);
    return acc;
  }, []);

  const HOVER_SCALE = 1.1;
  const SCALE_ANIMATION_DURATION = 0.75;
  const FOCUS_ANIMATION_DURATION = 0.5;
  const EASING = Konva.Easings.EaseInOut;

  const {polarisActivated, setPolarisActivated } = usePolarisContext();
  
  const { focusedObject } = useFocusContext();

  // Memoized target position - automatically updates when pathname or polarisActivated changes
  const focusedTargetX = useMemo(() => {
    return pathname !== "/" && !polarisActivated
      ? windowCenter.x / 2
      : windowCenter.x;
  }, [pathname, polarisActivated, windowCenter.x]);

  const playHoverTween = (toScaleX: number, toScaleY: number) => {
    const node = groupRef.current;
    if (!node) return;

    // Do not play hover animations if focused
    if (isFocusedRef.current) return;

    // FIX: Do not play hover animations if we are currently flying back
    if (isReturningRef.current) return;

    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    // If we are just hovering, we destroy the focus tween so we don't fight over scale.
    // BUT thanks to the isReturningRef check above, this line will no longer execute
    // if the focusTween is actively moving the star back home.
    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
      focusTweenRef.current = null;
    }

    hoverTweenRef.current = new Konva.Tween({
      node,
      duration: SCALE_ANIMATION_DURATION,
      scaleX: toScaleX,
      scaleY: toScaleY,
      easing: EASING,
    });

    hoverTweenRef.current.play();
  };

  const playFocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // If we are focusing, we are definitely not "returning" anymore
    isReturningRef.current = false;

    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
    }

    // Use memoized target position - automatically updates with pathname/polarisActivated
    const targetY = windowCenter.y;

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: focusedTargetX,
      y: targetY,
      scaleX: (transformData.scaleX ?? 1) * focusScale,
      scaleY: (transformData.scaleY ?? 1) * focusScale,
      rotation: 0,
    });

    focusTweenRef.current.play();
  };

  const unfocusedConstellationX = (transformData.x ?? 0) + centerX;
  const unfocusedConstellationY = (transformData.y ?? 0) + centerY;

  const playUnfocusTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // FIX: Mark as returning. This blocks the hover logic.
    isReturningRef.current = true;

    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
    }

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: unfocusedConstellationX,
      y: unfocusedConstellationY,
      scaleX: transformData.scaleX ?? 1,
      scaleY: transformData.scaleY ?? 1,
      rotation: transformData.rotation ?? 0,
      // FIX: When the tween finishes, we are no longer returning.
      onFinish: () => {
        isReturningRef.current = false;
      },
    });

    focusTweenRef.current.play();
  };

  const playVanishTween = () => {
    const node = groupRef.current;
    if (!node) return;

    // If it vanishes, we aren't "returning" to a clickable spot, but we are moving.
    // Let's block hover anyway.
    isReturningRef.current = true;

    if (focusTweenRef.current) {
      focusTweenRef.current.destroy();
    }
    if (hoverTweenRef.current) {
      hoverTweenRef.current.destroy();
      hoverTweenRef.current = null;
    }

    const currentX = unfocusedConstellationX;
    const currentY = unfocusedConstellationY;
    const focal = focusedUnfocusedPos ?? windowCenter;

    let vx = currentX - focal.x;
    let vy = currentY - focal.y;
    let vlen = Math.hypot(vx, vy);

    if (vlen < 0.0001) {
      vx = 0;
      vy = -1;
      vlen = 1;
    }

    const nx = vx / vlen;
    const ny = vy / vlen;

    const vw =
      typeof window !== "undefined" ? window.innerWidth : windowCenter.x * 2;
    const vh =
      typeof window !== "undefined" ? window.innerHeight : windowCenter.y * 2;
    const viewportDiagonal = Math.hypot(vw, vh);
    const offscreenDist = viewportDiagonal * 1.4 + Math.max(width, height);

    const targetX = currentX + nx * offscreenDist;
    const targetY = currentY + ny * offscreenDist;

    const targetScaleX = (transformData.scaleX ?? 1) * 0.9;
    const targetScaleY = (transformData.scaleY ?? 1) * 0.9;

    focusTweenRef.current = new Konva.Tween({
      node,
      duration: FOCUS_ANIMATION_DURATION,
      easing: EASING,
      x: targetX,
      y: targetY,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      rotation: transformData.rotation ?? 0,
      onFinish: () => {
        isReturningRef.current = false;
      },
    });

    focusTweenRef.current.play();
  };

  useEffect(() => {
    if (isFocused) {
      groupRef.current?.moveToTop();
      playFocusTween();
    } else {
      playUnfocusTween();
    }
    if (focusedConstellation) {
      if (!isFocused) {
        playVanishTween();
      }
    }
  }, [isFocused, focusedConstellation, pathname, polarisActivated]);

  const {
    setOverlayTextContents: setTopOverlayTextContents,
    resetOverlayTextContents: resetTopOverlayTextContents,
  } = useTopOverlayContext();

  const { setOverlayTextContents: setCenterOverlayTextContents } =
    useCenterOverlayContext();


  const router = useRouter();

  const handleConstellationClick = (e: any) => {
    e.cancelBubble = true;
    if (!isFocusedRef.current) {
      groupRef.current?.moveToTop();
    }
    document.body.style.cursor = "default";
    if (onClickCallback) onClickCallback();
  };

  const handleInteractionStart = () => {
    // Always set cursor to pointer when hovering, even if returning
    if (!isFocusedRef.current) {
      document.body.style.cursor = "pointer";
    }
    setIsHovered(true);

    // Check if returning. If so, skip animations but allow cursor change.
    if (isReturningRef.current) {
      if (onHoverEnterCallback) onHoverEnterCallback();
      return;
    }

    if (!isFocusedRef.current) {
      setBrightness(brightnessHover);
      playHoverTween(
        (transformData.scaleX ?? 1) * HOVER_SCALE,
        (transformData.scaleY ?? 1) * HOVER_SCALE
      );
    }

    if (onHoverEnterCallback) onHoverEnterCallback();
  };

  const handleInteractionEnd = () => {
    // Always reset cursor when leaving, even if returning
    document.body.style.cursor = "default";
    setIsHovered(false);

    // If returning, skip animations but allow cursor change.
    if (isReturningRef.current) {
      if (onHoverLeaveCallback) onHoverLeaveCallback();
      return;
    }

    if (!isFocusedRef.current) {
      setBrightness(1);
      playHoverTween(transformData.scaleX ?? 1, transformData.scaleY ?? 1);
    }

    if (onHoverLeaveCallback) onHoverLeaveCallback();
  };

  return (
    <Group
      ref={groupRef}
      onClick={handleConstellationClick}
      onTap={handleConstellationClick}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      x={unfocusedConstellationX}
      y={unfocusedConstellationY}
      offsetX={centerX}
      offsetY={centerY}
      rotation={transformData.rotation}
      scaleX={transformData.scaleX ?? 1}
      scaleY={transformData.scaleY ?? 1}
    >
      <Rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        fill={showBoundingBox ? "rgba(255,0,0,0.2)" : ""}
        listening={true}
      />

      {/* Constellation lines */}
      {lineSegments.map(([i1, i2], idx) => (
        <AnimatedLine
          key={`conn-${idx}`}
          p1={stars[i1]}
          p2={stars[i2]}
          duration={lineDurations[idx]}
          delay={lineDelays[idx]}
        />
      ))}

      <ConstellationBoundingBox
        isVisible={isFocused || showStarBoundingBox || isHovered}
        tl={{ x: minX, y: minY }}
        tr={{ x: maxX, y: minY }}
        br={{ x: maxX, y: maxY }}
        bl={{ x: minX, y: maxY }}
        width={width}
        height={height}
        brightness={brightness}
        totalDuration={totalDuration}
      />

      {/* original stars */}
      {stars.map((star, i) => {
        const incomingLineIndex = lineSegments.findIndex(
          ([start, end]) => end === i || start === i
        );
        const delay =
          incomingLineIndex >= 0
            ? lineDelays[incomingLineIndex] + lineDurations[incomingLineIndex]
            : 0;

        return (
          <MainStar
            key={i}
            x={star.x}
            y={star.y}
            size={star.size || 5}
            brightness={brightness}
            delay={delay}
            data={star.data}
            showLabel={isFocused}
            labelSize={4}
            isConstellationFocused={isFocused}
            onHoverEnterCallback={() => {
              // Guard clause for stars too
              if (isReturningRef.current) return;

              if (star.data) {
                if (isFocusedRef.current) {
                  setTopOverlayTextContents({
                    intro: star.data.classification,
                    title: star.data.label,
                    origin: star.data.origin,
                    about: star.data.about,
                  });
                } else {
                  setCenterOverlayTextContents({
                    intro: star.data.classification,
                    title: star.data.label,
                    origin: star.data.origin,
                    about: star.data.about,
                  });
                }
              }
            }}
            onHoverLeaveCallback={() => {
              // Guard clause
              if (isReturningRef.current) return;

              if (star.data?.label) {
                if (isFocusedRef.current) {
                  // go back to the appropriate information
                  if (pathname === "/") {
                    // On home page: restore constellation info
                    setTopOverlayTextContents({
                      intro: data.intro,
                      title: data.name,
                      origin: data.about,
                      about: "",
                    });
                  } else if (focusedObject.star) {
                    // On star page: restore the focused star's info
                    setTopOverlayTextContents({
                      intro: focusedObject.star.classification,
                      title: focusedObject.star.label,
                      origin: focusedObject.star.origin,
                      about: focusedObject.star.about,
                    });
                  }
                } else {
                  resetTopOverlayTextContents();
                  setCenterOverlayTextContents({
                    intro: data.intro,
                    title: data.name,
                    origin: data.origin,
                    about: data.about,
                  });
                }
              }
              if (isFocusedRef.current) {
                document.body.style.cursor = "default";
              }
            }}
            cancelBubble={true}
            onClickCallback={() => {
              const data = star.data;
              if (data) {
                if (data.externalLink) {
                  window.open(
                    data.externalLink,
                    "_blank",
                    "noopener,noreferrer"
                  );
                } else if (isStarDataWithInternalLink(data)) {
                  if (polarisActivated) {
                    setPolarisActivated(false);
                  }
                  router.push(`${STAR_BASE_URL}/${data.slug}`);
                }
                setTopOverlayTextContents({
                  intro: data.classification,
                  title: data.label,
                  origin: data.origin,
                  about: data.about,
                });
              }
            }}
            onHoverScale={isFocused ? 1.3 : 2}
          />
        );
      })}
    </Group>
  );
}
