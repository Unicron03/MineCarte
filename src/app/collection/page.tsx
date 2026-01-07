import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { Store } from "lucide-react";
import CardPopupDetails from "@/components/card-popup-details";
import { Star } from "lucide-react";
import Link from "next/link";
import { getAllCardsWithUserCollection } from "@/prisma/requests";
import { userId, backCard } from "@/types";

export const dynamic = 'force-dynamic';

export default async function Collection() {
    const collection = await getAllCardsWithUserCollection(userId);

    return (
        <main className="flex flex-col h-screen p-4 tsparticles
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <header className="flex">
                <Link href={`/vitrine/${userId}`} className="glass-nav flex items-center text-base font-medium gap-2 h-auto text-black dark:text-white">
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
                        {collection.map(({ card, isDiscovered, favorite, quantity }) => {
                            // Si la carte n'est pas découverte, on utilise backCard mais on garde l'ID réel
                            const displayCard = isDiscovered ? card : { ...backCard, id: card.id };
                            
                            return (
                                <CardPopupDetails
                                    key={card.id}
                                    card={displayCard}
                                    undescovered={isDiscovered}
                                    favorite={favorite}
                                    quantity={isDiscovered ? quantity : undefined}
                                    rarity={card.rarity}
                                />
                            );
                        })}
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