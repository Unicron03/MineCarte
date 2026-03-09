import { ThemeToggle } from "@/components/theme/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { WalletCards } from "lucide-react";
import Link from "next/link";
import FightCard from "@/components/cards/FightCard";

export const dynamic = 'force-dynamic';

export default function Combats() {
    return (
        <main className="flex flex-col h-screen p-8 tsparticles
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <header className="flex justify-end items-center gap-4 mb-4">
                <div className="fixed flex right-4 top-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-8 p-4">
                
                <FightCard bg="1vs1" name="1v1" actions={[
                    { label: '1v1', link: 'pvp1V1', modeName: '1v1', modeEnum: 'ONE_V_ONE', bgImage: '1vs1'}
                ]} />
                <FightCard isComing bg="1vsIA" name="1v IA" actions={[
                    { label: '1vIA', link: 'pvp1V1', modeName: '1v IA', modeEnum: 'IA_V_ONE', bgImage: '1vsIA' }
                ]} />
                <FightCard isComing bg="donjon" name="Donjon" actions={[
                    { label: 'Entrer', link: 'donjon', modeName: 'Donjon', modeEnum: 'DONJON', bgImage: 'donjon' }
                ]} />
                <FightCard isComing bg="vagues" name="Vagues" actions={[
                    { label: 'Commencer', link: 'vagues', modeName: 'Vagues', modeEnum: 'VAGUES', bgImage: 'vagues' }
                ]} />
            </div>

            <Footer left={
                <Link href="/decks" id="decks" className="glass-nav">
                    <WalletCards className="m-2" color="white"/>
                </Link>
            } />
        </main>
    );
}