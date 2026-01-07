"use client";

import Atropos from "atropos/react";
import Image from "next/image";
import { Card } from "@/types";
import { useEffect, useState, forwardRef, HTMLAttributes } from "react";

interface AtroposCardProps extends HTMLAttributes<HTMLDivElement> {
    card: Card;
    isPulsating?: boolean;
}

const AtroposCard = forwardRef<HTMLDivElement, AtroposCardProps>(({ card, isPulsating = false, ...props }, ref) => {
    const [taille, setTaille] = useState({ width: 460, height: 600 });

    useEffect(() => {
        const updateTaille = () => {
            const height = window.innerHeight * 0.75;
            const width = height / 1.3;
            setTaille({ width, height });
        };

        updateTaille();
        window.addEventListener("resize", updateTaille);

        return () => window.removeEventListener("resize", updateTaille);
    }, []);

    return (
        <div ref={ref}>
            <Atropos className="atropos-banner" highlight={false} shadow={false} {...props} innerClassName="rounded-[0.5rem]">
                {isPulsating && (
                    <div
                        className="absolute pulsate-gold top-0 left-0 z-30 w-full h-full"
                    />
                )}

                <Image
                    className="atropos-banner-spacer"
                    src="/cards/creeper/back.png"
                    alt="Creeper card"
                    width={taille.width}
                    height={taille.height}
                />
                <Image
                    data-atropos-offset="-2"
                    className="w-fit h-full z-40"
                    src={card.background_img}
                    alt={card.name}
                    width={taille.width}
                    height={taille.height}
                />
                {card.third_img &&
                    <Image
                        data-atropos-offset="0"
                        className="w-fit h-full z-40"
                        src={card.third_img}
                        alt={card.name}
                        width={taille.width}
                        height={taille.height}
                    />
                }
                <Image
                    data-atropos-offset="2"
                    className="w-fit h-full z-40"
                    src={card.main_img}
                    alt={card.name}
                    width={taille.width}
                    height={taille.height}
                />
            </Atropos>
        </div>
    )
});

AtroposCard.displayName = "AtroposCard";

export default AtroposCard;