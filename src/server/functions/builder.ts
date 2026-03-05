import type { InGameCard, Player, Action } from "../../components/utils/typesPvp";
import { randomUUID } from "crypto";



type PrismaAction = {
  id: number;
  name: string;
  description: string | null;
  damage: number | null;
  cost: number;
  autoActivate: boolean;
  requiresTarget: boolean;
  targetType: "ally" | "enemy" | null;
  function_name: string;
};


export function buildActionList(prismaActions: PrismaAction[]): Action[] {
  console.log("[Builder] Reçu depuis Prisma :", prismaActions);

  const actions = prismaActions.map((action, index) => {
    const built = {
      id: action.id,
      name: action.name,
      damage: action.damage ?? 0,
      cost: action.cost ?? 0,
      description: action.description ?? "",
      function: action.function_name,
      requiresTarget: action.requiresTarget,
      targetType: action.targetType ?? undefined,
      autoActivate: action.autoActivate,
    };

    console.log(`[Builder] Action #${index}`, built);
    return built;
  });

  console.log("[Builder] Liste finale :", actions);
  return actions;
}



// Crée une carte en jeu
export const createCard = (
  name: string, 
  imageName: string, 
  cost: number,  
  category: "mob" | "equipement" | "artefact",  
  pv_durability: number | null,  
  talent: string | null,  
  attack1: string | null,  
  attack2: string | null
): InGameCard => {
    const base = { uuid: randomUUID(), name, imageName, cost};

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

    const otherCard: InGameCard = { 
      ...base, 
      category, 
      effet: talent ?? undefined 
    };
    return otherCard;
};

// Créer un joueur
export function createPlayer(
  socketId: string, 
  deck: InGameCard[], 
  token: string, 
  userId?: string
): Player {
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