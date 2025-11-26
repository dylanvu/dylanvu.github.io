"use client";
import StarMarkdownRenderer from "@/components/star-revamp/StarMarkdownRenderer";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { useEffect } from "react";

export default function StarPanel({
  markdown,
  slug,
}: {
  markdown: string;
  slug: string;
}) {
  const { navigateToStar } = useFocusContext();
  const { polarisDisplayState, setPolarisDisplayState } = usePolarisContext();

  // Navigation effect - only runs when slug changes
  useEffect(() => {
    navigateToStar(slug)
  }, [slug, navigateToStar])

  // Polaris suppression effect happens in the polaris provider
  
  return <StarMarkdownRenderer markdown={markdown} />;
}
