"use client";
import StarMarkdownRenderer from "@/components/star-revamp/StarMarkdownRenderer";
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
  
  useEffect(() => {
    // Navigate to the star on mount or when slug changes
    navigateToStar(slug);
  }, [slug, navigateToStar]);
  
  return <StarMarkdownRenderer markdown={markdown} />;
}
