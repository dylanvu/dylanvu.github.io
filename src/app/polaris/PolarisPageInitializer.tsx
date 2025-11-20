"use client"

import { useEffect } from "react";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";

export default function PolarisPageInitializer() {
  const {setPolarisActivated} = usePolarisContext();
  useEffect(() => {
    setPolarisActivated(true);
  }, [])
  return null;

}