"use client";
import StarMarkdownRenderer from "@/components/star-revamp/StarMarkdownRenderer";
import { useFocusContext } from "@/hooks/useFocusProvider";

export default function StarPanel({
  markdown,
  slug,
}: {
  markdown: string;
  slug: string;
}) {
  const { setFocusedObject } = useFocusContext();
  const useEffect = () => {
    setFocusedObject(null);
  };
  return <StarMarkdownRenderer markdown={markdown} />;
}
