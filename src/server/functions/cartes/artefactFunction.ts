import { Server } from "socket.io";
import { InGameCard, Player, CombatState, Action } from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage } from "./../testEffectFonctions";
import { checkVillageGuardian, handleMobDeath } from "../gameLogic";
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

      handleMobDeath(io, roomId, opponent, targetIndex, state.log);
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
    handleMobDeath(io, roomId, opponent, targetIndex, state.log);
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

  // On utilise handleMobDeath pour gérer l'équipement, mais on personnalise le log si besoin
  // Ici handleMobDeath va ajouter "X est mort !", ce qui est acceptable pour une défausse forcée
  handleMobDeath(io, roomId, player, targetIndex, state.log);
  state.log.push(`${sourceName} téléporte ${targetCard.name} dans le néant (Défaussé).`);
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

// Effet Potion d'invisibilité : Rend un mob invisible
export function giveInvisibleEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  targetIndex: number,
  sourceName: string
): void {
  const targetCard = player.board[targetIndex];
  if (!targetCard) return;

  if (!targetCard.effects) targetCard.effects = [];

  if (!targetCard.effects.includes("Invisible")) {
    targetCard.effects.push("Invisible");
    state.log.push(`${sourceName} rend ${targetCard.name} invisible !`);
  } else {
    state.log.push(`${targetCard.name} est déjà invisible.`);
  }
}

// Effet Seau de lave : Applique Brûlure (3 tours)
export function applyBurnEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  opponent: Player,
  targetIndex: number,
  sourceName: string
): void {
  const targetCard = opponent.board[targetIndex];
  if (!targetCard) return;

  if (!targetCard.effects) targetCard.effects = [];

  // On retire une éventuelle brûlure existante pour réinitialiser la durée
  const existingBurn = targetCard.effects.find(e => e.startsWith("Burn_"));
  if (existingBurn) {
    const index = targetCard.effects.indexOf(existingBurn);
    targetCard.effects.splice(index, 1);
  }

  // Ajout de l'effet Brûlure pour 3 tours (Format: Burn_DUREE)
  targetCard.effects.push("Burn_3");
  state.log.push(`${sourceName} enflamme ${targetCard.name} ! (Brûlure 3 tours)`);
}

// Effet Pomme dorée : Soin + Dégâts (3 tours)
export function applyGoldenAppleEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  targetIndex: number,
  sourceName: string
): void {
  const targetCard = player.board[targetIndex];
  if (!targetCard) return;

  if (!targetCard.effects) targetCard.effects = [];

  // On retire un effet existant pour réinitialiser la durée
  const existing = targetCard.effects.find(e => e.startsWith("GoldenApple_"));
  if (existing) {
    const index = targetCard.effects.indexOf(existing);
    targetCard.effects.splice(index, 1);
  }

  targetCard.effects.push("GoldenApple_3");
  state.log.push(`${sourceName} donne de la force et régénère ${targetCard.name} ! (3 tours)`);
}

// Effet Table d'enchantement : Les équipements coûtent 1 énergie ce tour
export function applyEnchantmentTableEffect(
  io: Server,
  roomId: string,
  player: Player,
  sourceName: string
): void {
  if (!player.effects) player.effects = [];
  if (!player.effects.includes("Table d'enchantement")) {
    player.effects.push("Table d'enchantement");
    io.to(roomId).emit("log", `${sourceName} s'active : Les équipements coûtent 1 énergie ce tour.`);
  } else {
    io.to(roomId).emit("log", `${sourceName} est déjà actif.`);
  }
}

// Effet Portail de l'End : Soigne Enderman, Shulker ou Ender Dragon
export function healEndCreature(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  targetIndex: number,
  amount: number,
  sourceName: string
): void {
  const targetCard = player.board[targetIndex];

  if (!targetCard) return;

  const validNames = ["Enderman", "Shulker", "Ender Dragon"];
  if (!validNames.includes(targetCard.name)) {
    state.log.push(`${sourceName} ne peut être utilisé que sur une créature de l'End.`);
    return;
  }

  if (targetCard.pv_durability !== undefined) {
    const max = targetCard.max_pv ?? targetCard.pv_durability;
    const healAmount = Math.min(amount, max - targetCard.pv_durability);
    
    targetCard.pv_durability += healAmount;
    state.log.push(`${sourceName} régénère ${targetCard.name} de ${healAmount} PV.`);
  }
}

// Helper : Récupère les équipements candidats à la récupération (Simplifié)
export function getAnvilCandidates(player: Player): InGameCard[] {
  // On peut récupérer n'importe quel équipement de la défausse
  return player.discard.filter(c => c.category === "equipement");
}

// Vérifie si l'Enclume peut être jouée (utilisé dans playCard pour empêcher l'action)
export function checkAnvilCondition(player: Player): { valid: boolean; msg?: string } {
  const discardEquipments = player.discard.filter(c => c.category === "equipement");
  
  if (discardEquipments.length === 0) {
    return { valid: false, msg: "Vous n'avez pas d'équipement dans votre défausse." };
  }

  return { valid: true };
}

// Effet Enclume : Récupère un équipement de la défausse
// Condition : Nombre en défausse > Nombre équipés sur le plateau
export function anvilEffect(
  io: Server,
  roomId: string,
  player: Player,
  sourceName: string
): void {
  // On récupère les candidats (la vérification a déjà été faite dans playCard normalement)
  const recoverableCandidates = getAnvilCandidates(player);

  if (recoverableCandidates.length === 0) return;

  // 4. Choisir un équipement aléatoire parmi les candidats valides
  const randomIndex = Math.floor(Math.random() * recoverableCandidates.length);
  const cardToRecover = recoverableCandidates[randomIndex];

  // 5. Déplacer de la défausse vers la main
  const realIndexInDiscard = player.discard.indexOf(cardToRecover);
  if (realIndexInDiscard !== -1) {
    player.discard.splice(realIndexInDiscard, 1);
    player.hand.push(cardToRecover);
    io.to(roomId).emit("log", `${sourceName} forge à nouveau ${cardToRecover.name} et l'ajoute à votre main !`);
  }
}