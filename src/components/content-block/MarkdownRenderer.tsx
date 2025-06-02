import ReactMarkdown from "react-markdown";
import "../../styles/content-block/paragraph.css";
import ContentBlockTitle from "./ContentBlockTitle";
import gfm from "remark-gfm";

export default function MarkdownRenderer({ text }: { text: string }) {
  return (
    <div className="markdown-container">
      <ReactMarkdown
        remarkPlugins={[gfm]}
        components={{
          h1: ({ children }) => <ContentBlockTitle title={String(children)} />,
          h2: ({ node, ...props }) => <h2 {...props} />,
          h3: ({ node, ...props }) => <h3 {...props} />,
          h4: ({ node, ...props }) => <h4 {...props} />,
          h5: ({ node, ...props }) => <h5 {...props} />,
          h6: ({ node, ...props }) => <h6 {...props} />,
          p: ({ node, ...props }) => (
            <div className="paragraph-text" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="link" target="_blank" rel="noreferrer" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="paragraph-bullet" {...props} />
          ),
          ul: ({ node, ...props }) => <ul {...props} />,
          ol: ({ node, ...props }) => <ol {...props} />,
          strong: ({ node, ...props }) => <strong {...props} />,
          em: ({ node, ...props }) => <em {...props} />,
          code: ({ node, ...props }) => <code {...props} />,
          pre: ({ node, ...props }) => <pre {...props} />,
          img: ({ node, ...props }) => (
            <div className="paragraph-image-container">
              <img src={props.src} {...props} />
            </div>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
