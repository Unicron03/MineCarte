import { Server } from "socket.io";
import { InGameCard, Player, CombatState, Action } from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage, checkVillageGuardian } from "./../testEffectFonctions";
import { drawCard } from "./talentFunction";
import { transfertDamageToPlayer } from "./attackFunction";

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

// Pioche un certain nombre de cartes
export function drawCardsEffect(
  state: CombatState,
  player: Player,
  amount: number
): void {
  drawCard(state, player, amount);
}

// Effet TNT : Inflige des dégâts à un mob ennemi
export function tntEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  opponent: Player,
  targetIndex: number,
  damage: number
): void {
  const targetCard = opponent.board[targetIndex];

  if (!targetCard) {
    state.log.push(`${player.id} a essayé d'utiliser TNT sur une cible inexistante.`);
    return;
  }

  if (targetCard.pv_durability !== undefined) {
    const finalDamage = applyArmorEffect(targetCard, damage, state);
    targetCard.pv_durability -= finalDamage;
    state.log.push(`${player.id} lance une TNT sur ${targetCard.name} et inflige ${finalDamage} dégâts !`);

    if (targetCard.pv_durability <= 0) {
      // Gestion des dégâts excédentaires (Trample)
      if (targetCard.pv_durability < 0) {
        transfertDamageToPlayer(state, Math.abs(targetCard.pv_durability), opponent, "TNT");
      }

      state.log.push(`${targetCard.name} a explosé et est détruit !`);
      opponent.board.splice(targetIndex, 1);
      opponent.discard.push(targetCard);

      // On vérifie les synergies (ex: Golem perd son buff si Villageois meurt)
      checkVillageGuardian(opponent, io, roomId);
    }
  }
}