import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <h1 className="text-6xl font-bold mb-4 z-10">404</h1>
            <span className="text-2xl mb-8 z-10">Page introuvable</span>
            <p className="text-gray-400 mb-8 z-10">La page que vous cherchez n&apos;existe pas.</p>
            <Link 
                href="/home" 
                className="glass-nav px-6 py-3 text-lg font-medium z-10"
            >
                Retour à l&apos;accueil
            </Link>

            <Image
                unoptimized
                src="/gif/creeper404.gif"
                alt="Creeper 404"
                width={300}
                height={300}
                className="absolute bottom-0 left-5"
            />
        </main>
    );
}