import Konva from "konva";
import { RefObject } from "react";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { ConstellationData } from "@/interfaces/StarInterfaces";

interface UseConstellationInteractionsProps {
  animationTweenRef: React.RefObject<Konva.Tween | null>
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
  data: ConstellationData
}

export function useConstellationInteractions({
  animationTweenRef,
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
  data,
}: UseConstellationInteractionsProps) {
  const { focusedObject } = useFocusContext();
  const isFocused = focusedObject.constellation === data;
  const handleConstellationClick = (e: Konva.KonvaPointerEvent) => {
    e.cancelBubble = true;
    if (focusedObject.star) return;
    
    if (!focusedObject.constellation) {
      groupRef.current?.moveToTop();
    }
    document.body.style.cursor = "default";
    if (onClickCallback) onClickCallback();
  };

  const handleInteractionStart = () => {
    if (!isFocused) {
      document.body.style.cursor = "pointer";
    }
    setIsHovered(true);

    if (animationTweenRef.current) {
      if (onHoverEnterCallback) onHoverEnterCallback();
      return;
    }

    if (!isFocused) {
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

    if (animationTweenRef.current) {
      if (onHoverLeaveCallback) onHoverLeaveCallback();
      return;
    }

    if (!isFocused) {
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
