"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./components/ThemeToggle";
import InfoPanel from "./components/InfoPanel";
import Atropos from "atropos/react";
import "atropos/css";
import StarryBackground from "./components/particles/starry";
import DynamicBackground from "./components/particles/dynamic";

export default function Home() {
    const router = useRouter();

    return (
        <main className="p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>

            {/* <div className="container">
                <Atropos className="atropos-banner" highlight={false} >
                    <img className="atropos-banner-spacer" src="atropos-test/atropos-bg.svg" alt="" />
                    <img data-atropos-offset="-4.5" src="atropos-test/atropos-bg.svg" alt="" />
                    <img data-atropos-offset="-2.5" src="atropos-test/atropos-mountains.svg" alt="" />
                    <img data-atropos-offset="0" src="atropos-test/atropos-forest-back.svg" alt="" />
                    <img data-atropos-offset="2" src="atropos-test/atropos-forest-mid.svg" alt="" />
                    <img data-atropos-offset="4" src="atropos-test/atropos-forest-front.svg" alt="" />
                    <img data-atropos-offset="5" src="atropos-test/atropos-logo-en.svg" alt="" />
                </Atropos>
            </div> */}

            <StarryBackground />
            {/* <DynamicBackground /> */}

            <button onClick={() => router.push("/game")} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow">Lancer la partie</button>
        </main>
    );
}