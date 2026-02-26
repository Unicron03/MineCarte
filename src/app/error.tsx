"use client";

import Link from "next/link";
import Image from "next/image";

export default function Error({
    reset,
}: {
    reset: () => void;
}) {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <h1 className="text-6xl font-bold mb-4 z-10">500</h1>
            <span className="text-2xl mb-8 z-10">Erreur serveur</span>
            <p className="text-gray-400 mb-8 z-10 text-center max-w-md">
                Une erreur inattendue s&apos;est produite. Nos développeurs ont été notifiés.
            </p>
            
            <div className="flex gap-4 z-10">
                <button 
                    onClick={() => reset()}
                    className="glass-nav px-6 py-3 text-lg font-medium"
                >
                    Réessayer
                </button>
                <Link 
                    href="/home" 
                    className="glass-nav px-6 py-3 text-lg font-medium"
                >
                    Retour à l&apos;accueil
                </Link>
            </div>

            <Image
                unoptimized
                src="/gif/creeper404.gif"
                alt="Erreur serveur"
                width={300}
                height={300}
                className="absolute bottom-0 left-5 brightness-75 hue-rotate-[-20deg] saturate-150"
                style={{ filter: 'sepia(100%) hue-rotate(-50deg) saturate(300%)' }}
            />
        </main>
    );
}