"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { confettiController } from "./particles/controllers/confettiController";
import Confetti from "@/components/particles/confetti";

export default function Chest() {
    const [isAnimated, setIsAnimated] = useState(false);
    const [isOpenable, setIsOpenable] = useState(false);

    useEffect(() => {
        if (isAnimated === true) {
            confettiController.spawnWave();
        }

        let timer: NodeJS.Timeout;

        if (isAnimated) {
            timer = setTimeout(() => setIsAnimated(false), 4000);
        }

        return () => clearTimeout(timer);
    }, [isAnimated]);

    return (
        <div>
            { isAnimated && <Confetti/> }

            <Image
                unoptimized
                src={isAnimated ? "/chest.gif" : "/chest.png"}
                alt="Coffre"
                width={400}
                height={100}
                className={`mb-8 z-50 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] ${isOpenable ? "animate-coffre" : ""}`}
                onClick={() => { setIsOpenable(!isOpenable); }}
                onDoubleClick={() => { setIsAnimated(true); }}
            />
        </div>
    );
}
