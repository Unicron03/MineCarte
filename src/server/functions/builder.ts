import type { InGameCard, Player} from "../../typesPvp";
import { randomUUID } from "crypto";

// Crée une carte en jeu
export const createCard = (name: string, cost: number,  category: "mob" | "equipement" | "artefact",  pv_durability: number | null,  talent: string | null,  attack1: string | null,  attack2: string | null): InGameCard => {
    const base = { uuid: randomUUID(), name, imageName: name.toLowerCase(), cost};

    if (category === "mob") {
        const mobCard: InGameCard = {
            ...base,
            category: "mob",
            max_pv: pv_durability ?? 0,
            pv_durability: pv_durability ?? 0,
            talent: talent,
            attack1: attack1,
            attack2: attack2,
        };
        return mobCard;
    }

    const otherCard: InGameCard = { ...base, category, effet: talent ?? undefined };
    return otherCard;
};


// Créer un joueur
export function createPlayer( socketId: string, deck: InGameCard[], token: string, userId?: string): Player {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);

  // Pioche initiale de 3 cartes
  const hand = shuffled.splice(0, 3);
  return {
    id: socketId,
    token,
    userId,
    energie: 0,
    deck: shuffled,
    hand,
    pv: 100,
    board: [],
    discard: [],
    turnCount: 0,
    effects: [],
    _disconnectedAt: null,
    pendingAction: null,
  };
}
