"use client";
import { useEffect } from "react";
import PolarisChat from "@/components/star-revamp/Star/Polaris/PolarisChat";

export default function PolarisPanel({}: {}) {
  useEffect(() => {
    // move polaris to its rightful home on the side of the screen
  }, []);
  return (
    // should be idential to StarPanel
    <PolarisChat />
  );
}
