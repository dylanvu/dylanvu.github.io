"use client";

import React from "react";
import { useEffect, useState } from "react";
import "../styles/header.css";
import TypeOnce from "./animate/TypeOnce";
import TypeArray from "./animate/TypeArray";

const Header = () => {
  useEffect(() => {
    // Play video and animate header typing
    // React has an issue with the muted in the video tag not being set properly.
    document.addEventListener("DOMContentLoaded", () => {
      let video = document.getElementById("video");
      if (video) {
        (video as HTMLVideoElement).muted = true;
        (video as HTMLVideoElement).play(); // Might be necessary for chrome
      } else {
        console.error("Could not find video reel");
      }
    });
    setTimeout(() => {
      setShowExtras(true);
    }, 3000);
  }, []);

  const [showExtras, setShowExtras] = useState(false);

  return (
    <div className="header" id="header">
      <div className="welcome">
        <div>
          <TypeOnce
            text="Heyo! You might know me as Dylan Vu,"
            cursorClass="welcome-cursor"
            duration={2}
            removeCursor={true}
          />
        </div>
        <div>
          {showExtras ? (
            <TypeArray
              texts={[
                "Full-Stack Software Developer",
                "the guy specializing in Real-Time Communication",
                "the one who makes cool stuff at hackathons.",
              ]}
              cursorClass="welcome-cursor"
            />
          ) : null}
        </div>
      </div>
      <video
        className="video"
        preload="auto"
        id="video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/reel.mp4" type="video/mp4" />
        Video tag not supported
      </video>
    </div>
  );
};

export default Header;
