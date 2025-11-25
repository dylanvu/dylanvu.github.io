import { ConstellationData, TransformData } from "@/interfaces/StarInterfaces";

interface ConstellationProps {
  data: ConstellationData;
  transformData: TransformData;
  windowCenter: { x: number; y: number };
  focusedConstellation: ConstellationData | null;
  showBoundingBox?: boolean;
  showStarBoundingBox?: boolean;
  onHoverEnterCallback?: () => void;
  onHoverLeaveCallback?: () => void;
  onClickCallback?: () => void;
}

/**
 * Custom comparison function for React.memo to optimize Constellation component re-renders.
 * Only triggers re-render when specific props that affect the constellation's appearance or behavior change.
 */
export function areConstellationPropsEqual(
  prevProps: ConstellationProps,
  nextProps: ConstellationProps
): boolean {
  // Check if constellation data changed
  if (prevProps.data !== nextProps.data) {
    if (prevProps.data && nextProps.data) {
      if (
        prevProps.data.name !== nextProps.data.name ||
        prevProps.data.stars !== nextProps.data.stars ||
        prevProps.data.connections !== nextProps.data.connections
      ) {
        return false;
      }
    } else {
      return false;
    }
  }

  // Check if transform data changed
  if (prevProps.transformData !== nextProps.transformData) {
    if (prevProps.transformData && nextProps.transformData) {
      if (
        prevProps.transformData.x !== nextProps.transformData.x ||
        prevProps.transformData.y !== nextProps.transformData.y ||
        prevProps.transformData.scaleX !== nextProps.transformData.scaleX ||
        prevProps.transformData.scaleY !== nextProps.transformData.scaleY ||
        prevProps.transformData.rotation !== nextProps.transformData.rotation
      ) {
        return false;
      }
    } else {
      return false;
    }
  }

  // Check other props
  return (
    prevProps.windowCenter.x === nextProps.windowCenter.x &&
    prevProps.windowCenter.y === nextProps.windowCenter.y &&
    prevProps.focusedConstellation?.name === nextProps.focusedConstellation?.name &&
    prevProps.showBoundingBox === nextProps.showBoundingBox &&
    prevProps.showStarBoundingBox === nextProps.showStarBoundingBox &&
    prevProps.onHoverEnterCallback === nextProps.onHoverEnterCallback &&
    prevProps.onHoverLeaveCallback === nextProps.onHoverLeaveCallback &&
    prevProps.onClickCallback === nextProps.onClickCallback
  );
}
