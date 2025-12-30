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

// Effet End Crystal : Divise la vie par 2
export function halveLifeEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  opponent: Player,
  targetIndex: number,
  sourceName: string
): void {
  const targetCard = opponent.board[targetIndex];

  if (!targetCard || targetCard.pv_durability === undefined) {
    state.log.push(`Cible invalide pour ${sourceName}.`);
    return;
  }

  const damage = Math.ceil(targetCard.pv_durability / 2);
  targetCard.pv_durability -= damage;
  state.log.push(`${sourceName} réduit la vie de ${targetCard.name} de moitié (-${damage} PV) !`);

  if (targetCard.pv_durability <= 0) {
    state.log.push(`${targetCard.name} est détruit !`);
    opponent.board.splice(targetIndex, 1);
    opponent.discard.push(targetCard);
    checkVillageGuardian(opponent, io, roomId);
  }
}

// Effet Ender Pearl : Défausse une carte de son propre plateau
export function discardOwnCard(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  targetIndex: number,
  sourceName: string
): void {
  const targetCard = player.board[targetIndex];
  if (!targetCard) return;

  player.board.splice(targetIndex, 1);
  player.discard.push(targetCard);
  state.log.push(`${sourceName} téléporte ${targetCard.name} dans le néant (Défaussé).`);
  
  // On vérifie les synergies (ex: Si on a défaussé un Villageois, les Golems perdent leur buff)
  checkVillageGuardian(player, io, roomId);
}

// Effet Canne à pêche : 75% vol 2 énergies, 25% donne 2 énergies
export function fishingRodEffect(
  state: CombatState,
  player: Player,
  opponent: Player
): void {
  const rand = Math.random();
  const amount = 2;

  if (rand < 0.75) {
    // 75% chance : Voler (limité à ce que l'adversaire possède)
    const stolen = Math.min(opponent.energie, amount);
    opponent.energie -= stolen;
    player.energie += stolen;
    state.log.push(`${player.id} utilise Canne à pêche et vole ${stolen} énergie(s) à l'adversaire !`);
  } else {
    // 25% chance : Donner (Maladresse)
    opponent.energie += amount;
    state.log.push(`Oups ! ${player.id} s'emmêle les fils et donne ${amount} énergie(s) à l'adversaire.`);
  }
}