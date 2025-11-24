"use client"

import { useEffect } from "react";
import { useFocusContext } from "@/hooks/useFocusProvider";

export default function ConstellationPageInitializer({ slug }: { slug: string }) {
  const { navigateToConstellation } = useFocusContext();
  
  useEffect(() => {
    navigateToConstellation(slug);
  }, [slug, navigateToConstellation]);
  
  return null;
}
