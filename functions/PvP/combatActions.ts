import { InGameCard, Player, CombatState } from "../../src/types";

export const Actions = {
  dealDamage(
    state: CombatState,
    attacker: InGameCard,
    target: InGameCard | null,
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
    
    if (target.category !== "mob" || target.pv_durability === undefined) {
      state.log.push(
        `${attacker.name} ne peut pas attaquer ${target.name} : ce n'est pas une carte mob.`
      );
      return { killed: false };
    }

    // --- Attaque sur mob ---
    target.pv_durability -= amount;
    state.log.push(`${attacker.name} inflige ${amount} dégâts à ${target.name}`);

    return { killed: target.pv_durability <= 0 };
  },

  heal(state: CombatState, target: InGameCard, amount: number) {
    // impossibilité de heal un équipement / artefact
    if (target.category !== "mob" || target.pv_durability === undefined) {
      state.log.push(
        `${target.name} ne peut pas être soigné : ce n'est pas une carte mob.`
      );
      return;
  }

  target.pv_durability += amount;
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
