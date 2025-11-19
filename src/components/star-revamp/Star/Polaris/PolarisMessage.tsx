import { motion } from "motion/react";
import { FONT_FAMILY } from "@/app/theme";
import ReactMarkdown from "react-markdown";

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
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
