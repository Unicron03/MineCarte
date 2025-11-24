// --- builder.ts ---

import type { CardInfo } from "../../src/types";

// Étendre CardInfo pour ajouter cost et vie
export interface Card extends CardInfo {
  cost: number;
  vie?: number;
}

// Créer une carte
export const createCard = (
  name: string,
  cost: number,
  talent?: string,
  attack1?: string,
  attack2?: string,
  vie?: number
): Card => ({
  name,
  imageName: name.toLowerCase(), // obligatoire pour CardInfo
  cost,
  vie,
  talent,
  attack1,
  attack2,
});

// Définir le type complet d'un joueur
export interface Player {
  id: string;
  token: string;
  userId?: string;
  energie: number;
  pv: number;
  deck: Card[];
  hand: Card[];
  board: Card[];
  discard: Card[];
  turnCount: number;
  _disconnectedAt: number | null;
}

// Créer un joueur
export function createPlayer(
  socketId: string,
  deck: Card[],
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
