"use client";

import { defaultNbCardsPerDeck } from "@/components/utils/types"
import { Separator } from "@/shadcn/ui/separator"
import { useState } from "react"
import { Prisma } from "../../../generated/prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type DeckWithCards = Prisma.decksGetPayload<{
    include: {
        deck_cards: {
            include: {
                card: true
            }
        }
    }
}>;

type CollectionWithCards = Prisma.collectionGetPayload<{
    include: {
        card: true
    }
}>[];

export default function DeckConstruction({ deck, collection }: { deck: DeckWithCards, collection: CollectionWithCards }) {
    const [addCard, setAddCard] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    // Calculer le nombre total de cartes en tenant compte des quantities
    const totalCards = deck.deck_cards.reduce((sum, deckCard) => sum + deckCard.quantity, 0);

    // Créer un tableau plat des cartes en répétant selon quantity
    const flattenedCards = deck.deck_cards.flatMap(deckCard => 
        Array(deckCard.quantity).fill(deckCard)
    );

    const handleRemoveCard = async (cardId: number) => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/decks/removeCard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deckId: deck.id, cardId })
            });

            if (response.ok) {
                router.refresh(); // Recharge les données
            } else {
                const error = await response.json();
                console.error("Erreur:", error.error);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCard = async (cardId: number) => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/decks/addCard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deckId: deck.id, cardId })
            });

            if (response.ok) {
                router.refresh(); // Recharge les données
                setAddCard(false);
                setSelectedSlot(null);
            } else {
                const error = await response.json();
                alert(error.error); // Affiche l'erreur (ex: max 2 exemplaires)
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="overflow-y-auto">
            <div className="flex flex-wrap gap-4 p-4">
                {flattenedCards.map((deckCard, index) => (
                    <div 
                        key={`${deckCard.card.id}-${index}`} 
                        className={`relative w-32 h-44 cursor-pointer hover:opacity-80 transition-opacity ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isLoading && handleRemoveCard(deckCard.card.id)}
                    >
                        <Image src={deckCard.card.background_img} alt={deckCard.card.name} className="absolute w-full h-full object-cover" fill />
                        {deckCard.card.third_img && <Image src={deckCard.card.third_img} alt={deckCard.card.name} className="absolute w-full h-full object-cover" fill />}
                        <Image src={deckCard.card.main_img} alt={deckCard.card.name} className="absolute w-full h-full object-cover" fill />
                        
                        {/* Badge de quantité si > 1 */}
                        {deckCard.quantity > 1 && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">
                                {deckCard.quantity}
                            </div>
                        )}
                    </div>
                ))}
                {Array.from({ length: defaultNbCardsPerDeck - totalCards }).map((_, index) => (
                    <div 
                        key={`empty-${index + totalCards}`}
                        className={`relative w-32 h-44 border-2 border-dashed ${
                            selectedSlot === index + totalCards ? "border-yellow-400" : "border-gray-400"
                        } rounded-lg flex items-center justify-center text-gray-500 ${
                            isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-300'
                        } transition-colors`}
                        onClick={() => !isLoading && (setAddCard(true), setSelectedSlot(index + totalCards))}
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
                        <span className="text-base text-gray-500">Cliquez sur une carte pour l&apos;ajouter au deck (max 2 exemplaires par carte)</span>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-4">
                            {collection.map((collectionItem) => {
                                if (!collectionItem.card) return null;
                                
                                // Vérifier combien d'exemplaires sont déjà dans le deck
                                const inDeck = deck.deck_cards.find(dc => dc.card_id === collectionItem.card?.id);
                                const quantity = inDeck?.quantity || 0;
                                const isMaxed = quantity >= 2;
                                
                                return (
                                    <div
                                        key={collectionItem.card.id} 
                                        className={`relative w-32 h-44 cursor-pointer hover:opacity-80 transition-opacity ${
                                            isMaxed || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        onClick={() => !isMaxed && !isLoading && handleAddCard(collectionItem.card!.id)}
                                    >
                                        <Image src={collectionItem.card.background_img} alt={collectionItem.card.name} className="absolute w-full h-full object-cover" fill />
                                        {collectionItem.card.third_img && <Image src={collectionItem.card.third_img} alt={collectionItem.card.name} className="absolute w-full h-full object-cover" fill />}
                                        <Image src={collectionItem.card.main_img} alt={collectionItem.card.name} className="absolute w-full h-full object-cover" fill />
                                        
                                        {/* Badge montrant combien sont dans le deck */}
                                        {quantity > 0 && (
                                            <div className={`absolute top-2 right-2 ${isMaxed ? 'bg-red-500' : 'bg-blue-500'} text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm`}>
                                                {quantity}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        </main>
    )
}