import { motion } from "motion/react";
import { FONT_FAMILY, GLASS, RADIUS, DURATION, OPACITY, ERROR_COLOR, hexToRgba, TEXT_SIZE, SPACING } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { useState, useMemo } from "react";
import { ChatMessage } from "@/hooks/Polaris/tools/talk";
import { MarkdownLink } from "../../MarkdownLink";
import { useMobile } from "@/hooks/useMobile";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";

// Type definitions for markdown components
interface MarkdownComponentProps {
  children?: React.ReactNode;
}

interface AnchorProps extends MarkdownComponentProps {
  href?: string;
}

interface ImageProps {
  src?: string | Blob;
  alt?: string;
}

export default function PolarisMessage({ message }: { message: string | ChatMessage }) {
  const { mobileFontScaleFactor } = useMobile();
  const { polarisDisplayState } = usePolarisContext();
  
  // Handle both string and ChatMessage object
  const messageText = typeof message === "string" ? message : message.message;
  const isPlaceholder = typeof message === "object" && message.isPlaceholder;
  
  const showGlass = polarisDisplayState === "active";
  
  const markdownComponents = useMemo(() => ({
    p: ({ children }: MarkdownComponentProps) => (
      <p className={FONT_FAMILY.className}>{children}</p>
    ),
    a: ({ children, href }: AnchorProps) => (
      <MarkdownLink href={href}>{children}</MarkdownLink>
    ),
    ul: ({ children }: MarkdownComponentProps) => (
      <ul className={FONT_FAMILY.className}>{children}</ul>
    ),
    ol: ({ children }: MarkdownComponentProps) => (
      <ol className={FONT_FAMILY.className}>{children}</ol>
    ),
    li: ({ children }: MarkdownComponentProps) => (
      <li className={FONT_FAMILY.className}>{children}</li>
    ),
    strong: ({ children }: MarkdownComponentProps) => (
      <strong className={FONT_FAMILY.className}>{children}</strong>
    ),
    em: ({ children }: MarkdownComponentProps) => (
      <em className={FONT_FAMILY.className}>{children}</em>
    ),
    code: ({ children }: MarkdownComponentProps) => <code>{children}</code>,
    pre: ({ children }: MarkdownComponentProps) => (
      <pre className={FONT_FAMILY.className}>{children}</pre>
    ),
    img: ({ src, alt }: ImageProps) => <StreamingImage src={src} alt={alt} mobileFontScaleFactor={mobileFontScaleFactor} showGlass={showGlass} />,
  }), [mobileFontScaleFactor, showGlass]);
  
  return (
    <motion.div
      // FIX: Switched to vertical only to match user bubble
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: DURATION.slow, ease: "easeOut" }}
      style={{
        display: "flex",
        gap: "12px",
        alignSelf: "flex-start",
        maxWidth: "30%",
        transformOrigin: "bottom left",
        pointerEvents: polarisDisplayState === "active" ? "auto" : "none",
      }}
      className={FONT_FAMILY.className}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: TEXT_SIZE.xs,
            opacity: 0.6,
            marginBottom: SPACING.xs,
            marginLeft: SPACING.md,
          }}
        >
          Polaris
        </span>
        <motion.div
          animate={
            isPlaceholder
              ? {
                  opacity: [0.4, 0.7, 0.4],
                  backdropFilter: showGlass ? "blur(8px)" : "blur(0px)",
                }
              : {
                  opacity: 1,
                  backdropFilter: showGlass ? "blur(8px)" : "blur(0px)",
                }
          }
          transition={
            isPlaceholder
              ? {
                  opacity: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  backdropFilter: {
                    duration: DURATION.normal,
                    delay: DURATION.normal,
                    ease: "easeOut",
                  },
                }
              : {
                  opacity: {
                    duration: DURATION.slow,
                  },
                  backdropFilter: {
                    duration: DURATION.normal,
                    delay: DURATION.normal, // Blur starts after opacity finishes
                    ease: "easeOut",
                  },
                }
          }
          style={{
            background: GLASS.light.background,
            border: GLASS.light.border,
            padding: `${SPACING.md} ${SPACING.lg}`,
            borderRadius: `${RADIUS.sm} ${RADIUS.lg} ${RADIUS.lg} ${RADIUS.lg}`,
            lineHeight: "1.5",
            wordWrap: "break-word",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[gfm]}
            components={markdownComponents}
          >
            {messageText}
          </ReactMarkdown>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Component to handle images during streaming with loading and error states
function StreamingImage({ src, alt, mobileFontScaleFactor, showGlass }: { src?: string | Blob; alt?: string; mobileFontScaleFactor: number; showGlass: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Don't render anything if src is not provided
  if (!src || typeof src !== 'string') {
    return null;
  }

  return (
    <span key={src} style={{ display: "block", margin: "0.5rem 0" }}>
      {isLoading && !hasError && (
        <span
          style={{
            display: "block",
            width: "100%",
            height: "200px",
            background: GLASS.light.background,
            backdropFilter: showGlass ? "blur(8px)" : "none",
            borderRadius: RADIUS.md,
            textAlign: "center",
            lineHeight: "200px",
            fontSize: `${0.85 * mobileFontScaleFactor}rem`,
            opacity: 0.6,
            transition: `backdrop-filter ${DURATION.normal}s ease`,
          }}
        >
          Loading image...
        </span>
      )}
      {hasError ? (
        <span
          style={{
            display: "block",
            padding: "1rem",
            background: hexToRgba(ERROR_COLOR, OPACITY.normal),
            border: `1px solid ${hexToRgba(ERROR_COLOR, OPACITY.bolder)}`,
            borderRadius: RADIUS.md,
            fontSize: `${0.85 * mobileFontScaleFactor}rem`,
            opacity: 0.8,
          }}
        >
          Failed to load image: {alt || src}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => {
            if (isLoading) {
              setIsLoading(false);
            }
          }}
          onLoadStart={() => {
            console.log("loading image")
            setIsLoading(true);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          style={{
            maxWidth: "100%",
            borderRadius: RADIUS.md,
            display: isLoading ? "none" : "block",
          }}
        />
      )}
    </span>
  );
}
