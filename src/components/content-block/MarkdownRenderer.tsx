import ReactMarkdown from "react-markdown";
import "@/styles/content-block/paragraph.css";
import ContentBlockTitle from "./ContentBlockTitle";
import gfm from "remark-gfm";

export default function MarkdownRenderer({ text }: { text: string }) {
  return (
    <div className="markdown-container">
      <ReactMarkdown
        remarkPlugins={[gfm]}
        components={{
          h1: ({ children }) => <ContentBlockTitle title={String(children)} />,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h4>{children}</h4>,
          h5: ({ children }) => <h5>{children}</h5>,
          h6: ({ children }) => <h6>{children}</h6>,

          p: ({ children }) => <p className="paragraph-text">{children}</p>,

          a: ({ children, href }) => (
            <a className="link" href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),

          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => (
            <li className="paragraph-bullet">{children}</li>
          ),

          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,

          code: ({ children }) => <code> {children} </code>,

          pre: ({ children }) => <pre>{children}</pre>,

          img: ({ src, alt }) => (
            <span className="paragraph-image-container">
              <img src={src} alt={alt} />
            </span>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
