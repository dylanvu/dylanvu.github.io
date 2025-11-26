import { StarDataWithInternalLink } from "@/interfaces/StarInterfaces";
import Konva from "konva";
import { RefObject } from "react";

interface UseConstellationInteractionsProps {
  isFocusedRef: RefObject<boolean>;
  isReturningRef: RefObject<boolean>;
  focusedObjectStar: StarDataWithInternalLink | null;
  transformData: { scaleX?: number; scaleY?: number };
  brightnessHover: number;
  HOVER_SCALE: number;
  playHoverTween: (toScaleX: number, toScaleY: number) => void;
  onClickCallback?: () => void;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  setBrightness: (brightness: number) => void;
  setIsHovered: (isHovered: boolean) => void;
  groupRef: RefObject<Konva.Group | null>;
}

export function useConstellationInteractions({
  isFocusedRef,
  isReturningRef,
  focusedObjectStar,
  transformData,
  brightnessHover,
  HOVER_SCALE,
  playHoverTween,
  onClickCallback,
  onHoverEnterCallback,
  onHoverLeaveCallback,
  setBrightness,
  setIsHovered,
  groupRef,
}: UseConstellationInteractionsProps) {
  const handleConstellationClick = (e: Konva.KonvaPointerEvent) => {
    e.cancelBubble = true;
    if (focusedObjectStar) return;
    
    if (!isFocusedRef.current) {
      groupRef.current?.moveToTop();
    }
    document.body.style.cursor = "default";
    if (onClickCallback) onClickCallback();
  };

  const handleInteractionStart = () => {
    if (!isFocusedRef.current) {
      document.body.style.cursor = "pointer";
    }
    setIsHovered(true);

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
    document.body.style.cursor = "default";
    setIsHovered(false);

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

  return {
    handleConstellationClick,
    handleInteractionStart,
    handleInteractionEnd,
  };
}
