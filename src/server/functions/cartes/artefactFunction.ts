import { InGameCard, Player, CombatState, Action } from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage } from "./../testEffectFonctions";

// Soigne le joueur directement
export function healPlayer(
  state: CombatState,
  player: Player,
  amount: number
): void {
  const maxPv = 100; // PV max du joueur
  if (player.pv >= maxPv) {
    state.log.push(`${player.id} est déjà au max de ses PV.`);
    return;
  }
  const healAmount = Math.min(amount, maxPv - player.pv);
  player.pv += healAmount;
  state.log.push(`${player.id} se repose et récupère ${healAmount} PV.`);
}