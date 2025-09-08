import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function StarryBackground() {
    const [init, setInit] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            // charge toutes les features de tsparticles
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);
    
    return (
        <>
            {init && (
                <Particles
                    id="tsparticles"
                    options={{
                        fullScreen: { enable: true, zIndex: -1 },
                        background: { color: { value: "#000" } },
                        particles: {
                            number: {
                                value: 400,
                                density: { enable: true },
                            },
                            color: { value: "#fff" },
                            shape: { type: "circle" },
                            size: {
                                value: { min: 0.5, max: 1 },
                            },
                            move: {
                                enable: true,
                                speed: 0.2,
                                direction: "none",
                                outModes: { default: "out" },
                            },
                            opacity: {
                                value: { min: 0.05, max: 1 },
                                animation: {
                                    enable: true,
                                    speed: 5,
                                    count: 0,
                                    sync: false,
                                },
                            },
                        },
                        detectRetina: false,
                        fpsLimit: 30,
                    }}
                />
            )}
        </>
    );
}
