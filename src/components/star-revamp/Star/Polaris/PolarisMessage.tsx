import { motion } from "motion/react";
import { FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { useState } from "react";

export default function PolarisMessage({ message }: { message: string }) {
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
            fontSize: "0.7rem",
            opacity: 0.6,
            marginBottom: "0.2rem",
            marginLeft: "0.8rem",
          }}
        >
          Polaris
        </span>
        <div
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
            components={{
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
              code: ({ children }) => <code>{children}</code>,
              pre: ({ children }) => (
                <pre className={FONT_FAMILY.className}>{children}</pre>
              ),
              img: ({ src, alt }) => <StreamingImage src={src} alt={alt} />,
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}

// Component to handle images during streaming with loading and error states
function StreamingImage({ src, alt }: { src?: string | Blob; alt?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Don't render anything if src is not provided or is a Blob (partial markdown still streaming)
  if (!src || typeof src !== 'string') {
    return null;
  }

  return (
    <span style={{ display: "block", margin: "0.5rem 0" }}>
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
            fontSize: "0.85rem",
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
            fontSize: "0.85rem",
            opacity: 0.8,
          }}
        >
          Failed to load image: {alt || src}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
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
