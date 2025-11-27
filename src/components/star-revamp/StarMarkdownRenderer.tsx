import { FONT_FAMILY, GLASS, RADIUS, OPACITY, SPACING, DURATION } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { MarkdownLink } from "./MarkdownLink";
import DrawLetters from "./MainStage/DrawLetters";
import { getStarDataBySlug } from "./Star/ConstellationList";

export default function StarMarkdownRenderer({
  markdown,
  slug
}: {
  markdown: string;
  slug: string;
}) {
  // Glass effect is always enabled to prevent flash from state transitions
  const showGlass = true;
  const starData = getStarDataBySlug(slug)

  return (
    // this padding bottom is needed because the bottom thing is always cut off
    <div style={{ paddingBottom: "3rem" }}>
      <ReactMarkdown
        remarkPlugins={[gfm]}
      components={{
        h1: ({ children }) => (
          <h1
          style={{
            margin: "auto",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
          className={FONT_FAMILY.className}
          >
            <div>
              {starData?.classification}
            </div>
            <DrawLetters text={children?.toString()}/>
            <div>
              {starData?.origin}
            </div>
            <div>
              {starData?.about}
            </div>
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
