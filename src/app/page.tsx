"use client";
import IntroScreen from "@/components/star-revamp/IntroScreen/IntroScreen";
import { useState } from "react";
import { SPACE_BACKGROUND_COLOR } from "@/app/theme";
import MainStage from "@/components/star-revamp/MainStage/MainStage";

export default function Home() {
  const [introDone, setIntroDone] = useState(true);
  return introDone ? (
    <MainStage />
  ) : (
    <div
      style={{
        background: SPACE_BACKGROUND_COLOR,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <IntroScreen setIntroDoneAction={setIntroDone} />
    </div>
  );
}
