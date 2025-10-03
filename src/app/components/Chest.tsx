"use client";

import Image from "next/image";
import { useState } from "react";

export default function Chest() {
    const [isAnimated, setIsAnimated] = useState(false);

    return (
        <div>
            <Image
                src={isAnimated ? "/chest.gif" : "/chest.png"} // si false → image statique
                alt="Coffre"
                width={400}
                height={100}
                className="mb-8"
                onClick={() => setIsAnimated(true)} // toggle entre les deux images
            />
        </div>
    );
}