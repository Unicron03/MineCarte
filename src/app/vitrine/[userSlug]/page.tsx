import Footer from "@/components/Footer";
import CardPopupDetails from "@/components/cards/card-popup-details";
import { Heart } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import { getUserFavoriteCards, getUser } from "@/prisma/requests";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = 'force-dynamic';

export default async function ShowcasePage({ params }: { params: Promise<{ userSlug: string }> }) {
    const { userSlug } = await params;
    
    const currentUserId = await getCurrentUserId();
    const stats = await getUser(userSlug);
    const favoriteCards = await getUserFavoriteCards(userSlug);

    return (
        <main className="flex flex-col h-screen p-4
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <header className="grid grid-cols-3 items-center">
                <div></div> {/* Colonne gauche vide */}
                
                <div className="flex gap-4 justify-center">
                    <span className="text-3xl font-medium">Vitrine de {stats?.name}</span>

                    <div className="glass-nav flex items-center gap-2 cursor-pointer hidden">
                        <Heart />
                        <span>J&apos;aime</span>
                    </div>
                </div>

                <div className="flex gap-4 justify-end">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 flex justify-center items-center glass-nav after:!rounded-3xl !rounded-3xl !p-6 m-6 min-h-0">
                <div className="glass-highlight w-full h-full rounded-3xl p-4 overflow-x-auto overflow-y-auto">
                    {favoriteCards.length > 0 ? (
                        <div className="grid grid-flow-col grid-rows-2 auto-rows-fr gap-4 h-full w-fit">
                            {favoriteCards.map((card) => (
                                <CardPopupDetails 
                                    key={card.id}
                                    card={card}
                                    undescovered={true}
                                    favorite={true}
                                    canSetFavorite={currentUserId === stats?.id}
                                    quantity={card.quantity}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xl text-gray-500">Aucune carte favorite pour le moment</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}