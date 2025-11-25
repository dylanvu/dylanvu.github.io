import { FONT_FAMILY, GLASS, RADIUS, OPACITY, SPACING, TEXT_SIZE, DURATION } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { MarkdownLink } from "./MarkdownLink";
import { useState, useEffect } from "react";

export default function StarMarkdownRenderer({
  markdown,
}: {
  markdown: string;
}) {
  const [showGlass, setShowGlass] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlass(true);
    }, DURATION.normal * 1000); // Wait for StarPanel fade-in to complete
    return () => clearTimeout(timer);
  }, []);

  return (
    // this padding bottom is needed because the bottom thing is always cut off
    <div style={{ paddingBottom: "3rem" }}>
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
          <MarkdownLink href={href}>{children}</MarkdownLink>
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

        code: ({ children, className }) => {
          // Check if this is inline code (no className) or block code (has className from pre)
          const isInline = !className;
          
          if (isInline) {
            return (
              <code
                style={{
                  background: GLASS.medium.background,
                  backdropFilter: showGlass ? "blur(8px)" : "none",
                  padding: `${SPACING.xs} ${SPACING.sm}`,
                  borderRadius: RADIUS.sm,
                  fontSize: "0.9em",
                  transition: `backdrop-filter ${DURATION.normal}s ease`,
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
              background: GLASS.medium.background,
              border: GLASS.medium.border,
              backdropFilter: showGlass ? "blur(12px)" : "none",
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              overflowX: "auto",
              marginTop: SPACING.md,
              marginBottom: SPACING.md,
              transition: `backdrop-filter ${DURATION.normal}s ease`,
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
              display: "block",
              maxWidth: "70%",
              maxHeight: "50vh",
              borderRadius: RADIUS.md,
              border: GLASS.light.border,
              margin: "auto",
              marginTop: SPACING.sm,
              marginBottom: SPACING.sm,
            }}
          />
        ),

        blockquote: ({ children }) => (
          <blockquote
            className={FONT_FAMILY.className}
            style={{
              background: GLASS.subtle.background,
              backdropFilter: showGlass ? "blur(4px)" : "none",
              borderLeft: `4px solid rgba(255, 255, 255, ${OPACITY.bolder})`,
              padding: `${SPACING.sm} ${SPACING.md}`,
              margin: `${SPACING.md} 0`,
              fontStyle: "italic",
              transition: `backdrop-filter ${DURATION.normal}s ease`,
            }}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
    </div>
  );
}
