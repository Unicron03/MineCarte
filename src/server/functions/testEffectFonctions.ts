import { Server } from "socket.io";
import { InGameCard, CombatState, Player } from "../../typesPvp";
import { actionList } from "../../data";
import { handleMobDeath, checkVillageGuardian } from "./gameLogic";
import { soundDetection } from "./cartes/talentFunction";
import { getEquipmentAttackCostReduction } from "./cartes/equipementFunction";

// Calcule les dégâts finaux après application des effets de réduction des équipements.
export function applyArmorEffect(target: InGameCard, initialDamage: number, state: CombatState): number {
  
    let finalDamage = initialDamage;

    // --- Gestion Carapace Protectrice (Tortue) ---
    if (target.effects?.includes("CarapaceProtectrice")) {
        finalDamage = Math.floor(finalDamage * 0.5);
        state.log.push(`La carapace de ${target.name} réduit les dégâts de 50% !`);
        
        // Retrait de l'effet après la première attaque (consommation)
        const index = target.effects.indexOf("CarapaceProtectrice");
        if (index !== -1) target.effects.splice(index, 1);
    }

    if (target.category === "mob" && target.equipment && target.equipment.length > 0) {
      
        // Vérification de la présence d'une armure
        const hasArmor = target.equipment.some((eq) => eq.name === "Armure");
        if (hasArmor) {

            // Réduction de 10 dégâts
            finalDamage = Math.max(0, finalDamage - 10);
            state.log.push(`L'armure de ${target.name} absorbe 10 dégâts !`);
        }
    }

    return finalDamage;
}

// Vérifie si la Table d'enchantement est active et réduit le coût des équipements à 1
export function applyEnchantmentTableCostReduction(player: Player, card: InGameCard): number {
  
    // --- Si l'effet est actif et que c'est un équipement, le coût de base devient 1 ---
    if (player.effects?.includes("Table d'enchantement") && card.category === "equipement") {
        return 1;
    }
    return card.cost;
}

// Applique l'effet de la Table de craft (réduction de coût) si disponible.
export function applyCraftTableEffect(player: Player, card: InGameCard, io: Server, roomId: string, consume: boolean = true): number {
  
    // On applique d'abord la réduction de la Table d'enchantement
    let finalCost = applyEnchantmentTableCostReduction(player, card);

    // Recherche de l'effet "Table de craft" dans les effets du joueur
    const craftEffectName = "Table de craft";
    const craftEffectIndex = player.effects?.findIndex((e) => e === craftEffectName);

    // Si l'effet est trouvé, on applique la réduction de coût
    if (craftEffectIndex !== undefined && craftEffectIndex !== -1) {
        const effectAction = actionList.find((a) => a.name === craftEffectName);

        // 'damage' dans cet effet représente la réduction de coût
        const reduction = effectAction?.damage || 0;
        finalCost = Math.max(0, finalCost - reduction);

        // Si l'effet est consommé, on le retire
        if (consume) {
            player.effects!.splice(craftEffectIndex, 1);
            io.to(roomId).emit("log", `[Jeu] Coût de ${card.name} réduit de ${reduction} grâce à la Table de craft.`);
        }
    }

    return finalCost;
}

// Vérifie si une cible esquive l'attaque (45% de chance)
export function hasEsquive(target: InGameCard, state: CombatState): boolean {
  
    // Vérification que l'effet Esquive est présent
    if (target.effects?.includes("Esquive")) {

        // 45% de chance d'esquiver
        if (Math.random() < 0.45) {
            state.log.push(`${target.name} esquive l'attaque grâce à sa furtivité !`);
            return true;
        }
    }
    return false;
}


// Vérifie si une cible est invisible
export function hasInvisibility(target: InGameCard): boolean {
    return target.effects?.includes("Invisible") ?? false;
}


// Calcule les dégâts sortants en fonction des effets de l'attaquant
export function getModifiedDamage(attacker: InGameCard, baseDamage: number, isAOE: boolean = false): number {
    let finalDamage = baseDamage;

    // Application du DoubleDamage
    if (attacker.effects?.includes("DoubleDamage")) {
        finalDamage *= 2;
    }
    
    // Application WitherEnrage (Wither)
    if (attacker.effects?.includes("WitherEnrage")) {
        finalDamage *= 2;
    }

    // Application Pomme Dorée (+10 dégâts)
    const goldenApple = attacker.effects?.find(e => e.startsWith("GoldenApple_"));
    if (goldenApple) {
        finalDamage += 10;
    }

    // Application Arc (Equipment) - Seulement si ce n'est pas une AOE (géré séparément)
    if (!isAOE && attacker.equipment && attacker.equipment.some(eq => eq.name === "Arc")) {
        finalDamage += 10;
    }

    return finalDamage;
}

