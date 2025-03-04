import ContentBlockTitle from "./content-block/ContentBlockTitle";
import Paragraph from "./content-block/Paragraph";
import "../styles/contribution.css";

export default function NextUp() {
  const nextSteps = [
    "Go through my current learning bucket list: WebRTC and Go Lang",
    "Finish a major robotics project",
    "Think of another long-term project",
    "Get into a Masters Program",
    "Not get fired from my job :P",
  ];

  return (
    <div className="contribution">
      <ContentBlockTitle title={"What's Next"} />
      {nextSteps.map((step, index) => (
        <Paragraph text={"* " + step} key={"next" + index} />
      ))}
    </div>
  );
}
