"use client";

import Image from "next/image";
import { Card } from "@/components/utils/types";
import { useEffect, useState, forwardRef, HTMLAttributes } from "react";

interface SimpleCardProps extends HTMLAttributes<HTMLDivElement> {
    card: Card;
}

const SimpleCard = forwardRef<HTMLDivElement, SimpleCardProps>(({ card, className = "", ...props }, ref) => {
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
        <div ref={ref} className={`relative rounded-[0.5rem] ${className}`} {...props}>
            <Image
                className="absolute top-0 left-0 w-full h-full"
                src={card.background_img}
                alt={card.name}
                width={taille.width}
                height={taille.height}
            />
            {card.third_img && (
                <Image
                    className="absolute top-0 left-0 w-full h-full"
                    src={card.third_img}
                    alt={card.name}
                    width={taille.width}
                    height={taille.height}
                />
            )}
            <Image
                className="absolute top-0 left-0 w-full h-full"
                src={card.main_img}
                alt={card.name}
                width={taille.width}
                height={taille.height}
            />
        </div>
    );
});

SimpleCard.displayName = "SimpleCard";

export default SimpleCard;