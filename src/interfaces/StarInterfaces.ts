export type Star = {
  x: number;
  y: number;
  size?: number;
  data?: StarData;
};

export type ConstellationData = {
  name: string; // the name of the constellation
  origin: string; // the origin and meaning of the constellation name
  about: string; // the flavor text explaining the constellation
  intro: string; // the intro text for the constellation
  stars: Star[];
  connections?: [number, number][]; // ensure tuple type
  designX: number; // bigger number moves to the right
  designY: number; // bigger number moves down
  rotation?: number;
  scale?: number;
  totalDuration?: number;
  focusScale: number; // this gets multiplied by scale to get the Konva tween scale when focused
};

export type TransformData = {
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
};

export type FocusedConstellationPos = {
  x: number; // focused position (typically windowCenter)
  y: number; // focused position (typically windowCenter)
  unfocusedX: number; // constellation center before focusing
  unfocusedY: number; // constellation center before focusing
  constellation: ConstellationData;
};

type BaseStarData = {
  label: string;
  origin: string;
  about: string;
  intro: "Star" | "Supergiant" | "Giant" | "Dwarf";
  color?:
    | "Blue"
    | "Blue-White"
    | "White"
    | "Yellow-White"
    | "Yellow"
    | "Orange"
    | "Red";
};

/**
 * This star will render the markdown in the site
 */
type StarDataWithInternalLink = BaseStarData & {
  internalLink: string;
  externalLink?: never;
};

/**
 * This star will open a new tab with the link
 */
type StarDataWithExternalLink = BaseStarData & {
  internalLink?: never;
  externalLink: string;
};

/**
 * This star has nothing
 */
type StarDataWithoutLink = BaseStarData & {
  internalLink?: never;
  externalLink?: never;
};

// typeguard for star without link
export function isStarDataWithoutLink(
  data: StarData
): data is StarDataWithoutLink {
  return !data.internalLink && !data.externalLink;
}

// The star data is a union of valid star data types
export type StarData =
  | StarDataWithInternalLink
  | StarDataWithExternalLink
  | StarDataWithoutLink;
