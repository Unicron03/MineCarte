"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import StarryBackground from "@/components/particles/starry";
import { ConnectionPanel } from "@/components/login/ConnectionPanel";
import { InscriptionPanel } from "@/components/login/InscriptionPanel";
import { AuthPanelProvider } from "@/components/login/AuthPanelContext";
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
        <AuthPanelProvider>
            <main className="flex flex-col h-screen p-4 tsparticles">
                <header className="flex justify-end items-center gap-4">
                    <ThemeToggle />
                    <InfoPanel />
                </header>

                <StarryBackground />

                <div className="flex-1 flex flex-col items-center justify-center relative gap-4">
                    {title && (
                        <Image
                            src={title}
                            alt="Titre aléatoire"
                            width={400}
                            height={100}
                            className="mb-8"
                        />
                    )}
                    <div className="flex gap-4">
                        <ConnectionPanel />
                        <InscriptionPanel />
                    </div>
                </div>

                <footer className="flex justify-center items-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} MineCarte. Tous droits réservés.
                    </p>
                </footer>
            </main>
        </AuthPanelProvider>
    );
}