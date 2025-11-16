export type ConstellationData = {
  name: string; // the name of the constellation
  origin: string; // the origin and meaning of the constellation name
  about: string; // the flavor text explaining the constellation
  stars: { x: number; y: number; size?: number }[];
  connections?: [number, number][]; // ensure tuple type
  designX: number;
  designY: number;
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
