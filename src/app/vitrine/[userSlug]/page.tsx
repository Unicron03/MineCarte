import Footer from "@/components/Footer";
import CardPopupDetails from "@/components/card-popup-details";
import { Card } from "@/types";
import { Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";

export default async function ShowcasePage({ params }: { params: Promise<{ userSlug: string }> }) {
    const { userSlug } = await params;

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
        main_img: "/cards/skeleton/front.png",
        background_img: "/cards/skeleton/back.png",
        third_img: "/cards/skeleton/mid.png",
    };

    return (
        <main className="flex flex-col items-center h-screen p-4">
            <header className="flex items-center">
                <div className="flex gap-4">
                    <span className="text-3xl font-medium">Vitrine de {userSlug}</span>

                    <div className="glass-nav flex items-center gap-2 cursor-pointer">
                        <Heart />
                        <span>J&apos;aime</span>
                    </div>
                </div>

                <div className="fixed flex right-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 flex h-full w-fit justify-center items-center glass-nav after:!rounded-3xl !rounded-3xl m-6 !p-6">
                <div className="glass-highlight w-fit h-full rounded-3xl p-4 overflow-x-auto overflow-y-auto min-h-0">
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
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-end">
                <Footer />
            </div>
        </main>
    );
}