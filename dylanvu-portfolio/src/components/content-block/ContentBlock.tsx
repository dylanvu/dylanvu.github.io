import Paragraph from "./Paragraph";

export default function ContentBlock({ title, paragraphs }: { title: string, paragraphs: string[] }) {
    return (
        <div>
            {/* header/title */}
            <div>
                {title}
            </div>
            {paragraphs.map((paragraph) => <Paragraph text={paragraph} />)}
        </div>
    )
}