"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Atropos } from 'atropos/react';

const CARDS = [
    { src: "/cards/cat/all.png", rotation: 10, x: 140, y: -340, z: 2, scale: 0.80, shadow: 'light', blur: 0},
    { src: "/cards/enderman/all.png", rotation: 15, x: -80, y: -165, z: 7, scale: 1.2, shadow: 'heavy', blur: 0},
    { src: "/cards/totem/all.png", rotation: 14, x: -110, y: 200, z: 6, scale: 1.2, shadow: 'light', blur: 0},
    { src: "/cards/TNT/all.png", rotation: -15, x: -520, y: 150, z: 6, scale: 1.3, shadow: 'light', blur: 0},
    { src: "/cards/pickaxe/all.png", rotation: -12, x: -640, y: 500, z: 8, scale: 2.0, shadow: 'extreme', blur: 1 }, // Exception: Premier plan avec flou
    { src: "/cards/armor/all.png", rotation: -20, x: -680, y: -300, z: 3, scale: 0.6, shadow: 'light', blur: 2 }, // z: 1 → 3 pour plus de mouvement
    { src: "/cards/zombie/all.png", rotation: -11, x: -490, y: -170, z: 3, scale: 0.85, shadow: 'medium', blur: 0 },
    { src: "/cards/ghast/all.png", rotation: 13, x: -320, y: -300, z: 4, scale: 0.9, shadow: 'medium', blur: 0 },
    { src: "/cards/creeper/all.png", rotation: 8, x: -290, y: -10, z: 8, scale: 1.6, shadow: 'light', blur: 0},
    { src: "/cards/golem/all.png", rotation: -9, x: 110, y: 300, z: 5, scale: 1.3, shadow: 'heavy', blur: 0 },
    { src: "/cards/axolotl/all.png", rotation: 9, x: -760, y: -100, z: 4, scale: 1.1, shadow: 'medium', blur: 0 }, // Nouvelle carte Axolotl
];

export default function CardsDisplay() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(CARDS.length).fill(false));

    //intensité d'ombre selon la profondeur z
    const getShadowIntensity = (shadowType: string, z: number) => {
        const baseIntensity = z;
        switch(shadowType) {
            case 'light':
                return { opacity: 0.3 + (baseIntensity * 0.05), offsetX: 1, offsetY: 2 + baseIntensity, blur: 6 }; // +2 blur
            case 'medium':
                return { opacity: 0.4 + (baseIntensity * 0.05), offsetX: 2, offsetY: 3 + baseIntensity, blur: 8 }; // +2 blur
            case 'heavy':
                return { opacity: 0.5 + (baseIntensity * 0.05), offsetX: 3, offsetY: 4 + baseIntensity, blur: 10 }; // +2 blur
            case 'extreme':
                return { opacity: 0.6 + (baseIntensity * 0.05), offsetX: 4, offsetY: 5 + baseIntensity, blur: 12 }; // +2 blur
            default:
                return { opacity: 0.4, offsetX: 2, offsetY: 3, blur: 8 }; // +2 blur
        }
    };

    // blur selon la profondeur avec des classes fixes
    const getBlurStyle = (blur: number) => {
        if (blur === 0) return '';
        
        
        return `blur(${blur}px)`;
    };

    // blur automatique basé sur Z
    const getDepthBlur = (z: number, manualBlur: number) => {
       
        if (manualBlur > 0) return manualBlur;
        
        const autoBlur = Math.max(0, (6 - z) * 0.8); 
        return autoBlur;
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // effet parallaxe 
            const baseX = (e.clientX / window.innerWidth - 0.5);
            const baseY = (e.clientY / window.innerHeight - 0.5);
            setMousePos({ x: baseX, y: baseY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        //animer les cartes une par une
        const BASE_DELAY = 50; 
        const timers: number[] = [];
        CARDS.forEach((_, index) => {
            const t = window.setTimeout(() => {
                setVisibleCards(prev => {
                    const newVisible = [...prev];
                    newVisible[index] = true;
                    return newVisible;
                });
            }, BASE_DELAY + index * 150); 
            timers.push(t);
        });
        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
                className="absolute inset-0 animate-fade-in"
                style={{
                    background: 'radial-gradient(ellipse at 30% center, rgba(99, 217, 43, 0.4) 0%, rgba(99, 217, 43, 0.25) 40%, rgba(14, 70, 0, 0.15) 70%, transparent 100%)',
                    filter: 'blur(60px)',
                    transform: 'scale(1.2)',
                    zIndex: -1,
                    animation: 'fadeIn 2s ease-in-out forwards',
                    opacity: 0
                }}
            />
            
            <div 
                className="absolute top-1/2"
                style={{
                    left: '20%',
                    width: '900px',
                    height: '700px',
                    background: 'radial-gradient(ellipse, rgba(99, 217, 43, 0.5) 0%, rgba(99, 217, 43, 0.3) 50%, rgba(14, 70, 0, 0.15) 80%, transparent 100%)',
                    filter: 'blur(40px)',
                    transform: 'translate(-50%, -50%)',
                    zIndex: -1,
                    animation: 'fadeInConcentrated 2s ease-in-out 0.3s forwards',
                    opacity: 0
                }}
            />

            <div 
                className="relative w-full h-full overflow-hidden"
                style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d'
                }}
            >
                {CARDS.map((card, index) => {
                    const startX = card.x < 0 ? -2000 : 2000;
                    const startY = card.y < 0 ? -2000 : 2000;
                    
                    // effet parallaxe selon la profondeur Z 
                    const maxParallax = card.x < -500 ? 3 : 7; 
                    const parallaxX = mousePos.x * (card.z * maxParallax);
                    const parallaxY = mousePos.y * (card.z * maxParallax);

            
                    const finalBlur = getDepthBlur(card.z, card.blur);

                    return (
                        <div
                            key={index}
                            className="absolute top-1/2 left-1/2 pointer-events-auto transition-all duration-700 ease-out"
                            style={{
                                transform: `
                                    translate(-50%, -50%)
                                    translateX(${visibleCards[index] ? card.x + parallaxX : startX}px)
                                    translateY(${visibleCards[index] ? card.y + parallaxY : startY}px)
                                    rotate(${card.rotation}deg)
                                    scale(${card.scale})
                                    translateZ(${card.z * 25}px)
                                `,
                                opacity: visibleCards[index] ? 1 : 0,
                                zIndex: card.z * 10,
                                transformStyle: 'preserve-3d',
                                filter: `${getBlurStyle(finalBlur)}`,
                            }}
                        >
                          
                            <Image
                                src={card.src}
                                alt={`Card ${index + 1}`}
                                width={200}
                                height={280}
                                className="rounded-lg backface-hidden transition-all duration-300"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    filter: `drop-shadow(${getShadowIntensity(card.shadow, card.z).offsetX}px ${getShadowIntensity(card.shadow, card.z).offsetY}px ${getShadowIntensity(card.shadow, card.z).blur}px rgba(0,0,0,${getShadowIntensity(card.shadow, card.z).opacity}))`
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}