"use client"

import { useEffect } from "react";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
// all this page does is activate polaris if you go to it
export default function PolarisPageInitializer() {
  const {setPolarisActivated} = usePolarisContext();
  useEffect(() => {
    setPolarisActivated(true);
  }, [])
  return null;

}