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

// Effet générique pour les artefacts offensifs (ex: TNT, Boule de feu...)
export function applyArtifactDamage(
  io: Server,
  roomId: string,
  state: CombatState,
  opponent: Player,
  targetIndex: number,
  damage: number,
  sourceName: string
): void {
  const targetCard = opponent.board[targetIndex];

  if (!targetCard) {
    state.log.push(`Cible inexistante pour ${sourceName}.`);
    return;
  }

  if (targetCard.pv_durability !== undefined) {
    const finalDamage = applyArmorEffect(targetCard, damage, state);
    targetCard.pv_durability -= finalDamage;
    state.log.push(`${sourceName} inflige ${finalDamage} dégâts à ${targetCard.name} !`);

    if (targetCard.pv_durability <= 0) {
      // Gestion des dégâts excédentaires (Trample)
      if (targetCard.pv_durability < 0) {
        transfertDamageToPlayer(state, Math.abs(targetCard.pv_durability), opponent, sourceName);
      }

      state.log.push(`${targetCard.name} a explosé et est détruit !`);
      opponent.board.splice(targetIndex, 1);
      opponent.discard.push(targetCard);

      // On vérifie les synergies (ex: Golem perd son buff si Villageois meurt)
      checkVillageGuardian(opponent, io, roomId);
    }
  }
}

// Effet spécifique : Soigne un Golem allié
export function healGolem(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player, // Le joueur propriétaire du Golem
  targetIndex: number,
  amount: number,
  sourceName: string
): void {
  const targetCard = player.board[targetIndex];

  if (!targetCard) return;

  // Vérification de sécurité supplémentaire (normalement filtré en amont)
  if (targetCard.name !== "Golem") {
    state.log.push(`${sourceName} ne peut être utilisé que sur un Golem.`);
    return;
  }

  if (targetCard.pv_durability !== undefined) {
    const max = targetCard.max_pv ?? targetCard.pv_durability;
    // On ne soigne pas au-delà du max
    const healAmount = Math.min(amount, max - targetCard.pv_durability);
    
    targetCard.pv_durability += healAmount;
    state.log.push(`${sourceName} répare ${targetCard.name} de ${healAmount} PV.`);
  }
}