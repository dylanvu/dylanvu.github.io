"use client";
import StarMarkdownRenderer from "@/components/star-revamp/StarMarkdownRenderer";
import { useFocusContext } from "@/hooks/useFocusProvider";
import {
  getConstellationDataByName,
  getConstellationNameByStarSlug,
  getStarDataBySlug,
} from "@/components/star-revamp/Star/ConstellationList";
import {
  ConstellationData,
  StarDataWithInternalLink,
} from "@/interfaces/StarInterfaces";
import { useEffect } from "react";

export default function StarPanel({
  markdown,
  slug,
}: {
  markdown: string;
  slug: string;
}) {
  const { setFocusedObject } = useFocusContext();
  const constellationName = getConstellationNameByStarSlug(slug);
  let constellationData: ConstellationData | null = null;
  let starData: StarDataWithInternalLink | null = null;
  if (constellationName) {
    constellationData = getConstellationDataByName(constellationName);
    starData = getStarDataBySlug(slug, constellationName);
  }
  useEffect(() => {
    // let's store where we are so that we can focus on it on render
    setFocusedObject({
      constellation: constellationData,
      star: starData,
    });
  }, []);
  return <StarMarkdownRenderer markdown={markdown} />;
}
