import Paragraph from "./Paragraph";
import "@/styles/content-block/content-block.css";
import ContentBlockTitle from "./ContentBlockTitle";

export default function ContentBlock({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  return (
    <div className="content-block">
      {/* header/title */}
      <ContentBlockTitle title={title} />
      {paragraphs.map((paragraph, index) => (
        <Paragraph key={"_" + title + index.toString()} text={paragraph} />
      ))}
    </div>
  );
}
