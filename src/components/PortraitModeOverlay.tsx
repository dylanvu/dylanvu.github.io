"use client";

import { useMobile } from "@/hooks/useMobile";
import { SPACE_BACKGROUND_COLOR, SPACE_TEXT_COLOR } from "@/app/theme";
import { motion } from "motion/react";

export default function PortraitModeOverlay() {
  const { isMobilePortrait } = useMobile();

  if (!isMobilePortrait) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: SPACE_BACKGROUND_COLOR,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: SPACE_TEXT_COLOR,
          maxWidth: "300px",
        }}
      >
        <motion.div
          style={{
            marginBottom: "2rem",
          }}
          animate={{
            rotate: [0, -90, -90, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke={SPACE_TEXT_COLOR}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        </motion.div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1rem",
            lineHeight: "1.4",
          }}
        >
          Rotate your device to landscape
        </h2>
        <p
          style={{
            fontSize: "1rem",
            opacity: 0.8,
            lineHeight: "1.5",
          }}
        >
          This portfolio is best viewed in landscape mode
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            opacity: 0.6,
            marginTop: "0.5rem",
            fontStyle: "italic",
          }}
        >
          (desktop recommended for optimal experience)
        </p>
      </div>
    </div>
  );
}
