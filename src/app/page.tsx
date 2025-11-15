"use client";
import IntroScreen from "@/components/star-revamp/IntroScreen/IntroScreen";
import MainStar from "@/components/star-revamp/Star/Star";
import { useState } from "react";
import { Stage, Layer } from "react-konva";
import { Html } from "react-konva-utils";
import BackgroundStarField from "@/components/star-revamp/Star/BackgroundStarField";
import { SPACE_BACKGROUND_COLOR } from "@/app/theme";

function MainStage() {
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ background: SPACE_BACKGROUND_COLOR }}
    >
      <Layer>
        <BackgroundStarField
          width={window.innerWidth}
          height={window.innerHeight}
          starCount={200}
        />
        <MainStar x={20} y={20} />
      </Layer>
    </Stage>
  );
}

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
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
