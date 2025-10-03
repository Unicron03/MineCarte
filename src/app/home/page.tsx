import { ThemeToggle } from "@/app/components/ThemeToggle";
import InfoPanel from "@/app/components/InfoPanel";
import "atropos/css";
import Footer from "@/app/components/Footer";
import { Video } from "@/app/components/VideoReader";
import Chest from "@/app/components/Chest";

export default function Home() {
    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            {/* Header */}
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>

            {/* Vidéo */}
            <div>
                <Video />
            </div>

            {/* Zone Coffre - prend tout l’espace restant */}
            <div className="flex-1 flex justify-center items-center">
                <Chest />
            </div>

            {/* Footer */}
            <div className="flex">
                <Footer />
            </div>
        </main>
    );
}
