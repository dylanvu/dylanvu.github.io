"use client";

// code taken from react-particles documentation: https://github.com/tsparticles/react
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.
import "@/styles/particles-bg.css";
import { useState, useEffect } from "react";

export default function ParticlesBg() {
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="particle-container">
      {init && (
        <Particles
          id="tsparticles"
          options={{
            fpsLimit: 120,
            particles: {
              color: {
                value: "#ffffff",
              },
              move: {
                direction: "bottom",
                enable: true,
                outModes: {
                  default: "out",
                },
                random: false,
                speed: 2,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 800,
                  height: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
            fullScreen: false,
          }}
        />
      )}
    </div>
  );
}
