/* eslint-disable @next/next/no-img-element */
import type { InGameCard } from "@/typesPvp";

export const EquipmentBadge = ({ equipment }: { equipment?: InGameCard[] }) => {
    if (!equipment || equipment.length === 0) return null;

    return (
        <div className="absolute -top-3 -right-3 z-10 flex flex-col gap-1">
            {equipment.map((eq, idx) => (
                <div
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-800 overflow-hidden shadow-md"
                    title={eq.name}
                >
                    <img
                        src={`/cards/${eq.imageName}.png`}
                        alt={eq.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "/cards/default.png";
                            e.currentTarget.onerror = null;
                        }}
                    />
                </div>
            ))}
        </div>
    );
};