import { ThemeToggle } from "../components/ThemeToggle";
import InfoPanel from "../components/InfoPanel";
import "atropos/css";
import StarryBackground from "../components/particles/starry";

export default function Welcome() {
    return (
        <main className="p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>

            <StarryBackground />
        </main>
    );
}