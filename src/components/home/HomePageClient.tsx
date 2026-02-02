"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { Video } from "@/components/reader-viewer/VideoReader";
import Chest from "../Chest";
import { UserStar, Store, Smile, Key, Bolt } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function HomePageClient({ 
    videoSrc,
    initialUserKeys,
    timeNextChest 
}: { 
    videoSrc: string | null;
    initialUserKeys: number;
    timeNextChest: Date;
}) {
    const router = useRouter();
    const [isCardOpening, setCardOpening] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [isAvailable, setIsAvailable] = useState(false);
    const [userKeys, setUserKeys] = useState(initialUserKeys);
    const canTimerRunRef = useRef(true);

    const handleKeysUpdate = () => {
        canTimerRunRef.current = false;
    };

    const handleEndingTirage = () => {
        canTimerRunRef.current = true;
    };

    useEffect(() => {
        setUserKeys(initialUserKeys);
    }, [initialUserKeys]);

    useEffect(() => {
        const updateTimer = () => {
            if (!canTimerRunRef.current) return;

            const now = new Date();
            const nextChest = new Date(timeNextChest);
            const diff = nextChest.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining("Disponible !");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [timeNextChest]);

    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex">
                <div className="glass-nav">
                    <Smile className="m-2"/>
                </div>

                <div className="flex justify-end items-center w-full gap-4">
                    <ThemeToggle />
                    <InfoPanel />
                    <Link href="/profile" className="glass-nav">
                        <Bolt className="m-2"/>
                    </Link>
                </div>
            </header>

            <div>
                {videoSrc && <Video src={videoSrc} />}
            </div>

            <div className="flex-1 flex flex-col justify-center items-center">
                <Chest 
                    onOpeningChange={setCardOpening}
                    isAvailable={isAvailable}
                    userKeys={userKeys}
                    onKeysUpdate={handleKeysUpdate}
                    onEndingTirage={handleEndingTirage}
                />

                <div className="glass-nav flex gap-4 items-center px-4 text-base font-medium">
                    <span className={timeRemaining === "Disponible !" ? "text-green-400 font-bold" : ""}>
                        {timeRemaining || "Chargement..."}
                    </span>
                    <div className="glass-highlight flex gap-2 rounded-full px-2 py-1.5">
                        <Key/>
                        <span>{userKeys}</span>
                    </div>
                </div>
            </div>

            {!isCardOpening && <Footer left={
                <Link href="/decks" className="glass-nav">
                    <UserStar className="m-2"/>
                </Link>
            } right={
                <Link href="/decks" className="glass-nav">
                    <Store className="m-2" color="white"/>
                </Link>
            } />}
        </main>
    );
}