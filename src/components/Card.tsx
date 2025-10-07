import Image from "next/image";
import { Heart } from "lucide-react";

export default function Card({ undescovered = false }: { undescovered?: boolean }) {
    return (
        <div className="card self-center w-fit min-w-[230px] h-full content-center relative">
            <Heart className="absolute z-50 card-heart" color="red" />
            <Image
                className="w-fit h-full z-40"
                src={undescovered ? "/cards/enderman.png" : "/cards/creeper.png"}
                alt="Creeper card"
                width={230}
                height={300}
            />
        </div>
    );
}