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
  stars: Star[];
  connections?: [number, number][]; // ensure tuple type
  designX: number; // bigger number moves to the right
  designY: number; // bigger number moves down
  rotation?: number;
  scale?: number;
  totalDuration?: number;
};

export type TransformData = {
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
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
type StarDataWithFilePath = BaseStarData & {
  filePath: string;
  externalLink?: never;
};

/**
 * This star will open a new tab with the link
 */
type StarDataWithExternalLink = BaseStarData & {
  filePath?: never;
  externalLink: string;
};

/**
 * This star has nothing
 */
type StarDataWithoutLink = BaseStarData & {
  filePath?: never;
  externalLink?: never;
};

// The star data is a union of valid star data types
export type StarData =
  | StarDataWithFilePath
  | StarDataWithExternalLink
  | StarDataWithoutLink;
