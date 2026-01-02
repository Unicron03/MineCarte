import { InGameCard, Player, CombatState} from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage } from "./../testEffectFonctions";
import { detachEquipment } from "./equipementFunction";

// Transfère les dégâts excédentaires au joueur adverse
export function transfertDamageToPlayer(state: CombatState, amount: number, opponent: Player,sourceName: string): void {
    if (amount <= 0) return;
    opponent.pv -= amount;
    state.log.push(`Dégâts perforants ! ${sourceName} inflige ${amount} dégâts excédentaires au joueur.`);
}

// Inflige des dégâts à une carte ou directement au joueur
export function AttackOneMob(state: CombatState, attacker: InGameCard, target: InGameCard | null, amount: number, opponent?: Player): { killed: boolean } | void {

    // --- Calcul des dégâts avec les bonnus de l'attaquant ---
    const realDamage = getModifiedDamage(attacker, amount);

    // --- Attaque directe sur joueur ---
    if (!target && opponent) {
        opponent.pv -= realDamage;
        state.log.push(`${attacker.name} inflige ${realDamage} dégâts au joueur !`);
        return { killed: opponent.pv <= 0 };
    }

    // --- Pas de cible ---
    if (!target) return;

    // --- Carte non attaquable ---
    if (target.category !== "mob" || target.pv_durability === undefined) {
        state.log.push(`${attacker.name} ne peut pas attaquer ${target.name}`);
        return { killed: false };
    }

    // --- Gestion de l'Esquive ---
    if (hasEsquive(target, state)) {
        return { killed: false };
    }

    // --- gestion de l'armure ---
    const finalDamage = applyArmorEffect(target, realDamage, state);

    // --- Attaque sur mob ---
    target.pv_durability -= finalDamage;
    state.log.push(`${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`);

    // --- Transfert de dégâts ---
    if (target.pv_durability < 0 && opponent) {
        transfertDamageToPlayer(state, Math.abs(target.pv_durability), opponent, attacker.name);
    }

    return { killed: target.pv_durability <= 0 };
}

// Soigne une carte mob
export function heal(state: CombatState, target: InGameCard, amount: number): void {
    // --- Carte non soignable ---
    if (target.category !== "mob" || target.pv_durability === undefined) {
        state.log.push(`${target.name} ne peut pas être soigné`);
        return;
    }

    // --- Limite de soin ---
    const max = target.max_pv ?? target.pv_durability;
    
    if (target.pv_durability >= max) {
        state.log.push(`${target.name} est déjà au max de ses PV.`);
        return;
    }

    // --- calcul du soin nécessaire ---
    const healAmount = Math.min(amount, max - target.pv_durability);

    // --- Soin de la carte ---
    target.pv_durability += healAmount;
    state.log.push(`${target.name} récupère ${healAmount} PV`);
}

//Attaque tous les mobs adverses. (gestion des morts des mobs car multicible)
export function AttackAllMobs(state: CombatState, attacker: InGameCard, amount: number, opponent: Player): { killed: boolean } | void {

    // --- Calcul des dégâts réels avec les bonnus de l'attaquant ---
    const realDamage = getModifiedDamage(attacker, amount);

    // --- Vérifier s'il y a des mobs sur le plateau adverse ---
    const hasMobs = opponent.board.some((c) => c.category === "mob");

    if (!hasMobs) {
        // --- Attaque directe sur le joueur ---
        opponent.pv -= realDamage;
        state.log.push(`${attacker.name} inflige ${realDamage} dégâts au joueur (aucun mob adverse) !`);
        return { killed: opponent.pv <= 0 };
    }

    // --- Attaque de zone sur les mobs (parcourt à l'envers pour gérer les suppressions sans décaler les index) ---
    for (let i = opponent.board.length - 1; i >= 0; i--) {
        const target = opponent.board[i];
        if (target.category === "mob" && target.pv_durability !== undefined) {
          
            // --- Gestion de l'Esquive sur attaque de zone ---
            if (hasEsquive(target, state)) {
                continue;
            }

            // --- gestion de l'armure ---
            const finalDamage = applyArmorEffect(target, realDamage, state);

            // --- Attaque sur mob ---
            target.pv_durability -= finalDamage;
            state.log.push(`${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`);

            if (target.pv_durability <= 0) {

                // --- Transfert de dégâts---
                if (target.pv_durability < 0) {
                    transfertDamageToPlayer(state, Math.abs(target.pv_durability), opponent, attacker.name);
                }
                opponent.discard.push(target);
                opponent.board.splice(i, 1);
                state.log.push(`${target.name} est détruite !`);
            }
        }
    }

    return { killed: false };
}

