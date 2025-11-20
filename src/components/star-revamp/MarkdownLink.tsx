"use client";
import Link from "next/link";
import { FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { STAR_BASE_URL } from "@/constants/Routes";

/**
 * Shared markdown link component that handles internal vs external links
 * - Internal star links use navigateToStar to focus the star directly
 * - Other internal links use Next.js Link for client-side navigation
 * - PDF files always open in new tabs
 * - External links open in new tabs
 */
export function MarkdownLink({ children, href }: { children: React.ReactNode; href?: string }) {
  const { navigateToStar } = useFocusContext();
  
  // Handle missing href
  if (!href) {
    return <span className={FONT_FAMILY.className}>{children}</span>;
  }
  
  // Check if it's a PDF file - always open in new tab
  const isPdf = href.toLowerCase().endsWith('.pdf');
  
  // Check if it's a star link (starts with STAR_BASE_URL)
  const isStarLink = href.startsWith(STAR_BASE_URL + '/');
  
  if (isStarLink) {
    // Extract slug from the URL
    const slug = href.replace(STAR_BASE_URL + '/', '');
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      navigateToStar(slug);
    };
    
    return (
      <a
        href={href}
        onClick={handleClick}
        className={FONT_FAMILY.className}
        style={{
          color: SPACE_TEXT_COLOR,
          cursor: 'pointer',
        }}
      >
        {children}
      </a>
    );
  }
  
  // Check if the link is internal (starts with /) or external
  const isInternal = href.startsWith('/') && !isPdf && !isStarLink;
  
  if (isInternal) {
    // Use Next.js Link for other internal navigation
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
  
  // External links and PDFs: open in new tab
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
}
