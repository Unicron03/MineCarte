import { ThemeToggle } from "@/app/components/ThemeToggle";
import InfoPanel from "@/app/components/InfoPanel";
import "atropos/css";
import Footer from "@/app/components/Footer";

export default function Collection() {
    return (
        <main className="p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>
            
            <Footer />
        </main>
    );
}