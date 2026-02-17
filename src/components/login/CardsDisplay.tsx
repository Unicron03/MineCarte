"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const CARDS = [
    { src: "/cards/zombie/all.png", rotation: 10, x: 50, y: -340, z: 1, scale: 0.95 },
    { src: "/cards/sword/all.png", rotation: 13, x: -50, y: -55, z: 2, scale: 1.1 },
    { src: "/cards/skeleton/all.png", rotation: 10, x: -30, y: 350, z: 4, scale: 1.05 },
    { src: "/cards/enderman/all.png", rotation: -15, x: -700, y: 150, z: 1, scale: 1.1 },
    { src: "/cards/pickaxe/all.png", rotation: -10, x: -750, y: 400, z: 2, scale: 1.15 },
    { src: "/cards/axolotl/all.png", rotation: -5, x: -710, y: -300, z: 1, scale: 0.6 },
    { src: "/cards/turtle/all.png", rotation: -2, x: -530, y: -320, z: 2, scale: 0.85 },
    { src: "/cards/cat/all.png", rotation: -2, x: -320, y: 210, z: 2, scale: 0.9 },
    { src: "/cards/creeper/all.png", rotation: 8, x: -290, y: -80, z: 3, scale: 1.5 },
];

export default function CardsDisplay() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(CARDS.length).fill(false));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        // Animer les cartes une par une
        const BASE_DELAY = 50; // petit délai pour laisser le style initial être peint
        const timers: number[] = [];
        CARDS.forEach((_, index) => {
            const t = window.setTimeout(() => {
                setVisibleCards(prev => {
                    const newVisible = [...prev];
                    newVisible[index] = true;
                    return newVisible;
                });
            }, BASE_DELAY + index * 150); // Délai entre chaque carte, + base pour le premier
            timers.push(t);
        });
        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
                className="relative w-full h-full"
                style={{
                    transform: `rotateX(${mousePos.y * 1}deg) rotateY(${mousePos.x * 1}deg)`,
                    transition: "transform 0.2s ease-out"
                }}
            >
                {CARDS.map((card, index) => {
                    // Déterminer la direction d'entrée selon la position
                    const startX = card.x < 0 ? -2000 : 2000;
                    const startY = card.y < 0 ? -2000 : 2000;

                    return (
                        <div
                            key={index}
                            className="absolute top-1/2 left-1/2 transition-all duration-700 ease-out hover:scale-110"
                            style={{
                                transform: `
                                    translate(-50%, -50%)
                                    translateX(${visibleCards[index] ? card.x : startX}px)
                                    translateY(${visibleCards[index] ? card.y : startY}px)
                                    rotate(${card.rotation}deg)
                                    scale(${card.scale})
                                    translateZ(${card.z * 10}px)
                                `,
                                opacity: visibleCards[index] ? 1 : 0,
                                zIndex: card.z,
                            }}
                        >
                            <Image
                                src={card.src}
                                alt={`Card ${index + 1}`}
                                width={200}
                                height={280}
                                className="drop-shadow-2xl rounded-lg"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}