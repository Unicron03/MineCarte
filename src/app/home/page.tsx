import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { Video } from "@/components/VideoReader";
import Chest from "@/components/Chest";
import { UserStar, Store, Smile, Key } from "lucide-react";
import fs from "fs";
import path from "path";

async function getVideoOfTheDay() {
    const dir = path.join(process.cwd(), "public/animated-background");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".mp4"));
    if (files.length === 0) {
        return null;
    }
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % files.length;
    return `/animated-background/${files[index]}`;
}

export default async function Home() {
    const videoSrc = await getVideoOfTheDay();

    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            {/* Header */}
            <header className="flex">
                <div className="glass-nav">
                    <Smile className="m-2"/>
                </div>

                <div className="flex justify-end items-center w-full gap-4">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            {/* Vidéo */}
            <div>
                {videoSrc && <Video src={videoSrc} />}
            </div>

            {/* Zone Coffre - prend tout l’espace restant */}
            <div className="flex-1 flex flex-col justify-center items-center">
                <Chest />

                <div className="glass-nav flex gap-4 items-center px-4 text-base font-medium">
                    <span className="">12h46</span>
                    <div className="glass-highlight flex gap-2 rounded-full px-2 py-1.5">
                        <Key/>
                        <span>25</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
                <div className="glass-nav">
                    <UserStar className="m-2"/>
                </div>

                <Footer />
                
                <div className="glass-nav">
                    <Store className="m-2"/>
                </div>
            </div>
        </main>
    );
}
