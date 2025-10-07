import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";

export default function Combats() {
    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>

            <div className="flex-1 flex justify-center items-center">
            </div>

            {/* Footer */}
            <div className="flex justify-center items-center">
                <Footer />
            </div>
        </main>
    );
}