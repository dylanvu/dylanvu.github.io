import { motion } from "motion/react";
import { FONT_FAMILY } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { useState, useRef, useEffect, useMemo } from "react";
import { ChatMessage } from "@/hooks/Polaris/tools/talk";
import { MarkdownLink } from "../../MarkdownLink";
import { useMobile } from "@/hooks/useMobile";

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
  
  // Handle both string and ChatMessage object
  const messageText = typeof message === "string" ? message : message.message;
  const isPlaceholder = typeof message === "object" && message.isPlaceholder;
  
  // Memoize components to prevent recreating them on every render
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
    img: ({ src, alt }: ImageProps) => <StreamingImage src={src} alt={alt} mobileFontScaleFactor={mobileFontScaleFactor} />,
  }), [mobileFontScaleFactor]);
  
  return (
    <motion.div
      // FIX: Switched to vertical only to match user bubble
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        display: "flex",
        gap: "12px",
        alignSelf: "flex-start",
        maxWidth: "30%",
        transformOrigin: "bottom left",
        pointerEvents: "auto",
      }}
      className={FONT_FAMILY.className}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: `${0.7 * mobileFontScaleFactor}rem`,
            opacity: 0.6,
            marginBottom: "0.2rem",
            marginLeft: "0.8rem",
          }}
        >
          Polaris
        </span>
        <motion.div
          animate={
            isPlaceholder
              ? {
                  opacity: [0.4, 0.7, 0.4],
                }
              : {
                  opacity: 1,
                }
          }
          transition={
            isPlaceholder
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : {
                  duration: 0,
                }
          }
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0.8rem 1.2rem",
            borderRadius: "2px 18px 18px 18px",
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
function StreamingImage({ src, alt, mobileFontScaleFactor }: { src?: string | Blob; alt?: string; mobileFontScaleFactor: number }) {
  // Use refs to persist state across re-renders (prevents flickering on hover)
  const hasLoadedRef = useRef(false);
  const hasErrorRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Initialize state from refs on mount
  useEffect(() => {
    if (hasLoadedRef.current) {
      setIsLoading(false);
    }
    if (hasErrorRef.current) {
      setHasError(true);
    }
  }, []);

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
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            textAlign: "center",
            lineHeight: "200px",
            fontSize: `${0.85 * mobileFontScaleFactor}rem`,
            opacity: 0.6,
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
            background: "rgba(255, 100, 100, 0.1)",
            border: "1px solid rgba(255, 100, 100, 0.3)",
            borderRadius: "8px",
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
            hasLoadedRef.current = true;
            setIsLoading(false);
          }}
          onError={() => {
            hasErrorRef.current = true;
            setIsLoading(false);
            setHasError(true);
          }}
          style={{
            maxWidth: "100%",
            borderRadius: "8px",
            display: isLoading ? "none" : "block",
          }}
        />
      )}
    </span>
  );
}
