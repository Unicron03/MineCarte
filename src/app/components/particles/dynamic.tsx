"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function DynamicBackground() {
    const [init, setInit] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <>
            {init && (
                <Particles
                    id="tsparticles"
                    options={{
                        fullScreen: { enable: true, zIndex: -1 },
                        background: {
                            color: { value: theme === "dark" ? "#000" : "#fdfcf8" }, // fond noir sombre ou clair ivoire
                        },
                        particles: {
                            number: {
                                value: 200,
                                density: { enable: true },
                            },
                            color: { value: theme === "dark" ? "#fff" : "#d4af37" }, // blanc dans sombre, doré en clair
                            shape: { type: "circle" },
                            size: {
                                value: { min: 1, max: 3 },
                            },
                            move: {
                                enable: true,
                                speed: 0.6,
                                direction: "none",
                                random: true,
                                straight: false,
                                outModes: { default: "out" },
                            },
                            opacity: {
                                value: { min: 0.3, max: 0.8 },
                                animation: {
                                    enable: true,
                                    speed: 1,
                                    sync: false,
                                },
                            },
                        },
                        fpsLimit: 60,
                        detectRetina: true,
                    }}
                />
            )}
        </>
    );
}