// Calcule le coût d'une attaque en tenant compte des équipements (ex: Botte célérité)
export function getAttackCost(attacker: InGameCard, baseCost: number): number {
    let finalCost = baseCost;

    // Réduction via équipements (délégué à equipementFunction)
    finalCost -= getEquipmentAttackCostReduction(attacker);

    return Math.max(0, finalCost);
}

// Gère l'effet de brûlure (dégâts sur la durée)
export function handleBurnEffect(io: Server, roomId: string, state: CombatState, player: Player, cardIndex: number): void {
  
    // --- Récupération de la carte ciblée ---
    const card = player.board[cardIndex];
    
    // --- Vérification que la carte existe et a des effets ---
    if (!card || !card.effects) return;

    // --- Cherche l'effet de brûlure ---
    const burnEffect = card.effects.find((e: string) => e.startsWith("Burn_"));
    
    if (burnEffect) {

        // --- Extraction de la durée restante ---
        const duration = parseInt(burnEffect.split("_")[1]);

        // --- Application des dégâts (10 PV) ---
        if (card.pv_durability !== undefined) {
            card.pv_durability -= 10;
            state.log.push(`${card.name} brûle et perd 10 PV !`);
        }

        // --- Mise à jour de la durée de l'effet ---
        const index = card.effects.indexOf(burnEffect);
        if (index !== -1) {
            card.effects.splice(index, 1);
        }

        // --- Réajout de l'effet si la durée n'est pas écoulée ---
        if (duration > 1) {
            card.effects.push(`Burn_${duration - 1}`);
        } else {
            state.log.push(`La brûlure de ${card.name} se dissipe.`);
        }

        // --- Vérification de la mort due à la brûlure ---
        if (card.pv_durability !== undefined && card.pv_durability <= 0) {
            state.log.push(`${card.name} est consumé par le feu !`);
            handleMobDeath(io, roomId, player, cardIndex, state.log);
        }
    }
}

// Vérifie si l'adversaire a un Warden et déclenche son passif
export function checkAndTriggerWarden(io: Server, roomId: string, actingPlayer: Player, opponentPlayer: Player, actingCard: InGameCard) {
    // On cherche si l'adversaire a un Warden avec le talent "Détection Sonore"
    const warden = opponentPlayer.board.find(c => c.category === "mob" && c.name === "Warden" && c.talent === "Détection Sonore");
    
    if (warden) {
        soundDetection(io, roomId, opponentPlayer, actingPlayer, actingCard);
    }
}

// Gère l'effet de la Pomme dorée (Soin périodique + décrémentation durée)
export function handleGoldenAppleEffect(state: CombatState, player: Player, cardIndex: number): void {
  
    // --- Récupération de la carte ciblée ---
    const card = player.board[cardIndex];

    // --- Vérification que la carte existe et a des effets ---
    if (!card || !card.effects) return;

    // --- Cherche l'effet de la Pomme dorée ---
    const effect = card.effects.find(e => e.startsWith("GoldenApple_"));
    if (effect) {
        const duration = parseInt(effect.split("_")[1]);

        // Soin de 10 PV
        if (card.pv_durability !== undefined) {
            const maxPv = card.max_pv || 100;
            const healAmount = Math.min(10, maxPv - card.pv_durability);
            if (healAmount > 0) {
                card.pv_durability += healAmount;
                state.log.push(`${card.name} récupère ${healAmount} PV grâce à la Pomme dorée.`);
            }
        }

        // Mise à jour de la durée
        const index = card.effects.indexOf(effect);
        if (index !== -1) card.effects.splice(index, 1);

        // Réajout de l'effet si la durée n'est pas écoulée
        if (duration > 1) {
            card.effects.push(`GoldenApple_${duration - 1}`);
        } else {
            state.log.push(`L'effet de la Pomme dorée sur ${card.name} se dissipe.`);
        }
    }
}

// Vérifie si une carte est étourdie
export function isStunned(card: InGameCard): boolean {
    return card.effects?.some((e: string) => e.startsWith("Stun_")) ?? false;
}