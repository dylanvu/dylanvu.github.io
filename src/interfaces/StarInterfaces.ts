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

export type StarData = {
  label: string;
  origin: string;
  about: string;
};
