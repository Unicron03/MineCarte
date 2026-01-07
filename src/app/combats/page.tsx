import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { WalletCards } from "lucide-react";
import Link from "next/link";
import FightCard from "@/components/combats/FightCard";

export const dynamic = 'force-dynamic';

export default function Combats() {
    return (
        <main className="flex flex-col h-screen p-4 tsparticles
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <header className="flex justify-end items-center gap-4">
                <div className="fixed flex right-4 top-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
                <FightCard bg="1v1" name="1v1" actions={[{ label: '1v1', link: 'one-v-one', modeName: '1v1', modeEnum: 'ONE_V_ONE'}, { label: '1vAI', link: 'one-v-ai', modeName: '1vAI', modeEnum: 'IA_V_ONE' }]} />
                <FightCard bg="donjon" name="Donjon" actions={[{ label: 'Entrer', link: 'donjon', modeName: 'Donjon', modeEnum: 'DONJON' }]} />
                <FightCard bg="1v1" name="Vagues" actions={[{ label: 'Commencer', link: 'vagues', modeName: 'Vagues', modeEnum: 'VAGUES' }]} />
                <FightCard isComing />
            </div>

            <Footer left={
                <Link href="/decks" className="glass-nav">
                    <WalletCards className="m-2" color="white"/>
                </Link>
            } />
        </main>
    );
}