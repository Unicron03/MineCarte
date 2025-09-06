"use client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./components/ThemeToggle";

export default function Home() {
    const router = useRouter();

    return (
        <main>
            <ThemeToggle />
            <button onClick={() => router.push("/game")} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow">Lancer la partie</button>
        </main>
    );
}
