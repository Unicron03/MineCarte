import { InGameCard, Player, CombatState, Action } from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage } from "./../testEffectFonctions";


// Pioche une ou plusieurs cartes
export function drawCard(
  state: CombatState,
  player: Player,
  count: number
): void {

  let drawn = 0;

  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) break;
    player.hand.push(player.deck.shift()!);
    drawn++;
  }

  state.log.push(
    `${player.id} pioche ${drawn} carte(s)`
  );
}