"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { RoundedStar } from "@smastrom/react-rating";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shadcn/ui/dialog";
import { Rating } from '@smastrom/react-rating'
import Atropos from "atropos/react";
import { Separator } from "@/shadcn/ui/separator";
import { Card } from "@/types";
import AtroposCard from "./cards/AtroposCard";

const ratingStyle = {
    itemShapes: RoundedStar,
    activeFillColor: '#ffb700',
    inactiveFillColor: '#fbf1a9'
}

export default function CardPopupDetails({ undescovered = true, card }: { undescovered?: boolean, card: Card}) {
    const onclick = () => { console.log("Clicked on favorite") };

    return (
        <div className="card self-center w-fit min-w-[230px] max-w-[230px] h-full content-center relative">
            {undescovered &&
                <Star size={24} className="absolute z-50 card-star cursor-pointer" color="gold" fill="gold" onClick={onclick}/>
            }
            
            <Dialog>
                <DialogTrigger asChild>
                    {/* <Image
                        className="w-fit h-auto z-40"
                        src={undescovered ? "/cards/enderman.png" : "/cards/creeper.png"}
                        alt="Creeper card"
                        width={230}
                        height={300}
                    /> */}
                    <AtroposCard card={card} />
                </DialogTrigger>

                <DialogContent className="sm:max-w-[800px] h-fit bg-white dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="self-center">{card.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-8">
                        <div className="flex flex-col items-center min-w-[350px]">
                            <Atropos className="atropos-banner p-4" highlight={false}>
                                <Image
                                    className="atropos-banner-spacer"
                                    src="/cards/creeper/back.png"
                                    alt="Creeper card"
                                    width={230}
                                    height={300}
                                />
                                <Image
                                    data-atropos-offset="-2"
                                    className="w-fit h-full z-40"
                                    src={card.background_img}
                                    alt={card.name}
                                    width={230}
                                    height={300}
                                />
                                {card.third_img &&
                                    <Image
                                        data-atropos-offset="0"
                                        className="w-fit h-full z-40"
                                        src={card.third_img}
                                        alt={card.name}
                                        width={230}
                                        height={300}
                                    />
                                }
                                <Image
                                    data-atropos-offset="2"
                                    className="w-fit h-full z-40"
                                    src={card.main_img}
                                    alt={card.name}
                                    width={230}
                                    height={300}
                                />
                            </Atropos>

                            <div className="flex items-center gap-2">
                                <Star className="card-star" color="gold" fill="none" />
                                <span>Ajouter dans la vitrine</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 text-base font-medium my-8">
                            <div className="flex items-center gap-4 justify-between">
                                <span>Rareté :</span>
                                <Rating style={{maxWidth: 150}} value={card.rarity} readOnly itemStyles={ratingStyle} />
                            </div>
                            
                            <Separator />

                            <span>Talent : /</span>

                            <Separator />

                            <span>Attaque 1 : /</span>
                            <span>Attaque 2 : /</span>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span>Numéro de la carte :</span>
                                <span>{card.id}</span>
                            </div>
                            
                            <Separator />

                            <span>Ce mob possède une super description qu&apos;il faudra changer pour chacun</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}