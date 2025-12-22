import { exampleDeck } from "@/data";
import Image from "next/image";

export default function DeckVisualiser() {
    const cardsToDisplay = exampleDeck.cards.slice(0, 3);

    return (
        <div className="inline-flex flex-col items-center gap-4">
            <div className="relative h-[calc(300px+2rem)] w-[calc(230px+2rem)]">
                {cardsToDisplay.map((card, index) => (
                    <div
                        key={card.id}
                        className="absolute w-[230px] h-[300px]"
                        style={{
                            left: `${2 - index}rem`,
                            top: `${index}rem`,
                            zIndex: index
                        }}
                    >
                        <Image
                            src={card.background_img}
                            alt={card.name}
                            className="absolute"
                            width={230}
                            height={300}
                        />
                        {card.third_img &&
                            <Image
                                src={card.third_img}
                                alt={card.name}
                                className="absolute"
                                width={230}
                                height={300}
                            />
                        }
                        <Image
                            src={card.main_img}
                            alt={card.name}
                            className="absolute"
                            width={230}
                            height={300}
                        />
                    </div>
                ))}
            </div>

            <span className="font-medium text-2xl">{exampleDeck.name}</span>
        </div>
    )
}