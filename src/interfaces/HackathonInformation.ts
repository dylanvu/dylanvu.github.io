// list of hackathons I've been to, and their information

export type HackathonType = "Online" | "In-Person";
export type HackathonRole = "Mentor" | "Participant";

// create typeguards for the types
export function isHackathonType(value: unknown): value is HackathonType {
  return value === "Online" || value === "In-Person";
}

export function isHackathonRole(value: unknown): value is HackathonRole {
  return value === "Mentor" || value === "Participant";
}

export default interface HackathonInformation {
  name: string; // hackathon name
  place: string; // name of the hackathon location
  city: string; // name of the hackathon location
  state: string; // name of the hackathon location
  organizer: string; // name of the club or company organizer
  type: HackathonType;
  role: HackathonRole;
  awards: string[]; // list of awards, if any
  date: Date;
  latitude: number; // latitude and longitude of the hackathon host location
  longitude: number;
  github?: string[]; // github link
  projectName?: string; // name of the project
  devpost?: string; // devpost link if applicable
  duration: number; // duration of the hackathon in hours
}
