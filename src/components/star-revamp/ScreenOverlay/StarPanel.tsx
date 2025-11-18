"use client";
import { SPACE_TEXT_COLOR } from "@/app/theme";
import StarMarkdownRenderer from "@/components/star-revamp/StarMarkdownRenderer";
import { motion } from "motion/react";

export default function StarPanel({
  markdown,
  slug,
}: {
  markdown: string;
  slug: string;
}) {
  return <StarMarkdownRenderer markdown={markdown} />;
}
