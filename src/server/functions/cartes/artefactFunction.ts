import { Server } from "socket.io";
import { InGameCard, Player, CombatState, Action } from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage } from "./../testEffectFonctions";
import { checkVillageGuardian, handleMobDeath } from "../gameLogic";
import { drawCard } from "./talentFunction";
import { transfertDamageToPlayer } from "./attackFunction";


//Applique un effet à un joueur pour une certaine durée.
export function applyEffect(state: CombatState, player: Player, action: Action): void {

    // --- Initialisation du tableau d'effets si nécessaire ---
    if (!player.effects) player.effects = [];

    // --- Ajoute l'effet au joueur ---
    player.effects.push(action.name);
    state.log.push(`[Effet] ${player.id} est affecté par "${action.name}".`);
}

// Soigne le joueur directement
export function healPlayer(state: CombatState, player: Player, amount: number): void {
  
    // --- Limite de PV du joueur ---
    const maxPv = 100;

    // --- On ne soigne pas au-delà du max ---
    if (player.pv >= maxPv) {
        state.log.push(`${player.id} est déjà au max de ses PV.`);
        return;
    }

    // --- Calcul du soin nécessaire ---
    const healAmount = Math.min(amount, maxPv - player.pv);

    // --- Application du soin ---
    player.pv += healAmount;
    state.log.push(`${player.id} se repose et récupère ${healAmount} PV.`);
}

// Pioche un certain nombre de cartes
export function drawCardsEffect(state: CombatState, player: Player, amount: number): void {
   drawCard(state, player, amount);
}

// Effet générique pour les artefacts offensifs
export function applyArtifactDamage(io: Server, roomId: string, state: CombatState, opponent: Player, targetIndex: number, damage: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = opponent.board[targetIndex];

    // --- Vérification de la cible ---
    if (!targetCard) {
        state.log.push(`Cible inexistante pour ${sourceName}.`);
        return;
    }

    if (targetCard.pv_durability !== undefined) {

        // --- Calcul des dégâts avec armure ---
        const finalDamage = applyArmorEffect(targetCard, damage, state);

        // --- Application des dégâts ---
        targetCard.pv_durability -= finalDamage;
        state.log.push(`${sourceName} inflige ${finalDamage} dégâts à ${targetCard.name} !`);

        if (targetCard.pv_durability <= 0) {

            // --- Gestion des dégâts supplémentaires au joueur si la carte meurt ---
            if (targetCard.pv_durability < 0) {
                transfertDamageToPlayer(state, Math.abs(targetCard.pv_durability), opponent, sourceName);
            }

            // --- Gestion de la mort de la carte ---
            handleMobDeath(io, roomId, opponent, targetIndex, state.log);
        }
    }
}

// Soigne un Golem allié
export function healGolem(state: CombatState, player: Player, targetIndex: number, amount: number, sourceName: string): void {
  
    // --- Vérification de la cible ---
    const targetCard = player.board[targetIndex];

    // --- Cible inexistante ---
    if (!targetCard) return;

    // --- Vérification si la cible est un Golem ---
    if (targetCard.name !== "Golem") {
        state.log.push(`${sourceName} ne peut être utilisé que sur un Golem.`);
        return;
    }

    if (targetCard.pv_durability !== undefined) {

        // --- Soin maximum ---
        const max = targetCard.max_pv ?? targetCard.pv_durability;

        // --- Calcul du soin nécessaire ---
        const healAmount = Math.min(amount, max - targetCard.pv_durability);
        
        // --- Application du soin ---
        targetCard.pv_durability += healAmount;
        state.log.push(`${sourceName} répare ${targetCard.name} de ${healAmount} PV.`);
    }
}

