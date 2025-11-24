// === CARTES ===
export type Card = {
  name: string;
  cost: number;
  vie: number;
  attack1?: string;
  attack2?: string;
  talent?: string;
  imageName?: string;
};

// === JOUEUR ===
export type Player = {
  id: string;
  energie: number;
  pv: number;
  hand: Card[];
  board: Card[];
  deck: Card[];
  discard: Card[];
  turnCount: number;
};

// === ÉTAT DU JEU ===
export type GameState = {
  roomId: string;
  players: Player[];
  turnIndex: number;
};

// === ACTION D'ATTAQUE TEXTUELLE ===
export type Action = {
  name: string;
  description?: string;
  damage: number;
  cost: number;
  multiTarget?: boolean;
  autoActivate?: boolean;
  function?: string;
};

// === CARTE INIT (DB / Builder) ===
export type CardInfo = {
  name: string;
  imageName: string;
  talent?: string;
  attack1?: string;
  attack2?: string;
  baseVie?: number;
  baseCost?: number;
};


// === Liste des actions (exemples) ===
export const actionList: Action[] = [
  { name: "Morsure", damage: 10, cost: 1, description: "Une morsure violente." },
  { name: "Affamé", damage: 5, cost: 0, description: "Attaque faible mais gratuite." },
];

// debug startup
console.log("Server actionList:", actionList.map(a => `${a.name}:${a.damage}`).join(" | "));

// === Liste des cartes ===
export const cardList: CardInfo[] = [
  {
    name: "Zombie",
    imageName: "zombie",
    attack1: "Morsure",
    attack2: "Affamé",
    baseVie: 25,
    baseCost: 1,
  },
  // tu peux en rajouter d'autres
];