import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { WalletCards } from "lucide-react";
import Link from "next/link";
import FightCard from "@/components/combats/FightCard";

export default function Combats() {
    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <div className="fixed flex right-4 top-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
                <FightCard bg="test1" name="1v1" actions={[{ label: '1v1', link: 'one-v-one' }, { label: '1vAI', link: 'one-v-ai'}]} />
                <FightCard bg="test2" name="Donjon" actions={[{ label: 'Entrer', link: 'donjon'}]} />
                <FightCard bg="test1" name="Vagues" actions={[{ label: 'Commencer', link: 'vagues'}]} />
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