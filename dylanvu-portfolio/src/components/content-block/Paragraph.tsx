
import "../../styles/content-block/paragraph.css";
export default function Paragraph({ text }: { text: string }) {

    function formatText(text: string) {
        // text can either be a paragraph, a link to an image, an external link, or a list/bulletpoint
        if (text.substring(0, 2) === "* ") {
            return (
                // list element
                <li className="paragraph-bullet">
                    {text.substring(2)}
                </li>
            )
            // TOOD: handle image and external link
        } else {
            return (
                // just render as text
                <div className="paragraph-text">
                    {text}
                </div>
            )
        }
    }

    return (
        <div className="paragraph">
            {formatText(text)}
        </div>
    )

}