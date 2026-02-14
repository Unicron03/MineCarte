"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Explosion = {
    id: number;
    x: number;
    y: number;
};

export default function CreeperTracking() {
    const leftEyeRef = useRef<HTMLDivElement>(null);
    const rightEyeRef = useRef<HTMLDivElement>(null);

    const leftPupilEl = useRef<HTMLDivElement>(null);
    const rightPupilEl = useRef<HTMLDivElement>(null);

    const leftPupilPos = useRef({ x: 0, y: 0 });
    const rightPupilPos = useRef({ x: 0, y: 0 });

    const leftPupilTarget = useRef({ x: 0, y: 0 });
    const rightPupilTarget = useRef({ x: 0, y: 0 });

    const [isHovered, setIsHovered] = useState(false);
    const [explosions, setExplosions] = useState<Explosion[]>([]);

    const hoverTimer = useRef<NodeJS.Timeout | null>(null);
    const explosionInterval = useRef<NodeJS.Timeout | null>(null);

    const EXPLOSION_INTERVAL = 100; // intervalle entre explosions (ms)

    /* =======================
        SUIVI DE LA SOURIS
    ======================= */
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (leftEyeRef.current) {
                const eye = leftEyeRef.current.getBoundingClientRect();
                const cx = eye.left + eye.width / 2;
                const cy = eye.top + eye.height / 2;

                const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
                const distance = Math.min(eye.width / 6, 10);

                leftPupilTarget.current = {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                };
            }

            if (rightEyeRef.current) {
                const eye = rightEyeRef.current.getBoundingClientRect();
                const cx = eye.left + eye.width / 2;
                const cy = eye.top + eye.height / 2;

                const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
                const distance = Math.min(eye.width / 6, 10);

                rightPupilTarget.current = {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                };
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    /* =======================
        ANIMATION FLUIDE YEUX
    ======================= */
    useEffect(() => {
        let rafId: number;
        const ease = 0.18;

        const animate = () => {
            leftPupilPos.current.x +=
                (leftPupilTarget.current.x - leftPupilPos.current.x) * ease;
            leftPupilPos.current.y +=
                (leftPupilTarget.current.y - leftPupilPos.current.y) * ease;

            rightPupilPos.current.x +=
                (rightPupilTarget.current.x - rightPupilPos.current.x) * ease;
            rightPupilPos.current.y +=
                (rightPupilTarget.current.y - rightPupilPos.current.y) * ease;

            if (leftPupilEl.current) {
                leftPupilEl.current.style.transform =
                    `translate(${leftPupilPos.current.x}px, ${leftPupilPos.current.y}px)`;
            }

            if (rightPupilEl.current) {
                rightPupilEl.current.style.transform =
                    `translate(${rightPupilPos.current.x}px, ${rightPupilPos.current.y}px)`;
            }

            rafId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(rafId);
    }, []);

    /* =======================
        EASTER EGG
    ======================= */
    const startExplosions = () => {
        if (explosionInterval.current) return;

        explosionInterval.current = setInterval(() => {
            const id = Date.now();
            setExplosions(prev => [
                ...prev,
                {
                    id,
                    x: Math.random() * (window.innerWidth - 100),
                    y: Math.random() * (window.innerHeight - 100),
                },
            ]);

            // Supprime l'explosion après l'animation
            setTimeout(() => {
                setExplosions(prev => prev.filter(e => e.id !== id));
            }, 1000);
        }, EXPLOSION_INTERVAL);
    };

    const stopExplosions = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        if (explosionInterval.current) clearInterval(explosionInterval.current);

        hoverTimer.current = null;
        explosionInterval.current = null;
        setExplosions([]);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        hoverTimer.current = setTimeout(startExplosions, 10_000); // 10 secondes
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        stopExplosions();
    };

    return (
        <>
            {/* EXPLOSIONS */}
            {explosions.map(explosion => (
                <Image
                    unoptimized
                    key={explosion.id}
                    src="/explosion.gif"
                    alt="Explosion"
                    width={100}
                    height={100}
                    className="fixed pointer-events-none z-[9999] scale-150"
                    style={{
                        left: explosion.x,
                        top: explosion.y,
                    }}
                />
            ))}

            {/* CREEPER */}
            <div
                className="fixed bottom-[8px] right-[-35px] w-64 h-64 z-50 scale-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Image
                    src="/creeper.png"
                    alt="Creeper"
                    width={256}
                    height={256}
                    className="w-full h-full absolute top-0 left-0"
                />

                {/* OEIL GAUCHE */}
                <div
                    ref={leftEyeRef}
                    className={`absolute w-16 h-20 flex items-center justify-center ${
                        isHovered ? "animate-pulse" : ""
                    }`}
                    style={{ top: "11%", left: "17%" }}
                >
                    <div
                        ref={leftPupilEl}
                        className={`absolute w-6 h-8 ${
                            isHovered ? "bg-red-600 animate-eye-shake" : "bg-white"
                        }`}
                    />
                </div>

                {/* OEIL DROIT */}
                <div
                    ref={rightEyeRef}
                    className={`absolute w-16 h-20 flex items-center justify-center ${
                        isHovered ? "animate-pulse" : ""
                    }`}
                    style={{ top: "12%", right: "19%" }}
                >
                    <div
                        ref={rightPupilEl}
                        className={`absolute w-6 h-8 ${
                            isHovered ? "bg-red-600 animate-eye-shake" : "bg-white"
                        }`}
                    />
                </div>
            </div>
        </>
    );
}