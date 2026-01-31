import Image from "next/image";

export default function Maintenance() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <h1 className="text-6xl font-bold mb-4 z-10">🔧</h1>
            <span className="text-2xl mb-8 z-10">Maintenance en cours</span>
            <p className="text-gray-400 mb-8 z-10 text-center max-w-md">
                Le serveur est actuellement en maintenance. Nous serons de retour très bientôt !
            </p>

            <Image
                unoptimized
                src="/gif/pinguinDance.gif"
                alt="Maintenance"
                width={300}
                height={300}
                className="absolute bottom-0 left-5"
            />

            <Image
                unoptimized
                src="/gif/ghast.gif"
                alt="Maintenance"
                width={300}
                height={300}
                className="absolute top-0 right-15"
            />
        </main>
    );
}