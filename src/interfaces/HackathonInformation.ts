// list of hackathons I've been to, and their information
export default interface HackathonInformation {
  name: string; // hackathon name
  place: string; // name of the hackathon location
  city: string; // name of the hackathon location
  state: string; // name of the hackathon location
  organizer: string; // name of the club or company organizer
  type: "Online" | "In-Person";
  role: "Mentor" | "Participant";
  awards: string[]; // list of awards, if any
  date: Date;
  latitude: number; // latitude and longitude of the hackathon host location
  longitude: number;
  github?: string[]; // github link
  projectName?: string; // name of the project
  devpost?: string; // devpost link if applicable
}
