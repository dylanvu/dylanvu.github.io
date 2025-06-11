import ContentBlockTitle from "./content-block/ContentBlockTitle";
import Paragraph from "./content-block/Paragraph";
import "@/styles/contribution.css";
import NextSteps from "@/constants/NextSteps";

export default function NextUp() {
  return (
    <div className="contribution">
      <ContentBlockTitle title={"What's Next"} />
      {NextSteps.map((step, index) => (
        <Paragraph text={"* " + step} key={"next" + index} />
      ))}
    </div>
  );
}
