// Enum mapping star classifications to their visual sizes
export enum StarClassificationSize {
  Subdwarf = 1,
  Dwarf = 1.5,
  Star = 2.5,
  Giant = 3,
  Supergiant = 4,
}

export type Star = {
  x: number;
  y: number;
  data?: StarData;
};

export type ConstellationData = {
  name: string; // the name of the constellation
  origin: string; // the origin and meaning of the constellation name
  about: string; // the flavor text explaining the constellation
  intro: string; // the intro text for the constellation
  slug: string; // the internal link, like "constellation/<slug>"
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

export type ParallaxFocusData = {
  unfocusedX: number; // constellation center before focusing
  unfocusedY: number; // constellation center before focusing
  focusScale: number; // zoom level of the focused constellation
  rotation: number; // rotation of the focused constellation
  constellation: ConstellationData;
};

export type StarData = {
  label?: string; // name of the star
  origin?: string; // the origin
  about?: string;
  classification: "Star" | "Supergiant" | "Giant" | "Dwarf" | "Subdwarf"; // this takes the place of an intro
  color?:
    | "Blue"
    | "Blue-White"
    | "White"
    | "Yellow-White"
    | "Yellow"
    | "Orange"
    | "Red";
  slug?: string
};
