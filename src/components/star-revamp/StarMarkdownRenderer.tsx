import { FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import Link from "next/link";

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

        a: ({ children, href }) => {
          // Handle missing href
          if (!href) {
            return <span className={FONT_FAMILY.className}>{children}</span>;
          }
          
          // Check if the link is internal (starts with /) or external
          const isInternal = href.startsWith('/');
          
          if (isInternal) {
            // Use Next.js Link for internal navigation
            return (
              <Link
                href={href}
                className={FONT_FAMILY.className}
                style={{
                  color: SPACE_TEXT_COLOR,
                }}
              >
                {children}
              </Link>
            );
          }
          
          // External links: open in new tab
          return (
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
          );
        },

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

        code: ({ children, className }) => {
          // Check if this is inline code (no className) or block code (has className from pre)
          const isInline = !className;
          
          if (isInline) {
            return (
              <code
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "0.2rem 0.4rem",
                  borderRadius: "4px",
                  fontSize: "0.9em",
                }}
              >
                {children}
              </code>
            );
          }
          
          return <code className={className}>{children}</code>;
        },

        pre: ({ children }) => (
          <pre
            className={FONT_FAMILY.className}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "12px",
              padding: "1rem",
              overflowX: "auto",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            {children}
          </pre>
        ),

        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "70%",
              maxHeight: "50vh",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              margin: "auto",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            }}
          />
        ),

        blockquote: ({ children }) => (
          <blockquote
            className={FONT_FAMILY.className}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderLeft: "4px solid rgba(255, 255, 255, 0.3)",
              padding: "0.5rem 1rem",
              margin: "1rem 0",
              fontStyle: "italic",
            }}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
