"use client";

import { Deck, exampleCollectionCards } from "@/types"
import { Separator } from "@/shadcn/ui/separator"
import { useState } from "react"

export default function DeckConstruction({ deck }: { deck: Deck }) {
    const [addCard, setAddCard] = useState<boolean>(false)
    const nbCardsInDeck = 15;
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    const uniqueCollection = exampleCollectionCards.filter((card, index, self) =>
        index === self.findIndex((c) => (
            c.name === card.name
        ))
    );

    return (
        <main className="overflow-y-auto">
            <div className="flex flex-wrap gap-4 p-4">
                {deck.cards.map((card) => (
                    <div key={card.id} className="relative w-32 h-44 cursor-pointer"
                        onClick={() => deck.cards = deck.cards.filter((c) => c.id !== card.id)} // Supprime du deck la carte cliqué
                    >
                        <img src={card.background_img} alt={card.name} className="absolute w-full h-full object-cover" />
                        {card.third_img && <img src={card.third_img} alt={card.name} className="absolute w-full h-full object-cover" />}
                        <img src={card.main_img} alt={card.name} className="absolute w-full h-full object-cover" />
                    </div>
                ))}
                {Array.from({ length: nbCardsInDeck - deck.cards.length }).map((_, index) => (
                    <div key={`empty-${index+deck.cards.length}`}
                        className={`relative w-32 h-44 border-2 border-dashed ${selectedSlot === index+deck.cards.length ? "border-yellow-400" : "border-gray-400"} rounded-lg flex items-center justify-center text-gray-500 cursor-pointer`}
                        onClick={() => { setAddCard(true); setSelectedSlot(index+deck.cards.length) }}
                    >
                        +
                    </div>
                ))}
            </div>

            {addCard &&
                <div className="flex flex-col gap-4 p-4">
                    <Separator />

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xl font-medium">Cartes de votre collection</span>
                        <span className="text-base text-gray-500">Cliquez sur une carte pour l'ajouter au deck</span>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-4">
                            {uniqueCollection.map((card) => (
                                <div key={card.id} className="relative w-32 h-44 cursor-pointer"
                                    onClick={() => {
                                        deck.cards.push(card);
                                        setAddCard(false);
                                        setSelectedSlot(null);
                                    }}
                                >
                                    <img src={card.background_img} alt={card.name} className="absolute w-full h-full object-cover" />
                                    {card.third_img && <img src={card.third_img} alt={card.name} className="absolute w-full h-full object-cover" />}
                                    <img src={card.main_img} alt={card.name} className="absolute w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        </main>
    )
}