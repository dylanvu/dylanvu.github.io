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

/**
 * Function to convert a HackathonInformation object to a string.
 * Disclaimer: made by AI lol
 * @param hackathon hackathon to convert to a string
 * @returns string representation of the hackathon
 */
export function convertHackathonToString(
  hackathon: HackathonInformation
): string {
  const lines = [];

  // --- Core Information ---
  // Start with the most important identifiers.
  lines.push(`Hackathon Name: ${hackathon.name}`);
  if (hackathon.projectName) {
    lines.push(`Project: ${hackathon.projectName}`);
  }
  lines.push(`Role: ${hackathon.role}`);
  lines.push(`Type: ${hackathon.type}`);

  // --- Details ---
  // Group related information.
  lines.push(
    `Date: ${hackathon.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
  );
  lines.push(`Duration: ${hackathon.duration} hours`);
  lines.push(
    `Location: ${hackathon.place}, ${hackathon.city}, ${hackathon.state}`
  );
  lines.push(`Organizer: ${hackathon.organizer}`);

  // --- Conditional Information (Links & Awards) ---
  // Only add these sections if the data exists. This avoids confusing empty fields.
  if (hackathon.awards && hackathon.awards.length > 0) {
    lines.push(`Awards: ${hackathon.awards.join(", ")}`);
  }

  if (hackathon.devpost) {
    lines.push(`Devpost Link: ${hackathon.devpost}`);
  }

  if (hackathon.github && hackathon.github.length > 0) {
    // Format multiple GitHub links as a clean list.
    const githubList = hackathon.github.map((link) => `- ${link}`).join("\n");
    lines.push(`GitHub Repositories:\n${githubList}`);
  }

  // Join all the lines with a newline character.
  return lines.join("\n");
}
