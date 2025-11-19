"use client";
import StarMarkdownRenderer from "@/components/star-revamp/StarMarkdownRenderer";

export default function StarPanel({ markdown }: { markdown: string }) {
  return <StarMarkdownRenderer markdown={markdown} />;
}
