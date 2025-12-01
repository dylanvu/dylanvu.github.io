import { FONT_FAMILY, GLASS, RADIUS, OPACITY, SPACING, DURATION, TEXT_SIZE } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import gfm from "remark-gfm";
import { MarkdownLink } from "./MarkdownLink";
import DrawLetters from "./MainStage/DrawLetters";
import { getStarDataBySlug } from "./Star/ConstellationList";
import { useMemo } from "react";

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

  // Memoize the components object to prevent unnecessary re-renders
  // This prevents DrawLetters from re-animating when parent components re-render
  const markdownComponents = useMemo<Components>(() => ({
          h1: ({ children }: { children?: React.ReactNode }) => (
            <h1
            style={{
              margin: "auto",
              display: "flex",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.8rem"
            }}
            className={FONT_FAMILY.className}
            >
              <div style={{ fontSize: TEXT_SIZE.xl }}>
                {starData?.classification}
              </div>
              <div style={{ marginBottom: "-1.2rem", marginTop: "-1.2rem" }}>
                <DrawLetters text={children?.toString()}/>
              </div>
              <div style={{ fontSize: TEXT_SIZE.xl }}>
                {starData?.origin}
              </div>
              <div style={{ fontSize: TEXT_SIZE.xl }}>
                {starData?.about}
              </div>
            </h1>
          ),
          h2: ({ children }: { children?: React.ReactNode }) => (
            <h2 className={FONT_FAMILY.className}>{children}</h2>
          ),
          h3: ({ children }: { children?: React.ReactNode }) => (
            <h3 className={FONT_FAMILY.className}>{children}</h3>
          ),
          h4: ({ children }: { children?: React.ReactNode }) => (
            <h4 className={FONT_FAMILY.className}>{children}</h4>
          ),
          h5: ({ children }: { children?: React.ReactNode }) => (
            <h5 className={FONT_FAMILY.className}>{children}</h5>
          ),
          h6: ({ children }: { children?: React.ReactNode }) => (
            <h6 className={FONT_FAMILY.className}>{children}</h6>
          ),

          p: ({ children }: { children?: React.ReactNode }) => (
            <p className={FONT_FAMILY.className}>{children}</p>
          ),

          a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
            <MarkdownLink href={href}>{children}</MarkdownLink>
          ),

          ul: ({ children }: { children?: React.ReactNode }) => (
            <ul className={FONT_FAMILY.className}>{children}</ul>
          ),
          ol: ({ children }: { children?: React.ReactNode }) => (
            <ol className={FONT_FAMILY.className}>{children}</ol>
          ),
          li: ({ children }: { children?: React.ReactNode }) => (
            <li className={FONT_FAMILY.className}>{children}</li>
          ),

          strong: ({ children }: { children?: React.ReactNode }) => (
            <strong className={FONT_FAMILY.className}>{children}</strong>
          ),
          em: ({ children }: { children?: React.ReactNode }) => (
            <em className={FONT_FAMILY.className}>{children}</em>
          ),

          code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
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

          pre: ({ children }: { children?: React.ReactNode }) => (
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

          img: ({ src, alt }: { src?: string | Blob; alt?: string }) => (
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

          blockquote: ({ children }: { children?: React.ReactNode }) => (
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
        }), [starData, showGlass]);

  return (
    // this padding bottom is needed because the bottom thing is always cut off
    <div style={{ paddingBottom: "3rem", pointerEvents: "auto" }}>
      <ReactMarkdown
        remarkPlugins={[gfm]}
        components={markdownComponents}
    >
      {markdown}
      </ReactMarkdown>
      {slug === "resume" && 
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "2rem" }}>
        <embed src="/Dylan_Vu_Resume.pdf" type="application/pdf" width="95%" style={{ height: '95vh' }}/>
      </div>
    }
    </div>
  );
}
