import { Card, Player } from "../../src/types";

export interface CombatState {
  log: string[];
}

export const Actions = {
  dealDamage(
    state: CombatState,
    attacker: Card,
    target: Card | null,
    amount: number,
    opponent?: Player
  ) {
    // --- Attaque directe sur joueur ---
    if (!target && opponent) {
      opponent.pv -= amount;
      state.log.push(`${attacker.name} inflige ${amount} dégâts au joueur !`);

      if (opponent.pv <= 0) return { killed: true };
      return { killed: false };
    }

    // --- Attaque sur carte ---
    if (!target) return;
    
    target.vie -= amount;
    state.log.push(`${attacker.name} inflige ${amount} dégâts à ${target.name}`);

    if (target.vie <= 0) return { killed: true };
    return { killed: false };
  },

  heal(state: CombatState, target: Card, amount: number) {
    target.vie += amount;
    state.log.push(`${target.name} récupère ${amount} PV`);
  },

  drawCard(state: CombatState, player: Player, count: number) {
    for (let i = 0; i < count; i++) {
      if (player.deck.length === 0) break;
      player.hand.push(player.deck.shift()!);
    }
    state.log.push(`${player.id} pioche ${count} carte(s)`);
  }
};

// === Vérifier énergie ===
export function checkEnergy(
  state: CombatState,
  player: Player,
  cost: number,
  attackName: string
): boolean {
  if (player.energie < cost) {
    state.log.push(`Pas assez d'énergie pour ${attackName}`);
    return false;
  }

  player.energie -= cost;
  return true;
}
