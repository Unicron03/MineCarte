"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { useEffect, useState } from "react";

interface ConfettiSidesProps {
    particleCount?: number;
    particleSize?: { min: number; max: number };
    particleColor?: string;
}

export default function ConfettiSides({
    particleCount = 10,
    particleSize = { min: 1, max: 5 },
    particleColor = "#ffd700",
}: ConfettiSidesProps) {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => setInit(true));
    }, []);

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {init && (
                <Particles
                    id="tsparticles-confetti-sides"
                    options={{
                        autoPlay: true,
                        fullScreen: { enable: true, zIndex: 0 },
                        detectRetina: true,
                        fpsLimit: 120,
                        particles: {
                            number: { value: 0, density: { enable: false } },
                            color: { value: particleColor },
                            shape: { type: "triangle", close: true, fill: true },
                            size: {
                                value: particleSize,
                                animation: {
                                    enable: true,
                                    speed: 16,
                                    startValue: "min",
                                    destroy: "none",
                                },
                            },
                            move: {
                                enable: true,
                                gravity: { enable: true, acceleration: 9.81, maxSpeed: 50 },
                                speed: { min: 10, max: 50 },
                                decay: 0.05,
                                direction: "top",
                                outModes: {
                                    default: "destroy",
                                    top: "none",
                                },
                            },
                            rotate: {
                                value: { min: 0, max: 360 },
                                animation: { enable: true, speed: 30 },
                                direction: "random",
                            },
                            tilt: {
                                value: { min: 0, max: 360 },
                                animation: { enable: true, speed: 30 },
                                direction: "random",
                                enable: true,
                            },
                            roll: {
                                enable: true,
                                darken: { enable: true, value: 25 },
                                speed: { min: 5, max: 15 },
                                mode: "vertical",
                            },
                            wobble: {
                                enable: true,
                                distance: 30,
                                speed: {
                                    angle: { min: -7, max: 7 },
                                    move: 10,
                                },
                            },
                            opacity: { value: 1 },
                        },
                        emitters: [
                            {
                                autoPlay: true,
                                position: { x: 0, y: 30 },
                                rate: { quantity: particleCount, delay: 0.15 },
                                particles: {
                                    move: {
                                        direction: "top-right",
                                        outModes: { top: "none", left: "none", default: "destroy" },
                                    },
                                },
                            },
                            {
                                autoPlay: true,
                                position: { x: 100, y: 30 },
                                rate: { quantity: particleCount, delay: 0.15 },
                                particles: {
                                    move: {
                                        direction: "top-left",
                                        outModes: { top: "none", right: "none", default: "destroy" },
                                    },
                                },
                            },
                        ],
                        motion: { disable: false, reduce: { factor: 4, value: true } },
                    }}
                />
            )}
        </div>
    );
}
