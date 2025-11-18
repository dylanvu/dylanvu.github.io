import { FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
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
        h1: ({ children }) => (
          <h1
            style={{
              textAlign: "center",
            }}
            className={FONT_FAMILY.className}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={FONT_FAMILY.className}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className={FONT_FAMILY.className}>{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className={FONT_FAMILY.className}>{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className={FONT_FAMILY.className}>{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className={FONT_FAMILY.className}>{children}</h6>
        ),

        p: ({ children }) => (
          <p className={FONT_FAMILY.className}>{children}</p>
        ),

        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={FONT_FAMILY.className}
            style={{
              color: SPACE_TEXT_COLOR,
            }}
          >
            {children}
          </a>
        ),

        ul: ({ children }) => (
          <ul className={FONT_FAMILY.className}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className={FONT_FAMILY.className}>{children}</ol>
        ),
        li: ({ children }) => (
          <li className={FONT_FAMILY.className}>{children}</li>
        ),

        strong: ({ children }) => (
          <strong className={FONT_FAMILY.className}>{children}</strong>
        ),
        em: ({ children }) => (
          <em className={FONT_FAMILY.className}>{children}</em>
        ),

        code: ({ children }) => <code> {children} </code>,

        pre: ({ children }) => (
          <pre className={FONT_FAMILY.className}>{children}</pre>
        ),

        img: ({ src, alt }) => (
          <img src={src} alt={alt} style={{ maxWidth: "100%" }} />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