// Divise la vie par 2 les pv d'une carte adverse
export function halveLifeEffect(io: Server, roomId: string, state: CombatState, opponent: Player, targetIndex: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = opponent.board[targetIndex];

    // --- Vérification de la cible ---
    if (!targetCard || targetCard.pv_durability === undefined) {
        state.log.push(`Cible invalide pour ${sourceName}.`);
        return;
    }

    // --- Calcul des dégâts ---
    const damage = Math.ceil(targetCard.pv_durability / 2);

    // --- Application de la réduction de vie ---
    targetCard.pv_durability -= damage;
    state.log.push(`${sourceName} réduit la vie de ${targetCard.name} de moitié (-${damage} PV) !`);

    // --- Gestion de la mort de la carte ---
    if (targetCard.pv_durability <= 0) {
        handleMobDeath(io, roomId, opponent, targetIndex, state.log);
    }
}

// Défausser une carte de son propre plateau
export function discardOwnCard(io: Server, roomId: string, state: CombatState, player: Player, targetIndex: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = player.board[targetIndex];
    
    // --- Vérification de la cible ---
    if (!targetCard) return;

    // --- Gestion de la mort de la carte ---
    handleMobDeath(io, roomId, player, targetIndex, state.log);
    state.log.push(`${sourceName} téléporte ${targetCard.name} dans le néant.`);
}

// Canne à pêche : 75% de voler 2 énergies, mais 25% de donner 2 énergies
export function fishingRodEffect(state: CombatState, player: Player, opponent: Player): void {
  
    // --- Gestion de l'aléatoire ---
    const rand = Math.random();
    const amount = 2;

    if (rand < 0.75) {

        // 75% chance de voler (limité à ce que l'adversaire possède)
        const stolen = Math.min(opponent.energie, amount);
        opponent.energie -= stolen;
        player.energie += stolen;
        state.log.push(`${player.id} utilise Canne à pêche et vole ${stolen} énergie(s) à l'adversaire !`);
    } else {
      
        // 25% chance de donner (limité à ce que vous possèdé)
        const give = Math.min(player.energie, amount);
        opponent.energie += give;
        player.energie -= give;
        state.log.push(`Oups ! ${player.id} s'emmêle les fils et donne ${amount} énergie(s) à l'adversaire.`);
    }
}

// Rend un mob invisible
export function giveInvisibleEffect(state: CombatState, player: Player, targetIndex: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = player.board[targetIndex];
    
    // --- Vérification de la cible ---
    if (!targetCard) return;

    // --- Application de l'effet ---
    if (!targetCard.effects) targetCard.effects = [];

    // --- Vérifie si l'effet Invisible est déjà présent ---
    if (!targetCard.effects.includes("Invisible")) {
        targetCard.effects.push("Invisible");
        state.log.push(`${sourceName} rend ${targetCard.name} invisible !`);
    } else {
        state.log.push(`${targetCard.name} est déjà invisible.`);
    }
}

// Applique Brûlure (3 tours)
export function applyBurnEffect(state: CombatState, opponent: Player, targetIndex: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = opponent.board[targetIndex];
    
    // --- Vérification de la cible ---
    if (!targetCard) return;

    // --- Application de l'effet ---
    if (!targetCard.effects) targetCard.effects = [];

    // --- On retire une éventuelle brûlure existante pour réinitialiser la durée ---
    const existingBurn = targetCard.effects.find(e => e.startsWith("Burn_"));
    if (existingBurn) {
        const index = targetCard.effects.indexOf(existingBurn);
        targetCard.effects.splice(index, 1);
    }

    // --- Ajout de l'effet Brûlure pour 3 tours ---
    targetCard.effects.push("Burn_3");
    state.log.push(`${sourceName} enflamme ${targetCard.name} ! (Brûlure 3 tours)`);
}

