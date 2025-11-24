import { Actions, CombatState, checkEnergy } from "./combatActions";
import { Card, Player } from "../../src/types";

export interface Attack {
  cost: number;
  autoActivate?: boolean;
  execute: (
    state: CombatState,
    attacker: Card,
    target: Card | null,
    player: Player,
    opponent: Player
  ) => { killed?: boolean } | void;
}

export const attackList: Record<string, Attack> = {
  morsure: {
    cost: 1,
    execute(state, attacker, target, player, opponent) {
      if (!checkEnergy(state, player, 1, "Morsure")) return;
      return Actions.dealDamage(state, attacker, target, 10, opponent);
    }
  },

  griffure: {
    cost: 1,
    execute(state, attacker, target, player, opponent) {
      if (!checkEnergy(state, player, 1, "Griffure")) return;
      return Actions.dealDamage(state, attacker, target, 10, opponent);
    }
  },

  regeneration: {
    cost: 1,
    autoActivate: true,
    execute(state, attacker, target, player) {
      if (!checkEnergy(state, player, 1, "Régénération")) return;
      Actions.heal(state, attacker, 15);
    }
  },

  drain: {
    cost: 2,
    execute(state, attacker, target, player, opponent) {
      if (!checkEnergy(state, player, 2, "Drain")) return;
      const result = Actions.dealDamage(state, attacker, target, 15, opponent);
      Actions.heal(state, attacker, 10);
      state.log.push(`${attacker.name} vole 10 PV`);
      return result;
    }
  }
};
