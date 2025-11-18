import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

export default function StarMarkdownRenderer({
  markdown,
}: {
  markdown: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      components={{
        h1: ({ children }) => <h1>{children}</h1>,
        h2: ({ children }) => <h2>{children}</h2>,
        h3: ({ children }) => <h3>{children}</h3>,
        h4: ({ children }) => <h4>{children}</h4>,
        h5: ({ children }) => <h5>{children}</h5>,
        h6: ({ children }) => <h6>{children}</h6>,

        p: ({ children }) => <p>{children}</p>,

        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),

        ul: ({ children }) => <ul>{children}</ul>,
        ol: ({ children }) => <ol>{children}</ol>,
        li: ({ children }) => <li>{children}</li>,

        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,

        code: ({ children }) => <code> {children} </code>,

        pre: ({ children }) => <pre>{children}</pre>,

        img: ({ src, alt }) => <img src={src} alt={alt} />,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
