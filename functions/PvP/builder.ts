import type { InGameCard, Player} from "../../src/types";

export const createCard = (
  name: string,
  cost: number,
  category: string,
  pv_durability: number | null,
  talent: string | null,
  attack1: string | null,
  attack2: string | null
): InGameCard => {

  const base = {
    name,
    imageName: name.toLowerCase(),
    cost,
    talent:  talent ?? undefined,
    attack1: attack1 ?? undefined,
    attack2: attack2 ?? undefined
  };

  if (category === "mob") {
    return {
      ...base,
      category: "mob",
      pv_durability: pv_durability ?? 0
    };
  }

  return {
    ...base,
    category: category as "equipement" | "artefact",
  };
};


// Créer un joueur
export function createPlayer(
  socketId: string,
  deck: InGameCard[],
  token: string,
  userId?: string
): Player {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const hand = shuffled.splice(0, 3); // 3 cartes pour commencer
  return {
    id: socketId,
    token,
    userId,
    energie: 0, // énergie initiale
    deck: shuffled,
    hand,
    pv: 100,
    board: [],
    discard: [],
    turnCount: 0,
    _disconnectedAt: null,
  };
}
