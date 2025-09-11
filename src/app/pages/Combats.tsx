import { useRouter } from "next/navigation";
import { ThemeToggle } from "../components/ThemeToggle";
import InfoPanel from "../components/InfoPanel";
import "atropos/css";
import Footer from "../components/Footer";

export default function Combats() {
    const router = useRouter();

    return (
        <main className="p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>

            <button onClick={() => router.push("/game")} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow">Lancer la partie</button>

            <Footer />
        </main>
    );
}