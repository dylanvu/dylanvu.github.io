"use client";
import Link from "next/link";
import { FONT_FAMILY, SPACE_TEXT_COLOR, ACCENT_COLOR, DURATION, FOCUS_RING, OPACITY } from "@/app/theme";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { STAR_BASE_URL } from "@/constants/Routes";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useState } from "react";

/**
 * Shared markdown link component that handles internal vs external links
 * - Internal star links use navigateToStar to focus the star directly
 * - Other internal links use Next.js Link for client-side navigation
 * - PDF files always open in new tabs
 * - External links open in new tabs
 */
export function MarkdownLink({ children, href }: { children: React.ReactNode; href?: string }) {
  const { navigateToStar } = useFocusContext();
  const { setPolarisDisplayState } = usePolarisContext();
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle missing href
  if (!href) {
    return <span className={FONT_FAMILY.className}>{children}</span>;
  }
  
  // Check if it's a PDF file - always open in new tab
  const isPdf = href.toLowerCase().endsWith('.pdf');
  
  // Check if it's a star link (starts with STAR_BASE_URL)
  const isStarLink = href.startsWith(STAR_BASE_URL + '/');

  // Shared link styles with hover states
  const linkStyle: React.CSSProperties = {
    color: isHovered ? ACCENT_COLOR : SPACE_TEXT_COLOR,
    textDecorationLine: "underline",
    textDecorationColor: isHovered ? ACCENT_COLOR : `rgba(255, 255, 255, ${OPACITY.semitransparent})`,
    textDecorationThickness: "1px",
    textUnderlineOffset: "2px",
    transition: `all ${DURATION.fast}s ease`,
    cursor: "pointer",
  };

  const focusStyle: React.CSSProperties = {
    outline: "none",
  };
  
  if (isStarLink) {
    // Extract slug from the URL
    const slug = href.replace(STAR_BASE_URL + '/', '');
    
    const handleClick = () => {
      // Call navigateToStar immediately to focus the star
      navigateToStar(slug);
      // suppress polaris
      setPolarisDisplayState("suppressed");
    };
    
    // Use Next.js Link for proper URL navigation + immediate focus
    return (
      <Link
        href={href}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={FONT_FAMILY.className}
        style={{ ...linkStyle, ...focusStyle }}
      >
        {children}
      </Link>
    );
  }
  
  // Check if the link is internal (starts with /) or external
  const isInternal = href.startsWith('/') && !isPdf && !isStarLink;
  
  if (isInternal) {
    // Use Next.js Link for other internal navigation
    return (
      <Link
        href={href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={FONT_FAMILY.className}
        style={{ ...linkStyle, ...focusStyle }}
      >
        {children}
      </Link>
    );
  }
  
  // External links and PDFs: open in new tab
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={FONT_FAMILY.className}
      style={{ ...linkStyle, ...focusStyle }}
    >
      {children}
    </a>
  );
}
