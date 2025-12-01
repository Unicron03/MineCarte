"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import StarryBackground from "@/components/particles/starry";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Welcome() {
    const [title, setTitle] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/titles')
            .then(res => res.json())
            .then(data => setTitle(data.url))
            .catch(() => setTitle(null));
    }, []);

    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <ThemeToggle />
                <InfoPanel />
            </header>

            <StarryBackground />

            <div className="flex-1 flex flex-col items-center justify-center relative">
                {title && (
                    <Image
                        src={title}
                        alt="Titre aléatoire"
                        width={400}
                        height={100}
                        className="mb-8"
                    />
                )}
                <ConnectionPanel />
            </div>

            <footer className="flex justify-center items-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} MineCarte. Tous droits réservés.
                </p>
            </footer>
        </main>
    );
}