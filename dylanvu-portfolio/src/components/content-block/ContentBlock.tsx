import Paragraph from "./Paragraph";
import "../../styles/content-block/content-block.css"

export default function ContentBlock({ title, paragraphs }: { title: string, paragraphs: string[] }) {
    return (
        <div>
            {/* header/title */}
            <div className="content-block-title">
                {title}
            </div>
            {paragraphs.map((paragraph, index) => <Paragraph key={"_" + title + index.toString()} text={paragraph} />)}
        </div>
    )
}