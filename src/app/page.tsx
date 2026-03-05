import { ThemeToggle } from "@/components/theme/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import StarryBackground from "@/components/particles/starry";
import { ConnectionPanel } from "@/components/login/ConnectionPanel";
import { InscriptionPanel } from "@/components/login/InscriptionPanel";
import { AuthPanelProvider } from "@/components/login/AuthPanelContext";
import CreeperTracking from "@/components/login/CreeperTracking";
import CardsDisplay from "@/components/login/CardsDisplay";
import { myFont } from "@/components/utils/types";

export default function Welcome() {
    return (
        <AuthPanelProvider>
            <main className="flex flex-col h-screen p-4 tsparticles relative overflow-hidden">
                <header className="flex justify-end items-center gap-4 relative z-20">
                    <ThemeToggle />
                    <InfoPanel />
                </header>

                <StarryBackground />
                
                <CardsDisplay />

                <div className="flex-1 flex flex-col items-end justify-center relative z-10 mr-32 gap-4">
                    <h1 className={`${myFont.className} text-7xl text-center drop-shadow-lg !text-white`}>MineCarte</h1>
                    <div className="flex gap-4">
                        <ConnectionPanel />
                        <InscriptionPanel />
                    </div>
                </div>

                <CreeperTracking />

                <footer className="flex justify-end items-center py-4 relative z-20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} MineCarte. Tous droits réservés.
                    </p>
                </footer>
            </main>
        </AuthPanelProvider>
    );
}