// Inflige des dégâts et applique "Esquive" au lanceur
export function attackEsquive(state: CombatState, attacker: InGameCard, target: InGameCard | null, amount: number, opponent?: Player): { killed: boolean } | void {

    // --- Calcul des dégâts réels avec les bonnus de l'attaquant ---
    const realDamage = getModifiedDamage(attacker, amount);

    // --- Appliquer l'effet Esquive au lanceur ---
    if (attacker.category === "mob") {
        if (!attacker.effects) attacker.effects = [];
        if (!attacker.effects.includes("Esquive")) {
            attacker.effects.push("Esquive");
            state.log.push(`${attacker.name} devient furtif et gagne Esquive (45% de chance d'éviter les coups au prochain tour).`);
        }
    }

    // --- Attaque directe sur joueur ---
    if (!target && opponent) {
        opponent.pv -= realDamage;
        state.log.push(`${attacker.name} inflige ${realDamage} dégâts au joueur !`);
        return { killed: opponent.pv <= 0 };
    }

    // --- Vérifier la cible ---
    if (!target) return;

    // --- Carte non attaquable ---
    if (target.category !== "mob" || target.pv_durability === undefined) {
      state.log.push(`${attacker.name} ne peut pas attaquer ${target.name}`);
      return { killed: false };
    }

    // --- Infliger les dégâts ---
    if (hasEsquive(target, state)) {
      return { killed: false };
    }

    // --- gestion de l'armure ---
    const finalDamage = applyArmorEffect(target, realDamage, state);

    // --- Attaque sur mob ---
    target.pv_durability -= finalDamage;
    state.log.push(`${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`);

    // --- Transfert de dégâts si nécessaire ---
    if (target.pv_durability < 0 && opponent) {
      transfertDamageToPlayer(state, Math.abs(target.pv_durability), opponent, attacker.name);
    }

    return { killed: target.pv_durability <= 0 };
}

// Attaque spéciale : Inflige des dégâts puis tue le lanceur (gestion de la mort du lanceur)
export function damageAndDie(state: CombatState, attacker: InGameCard, target: InGameCard | null, amount: number, player: Player, opponent: Player): { killed: boolean } | void {
  
    // --- Infliger les dégâts ---
    const result = AttackOneMob(state, attacker, target, amount, opponent);

    // --- Le lanceur meurt instantanément ---
    const index = player.board.findIndex((c) => c.uuid === attacker.uuid);
    if (index !== -1) {
        detachEquipment(player, attacker);
        player.discard.push(attacker);
        player.board.splice(index, 1);
        state.log.push(`${attacker.name} explose et est détruit !`);
    }
    return result;
}

// Inflige des dégâts et vole de l'énergie à l'adversaire
export function voleEnergie(state: CombatState, attacker: InGameCard, target: InGameCard | null, amount: number, opponent: Player): { killed: boolean } | void {
  
    // --- Infliger les dégâts ---
    const result = AttackOneMob(state, attacker, target, amount, opponent);

    // --- Si l'attaque n'a pas été exécutée, on s'arrête ---
    if (result === undefined) return;

    // --- Retirer de l'énergie à l'adversaire ---
    if (opponent && opponent.energie > 0) {
        opponent.energie -= 1;
        state.log.push(`L'adversaire se fait voler 1 énergie !`);
    } else {
        state.log.push(`L'adversaire n'a plus d'énergie à voler.`);
    }

    return result;
}

// Attaque directe sur le joueur (ignore les mobs)
export function attackDirectPlayer(state: CombatState, attacker: InGameCard, amount: number, opponent: Player): { killed: boolean } | void {
  
    // --- Calcul des dégâts avec les bonnus de l'attaquant ---
    const realDamage = getModifiedDamage(attacker, amount);

    // --- Attaque directe sur joueur ---
    opponent.pv -= realDamage;
    state.log.push(`${attacker.name} inflige ${realDamage} dégâts directement au joueur !`);

    return { killed: opponent.pv <= 0 };
}




