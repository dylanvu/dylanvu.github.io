import ContentBlock from "@/components/content-block/ContentBlock";
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import bio from "../../../../public/about/bio.json";
import { HackathonList } from "@/constants/Hackathons";

import "../../../styles/content-block/paragraph.css";
import "../../../styles/content-block/content-block.css";

export default function About() {
  // parse the text, separate by newline, and then create many Paragraph blocks
  const aboutParagraphs: string[] = bio.data.split("\n");
  // process the hackathons

  // calculate some statistics

  // hackathons participated (mentored, participated)
  const competedHackathons = HackathonList.filter(
    (hackathon) => !hackathon.role.toLowerCase().includes("mentor")
  );

  // hackathons won
  const filteredHackathonWinners = competedHackathons.filter(
    (hackathon) => hackathon.awards.length > 0
  );

  // hackathons mentored
  const filteredHackathonMentorship = HackathonList.filter((hackathon) =>
    hackathon.role.toLowerCase().includes("mentor")
  );

  // hours mentored
  const hoursMentored = filteredHackathonMentorship.reduce(
    (total, hackathon) => total + hackathon.duration,
    0
  );

  // hours competed
  const hoursCompeted = competedHackathons.reduce(
    (total, hackathon) => total + hackathon.duration,
    0
  );

  // total hours at hackathons
  const totalHours = hoursCompeted + hoursMentored;

  // format the hackathons into bullet points
  const hackathonList = HackathonList.map((hackathon) => {
    // hackathon name
    let hackathonParagraph = "* " + hackathon.name;
    // add mentor if mentored
    if (hackathon.role === "Mentor") {
      hackathonParagraph += " (Mentored)";
    }
    // append awards if won
    const awards = hackathon.awards;
    if (awards.length > 0) {
      // concatenate the awards
      hackathonParagraph = hackathonParagraph + " - ";
      for (const [index, award] of awards.entries()) {
        hackathonParagraph += `${award}`;
        if (index != awards.length - 1) {
          hackathonParagraph += ", ";
        }
      }
    }
    return hackathonParagraph;
  });

  return (
    <div>
      {/* bio */}
      <ContentBlock title="About" paragraphs={aboutParagraphs} />
      {/* view me in the context of... */}
      {/* <ContentBlockTitle title="I'm a..." /> */}
      {/* <SpecialityCarousel /> */}
      {/* hackathons */}
      <div className="content-block">
        <ContentBlockTitle title="Hackathon Statistics" />
        {/* we are not using ContentBlock here because I want to animate the numbers counting up */}
        <div>
          Participated: {hackathonList.length} hackathons, ~
          {totalHours.toLocaleString()} hours
        </div>
        <div>
          Competed: {competedHackathons.length} hackathons, ~
          {hoursCompeted.toLocaleString()} hours,{" "}
          {filteredHackathonWinners.length} awards
        </div>
        <div>
          Mentored: {filteredHackathonMentorship.length} hackathons, ~
          {hoursMentored.toLocaleString()} hours
        </div>
      </div>
      <ContentBlock
        title="Hackathon List"
        paragraphs={hackathonList.reverse()}
      />
    </div>
  );
}
