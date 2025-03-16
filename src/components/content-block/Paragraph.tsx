import "../../styles/content-block/paragraph.css";

const validImageExtension = [
  ".jpg",
  ".png",
  ".jpeg",
  ".svg",
  ".webp",
  ".gif",
] as const;
export type ImageExtension = (typeof validImageExtension)[number];

export default function Paragraph({ text }: { text: string }) {
  function formatText(text: string) {
    // text can either be a paragraph, a link to an image, an external link, or a list/bulletpoint
    if (text.substring(0, 2) === "* ") {
      return (
        // list element
        <li className="paragraph-bullet">{text.substring(2)}</li>
      );
      // TOOD: handle image and external link
    } else if (isImage(text)) {
      const imageAlt = text.split("/").at(-1);
      return (
        <div className="paragraph-image-container">
          <img src={text} alt={imageAlt ?? text} />
        </div>
      );
    } else if (isLink(text)) {
      return (
        <a href={text} className="link" target="_blank" rel="noreferrer">
          {text}
        </a>
      );
    } else {
      return (
        // just render as text
        <div className="paragraph-text">{text}</div>
      );
    }
  }

  return <div className="paragraph">{formatText(text)}</div>;
}

function isImage(text: string) {
  // The photo refereced in the txt file is a path that's uploaded in the public folder
  // Add more file extensions if needed
  for (let i = 0; i < validImageExtension.length; i++) {
    if (text.includes(validImageExtension[i])) {
      return true;
    }
  }
  return false;
}

function isLink(text: string) {
  if (
    text.includes("github.com/") ||
    text.includes("devpost.com/software") ||
    text.includes("https://")
  ) {
    return true;
  } else {
    return false;
  }
}
