import CardPopupDetails from "./card-popup-details";
import { Card } from "@/types";

export default function ShowcasePopup() {
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
        <div className="flex-1 flex justify-center items-center glass-nav after:!rounded-3xl !rounded-3xl m-6 !p-6">
            <div className="glass-highlight w-full h-full rounded-3xl p-4 overflow-x-auto overflow-y-auto min-h-0">
                <div className="grid grid-flow-col grid-rows-2 auto-rows-fr gap-4">
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
    );
}