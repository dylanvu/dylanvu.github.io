// code taken from react-particles documentation: https://github.com/tsparticles/react
import { useCallback, useEffect, useState } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.
import "../styles/particles-bg.css";

export default function ParticlesBg() {
    const particlesInit = useCallback(async (engine: Engine) => {
        console.log(engine);

        // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        //await loadFull(engine);
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        console.log(container);
    }, []);

    const [particleDirection, setParticleDirection] = useState<number | "right" | "left" | "bottom" | "bottomLeft" | "bottomRight" | "none" | "top" | "topLeft" | "topRight" | "outside" | "inside" | undefined>("bottom");
    const [particleSpeed, setParticleSpeed] = useState(2);
    const [prevScrollPos, setPrevScrollPos] = useState(0);


    function onScroll() {
        const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScrollPos > prevScrollPos) {
            setParticleDirection("top");
        } else {
            setParticleDirection("bottom");
        }
        console.log(currentScrollPos);
        setPrevScrollPos(currentScrollPos);
        setParticleSpeed(6);
    }

    function onScrollStop() {
        setParticleDirection("bottom");
        setParticleSpeed(2);
    }

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            // Clear the previous timeout (if any)
            clearTimeout(scrollTimeout);

            // speed up the particle movement and flip the direction
            onScroll();

            // a timeout to determine when scrolling has stopped
            scrollTimeout = setTimeout(function () {
                onScrollStop();
            }, 200); // Adjust the timeout value as needed
        }
        // attach some fancy listeners to affect the particle direction and speed
        // window.addEventListener('scroll', handleScroll);
        // clean up
        return () => {
            // window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="particle-container">
            <Particles
                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                    background: {
                        color: {
                            value: "#36393f"
                        }
                    },
                    fpsLimit: 120,
                    particles: {
                        // pass in any initial particles
                        array: [

                        ],
                        color: {
                            value: "#ffffff",
                        },
                        move: {
                            direction: particleDirection,
                            enable: true,
                            outModes: {
                                default: "out",
                            },
                            random: false,
                            speed: particleSpeed,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
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
                    fullScreen: false
                }}
            />
        </div>

    );
};