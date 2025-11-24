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

  useEffect(() => {
    navigateToStar(slug)
    if (polarisDisplayState === "active") {
      setPolarisDisplayState("suppressed");
    }
  }, [slug, navigateToStar])
  
  return <StarMarkdownRenderer markdown={markdown} />;
}
