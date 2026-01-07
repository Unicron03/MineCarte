import Image from "next/image";
import { Prisma } from "../../generated/prisma/client";
import { backCard } from "@/types";

type DeckCardsWithCards = Prisma.deck_cardsGetPayload<{
    include: {
        card: true
    }
}>[];

export default function DeckVisualiser({ deckName, deckCards }:  { deckName: string, deckCards: DeckCardsWithCards }) {
    // Crée un tableau de 3 éléments, avec les cartes existantes ou null
    const displayCards = Array.from({ length: 3 }, (_, index) => deckCards[index] || null);

    return (
        <div className="inline-flex flex-col items-center gap-4">
            <div className="relative h-[calc(300px+2rem)] w-[calc(230px+2rem)]">
                {displayCards.map((deckCard, index) => (
                    <div
                        key={deckCard?.id || `empty-${index}`}
                        className="absolute w-[230px] h-[300px]"
                        style={{
                            left: `${2 - index}rem`,
                            top: `${index}rem`,
                            zIndex: index
                        }}
                    >
                        {deckCard?.card ? (
                            <>
                                <Image
                                    src={deckCard.card.background_img}
                                    alt={deckCard.card.name}
                                    className="absolute"
                                    width={230}
                                    height={300}
                                />
                                {deckCard.card.third_img && (
                                    <Image
                                        src={deckCard.card.third_img}
                                        alt={deckCard.card.name}
                                        className="absolute"
                                        width={230}
                                        height={300}
                                    />
                                )}
                                <Image
                                    src={deckCard.card.main_img}
                                    alt={deckCard.card.name}
                                    className="absolute"
                                    width={230}
                                    height={300}
                                />
                            </>
                        ) : (
                            <>
                                <Image
                                    src={backCard.background_img}
                                    alt={backCard.name}
                                    className="absolute"
                                    width={230}
                                    height={300}
                                />
                                {backCard.third_img && (
                                    <Image
                                        src={backCard.third_img}
                                        alt={backCard.name}
                                        className="absolute"
                                        width={230}
                                        height={300}
                                    />
                                )}
                                <Image
                                    src={backCard.main_img}
                                    alt={backCard.name}
                                    className="absolute"
                                    width={230}
                                    height={300}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>

            <span className="text-xl font-bold truncate max-w-[calc(230px+2rem)]" title={deckName}>
                {deckName}
            </span>
        </div>
    )
}