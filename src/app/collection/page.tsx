import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { Store } from "lucide-react";
import CardPopupDetails from "@/components/card-popup-details";
import { Card } from "@/types";
import { Star } from "lucide-react";
import Link from "next/link";

export default function Collection() {
    const card: Card = {
        id: 1,
        name: "Creeper",
        description: "Un monstre vert qui explose",
        category: "Monstre",
        rarity: 2,
        pv_durability: 100,
        cost: 50,
        talent: null,
        attack1: 20,
        attack2: null,
        main_img: "/cards/creeper/front.png",
        background_img: "/cards/creeper/back.png",
        third_img: "/cards/creeper/mid.png",
    };

    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex">
                <Link href="/vitrine/enzo" className="glass-nav flex items-center text-base font-medium gap-2 h-auto text-black dark:text-white">
                    <Star className="m-2"/>
                    <span>Vitrine</span>
                </Link>

                <div className="flex justify-end items-center w-full gap-4">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>
            
            <div className="flex-1 flex justify-center items-center glass-nav after:!rounded-3xl !rounded-3xl m-6 !p-6">
                <div className="glass-highlight w-full h-full rounded-3xl p-4 overflow-x-auto overflow-y-auto min-h-0">
                    <div className="grid grid-flow-col grid-rows-2 auto-rows-fr gap-4 h-full w-fit">
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card} undescovered/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                        <CardPopupDetails card={card}/>
                    </div>
                </div>
            </div>

            <Footer right={
                <Link href="/decks" className="glass-nav">
                    <Store className="m-2" color="white"/>
                </Link>
            } />
        </main>
    );
}