// Effet Pomme dorée : Soin + Dégâts (3 tours)
export function applyGoldenAppleEffect(state: CombatState, player: Player, targetIndex: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = player.board[targetIndex];

    // --- Vérification de la cible ---
    if (!targetCard) return;

    // --- Application de l'effet ---
    if (!targetCard.effects) targetCard.effects = [];

    // --- On retire un effet existant pour réinitialiser la durée ---
    const existing = targetCard.effects.find(e => e.startsWith("GoldenApple_"));
    if (existing) {
        const index = targetCard.effects.indexOf(existing);
        targetCard.effects.splice(index, 1);
    }

    // --- Ajout de l'effet Pomme dorée pour 3 tours ---
    targetCard.effects.push("GoldenApple_3");
    state.log.push(`${sourceName} donne de la force et régénère ${targetCard.name} ! (3 tours)`);
}

// Effet Table d'enchantement : Les équipements coûtent 1 énergie ce tour
export function applyEnchantmentTableEffect(io: Server, roomId: string, player: Player, sourceName: string): void {
  
    // --- Application de l'effet ---
    if (!player.effects) player.effects = [];

    // --- Vérifie si l'effet est déjà présent ---
    if (!player.effects.includes("Table d'enchantement")) {
        player.effects.push("Table d'enchantement");
        io.to(roomId).emit("log", `${sourceName} s'active : Les équipements coûtent 1 énergie ce tour.`);
    } else {
        io.to(roomId).emit("log", `${sourceName} est déjà actif.`);
    }
}

// Effet Portail de l'End : Soigne Enderman, Shulker ou Ender Dragon
export function healEndCreature(state: CombatState, player: Player, targetIndex: number, amount: number, sourceName: string): void {
  
    // --- Récupération de la carte cible ---
    const targetCard = player.board[targetIndex];

    // --- Vérification de la cible ---
    if (!targetCard) return;

    // --- Vérification du type de créature ---
    const validNames = ["Enderman", "Shulker", "Ender Dragon"];
    if (!validNames.includes(targetCard.name)) {
        state.log.push(`${sourceName} ne peut être utilisé que sur une créature de l'End.`);
        return;
    }

    if (targetCard.pv_durability !== undefined) {

        // --- Soin maximum ---
        const max = targetCard.max_pv ?? targetCard.pv_durability;
        const healAmount = Math.min(amount, max - targetCard.pv_durability);
        
        // --- Application du soin ---
        targetCard.pv_durability += healAmount;
        state.log.push(`${sourceName} régénère ${targetCard.name} de ${healAmount} PV.`);
    }
}

// Récupère les équipements candidats à la récupération
export function getAnvilCandidates(player: Player): InGameCard[] {

    // --- Récupérer n'importe quel équipement de la défausse ---
    return player.discard.filter(c => c.category === "equipement");
}

// Vérifie si l'Enclume peut être jouée
export function checkAnvilCondition(player: Player): { valid: boolean; msg?: string } {
  
    // --- Vérifie qu'il y a au moins un équipement dans la défausse ---
    const discardEquipments = player.discard.filter(c => c.category === "equipement");
    
    // --- Condition non remplie ---
    if (discardEquipments.length === 0) {
        return { valid: false, msg: "Vous n'avez pas d'équipement dans votre défausse." };
    }

    return { valid: true };
}

// Récupère un équipement de la défausse
export function anvilEffect(io: Server, roomId: string, player: Player, sourceName: string): void {
  
    // --- On récupère les candidats à la récupération ---
    const recoverableCandidates = getAnvilCandidates(player);

    // --- Si aucun candidat valide, on ne fait rien ---
    if (recoverableCandidates.length === 0) return;

    // --- Choisir un équipement aléatoire parmi les candidats valides ---
    const randomIndex = Math.floor(Math.random() * recoverableCandidates.length);
    const cardToRecover = recoverableCandidates[randomIndex];

    // --- Déplacer de la défausse vers la main ---
    const realIndexInDiscard = player.discard.indexOf(cardToRecover);
    if (realIndexInDiscard !== -1) {
        player.discard.splice(realIndexInDiscard, 1);
        player.hand.push(cardToRecover);
        io.to(roomId).emit("log", `${sourceName} forge à nouveau ${cardToRecover.name} et l'ajoute à votre main !`);
    }
}