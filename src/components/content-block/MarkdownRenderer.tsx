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
          h2: ({ ...props }) => <h2 {...props} />,
          h3: ({ ...props }) => <h3 {...props} />,
          h4: ({ ...props }) => <h4 {...props} />,
          h5: ({ ...props }) => <h5 {...props} />,
          h6: ({ ...props }) => <h6 {...props} />,
          p: ({ ...props }) => <div className="paragraph-text" {...props} />,
          a: ({ ...props }) => (
            <a className="link" target="_blank" rel="noreferrer" {...props} />
          ),
          li: ({ ...props }) => <li className="paragraph-bullet" {...props} />,
          ul: ({ ...props }) => <ul {...props} />,
          ol: ({ ...props }) => <ol {...props} />,
          strong: ({ ...props }) => <strong {...props} />,
          em: ({ ...props }) => <em {...props} />,
          code: ({ ...props }) => <code {...props} />,
          pre: ({ ...props }) => <pre {...props} />,
          img: ({ ...props }) => (
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
