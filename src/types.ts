export type Card = {
  name: string;
  cost: number;
  attack: number;
};

export type Player = {
  id: string;
  cost: number;
  hand: Card[];
  board: Card[];
};

export type GameState = {
  roomId: string;
  players: Player[];
  turnIndex: number;
};
