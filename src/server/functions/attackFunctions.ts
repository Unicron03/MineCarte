import { InGameCard, Player, CombatState, Action } from "../../typesPvp";
import { applyArmorEffect } from "./testEffectFonctions";

// Transfère les dégâts excédentaires au joueur adverse
export function transfertDamageToPlayer(
  state: CombatState,
  amount: number,
  opponent: Player,
  sourceName: string
): void {
  if (amount <= 0) return;

  opponent.pv -= amount;
  state.log.push(
    `Dégâts perforants ! ${sourceName} inflige ${amount} dégâts excédentaires au joueur.`
  );
}

// Inflige des dégâts à une carte ou directement au joueur
export function AttackOneMob(
  state: CombatState,
  attacker: InGameCard,
  target: InGameCard | null,
  amount: number,
  opponent?: Player
): { killed: boolean } | void {

  // --- Attaque directe sur joueur ---
  if (!target && opponent) {
    opponent.pv -= amount;
    state.log.push(
      `${attacker.name} inflige ${amount} dégâts au joueur !`
    );

    return { killed: opponent.pv <= 0 };
  }

  // --- Pas de cible ---
  if (!target) return;

  // --- Carte non attaquable ---
  if (target.category !== "mob" || target.pv_durability === undefined) {
    state.log.push(
      `${attacker.name} ne peut pas attaquer ${target.name}`
    );
    return { killed: false };
  }


  const finalDamage = applyArmorEffect(target, amount, state);

  // --- Attaque sur mob ---
  target.pv_durability -= finalDamage;
  state.log.push(
    `${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`
  );

  // --- Transfert de dégâts (Trample) ---
  if (target.pv_durability < 0 && opponent) {
    transfertDamageToPlayer(state, Math.abs(target.pv_durability), opponent, attacker.name);
  }

  return { killed: target.pv_durability <= 0 };
}

/**
 * Soigne une carte mob
 */
export function heal(
  state: CombatState,
  target: InGameCard,
  amount: number
): void {

  if (target.category !== "mob" || target.pv_durability === undefined) {
    state.log.push(
      `${target.name} ne peut pas être soigné`
    );
    return;
  }

  const max = target.max_pv ?? target.pv_durability;
  
  if (target.pv_durability >= max) {
    state.log.push(`${target.name} est déjà au max de ses PV.`);
    return;
  }

  const healAmount = Math.min(amount, max - target.pv_durability);

  target.pv_durability += healAmount;
   state.log.push(
    `${target.name} récupère ${healAmount} PV`
   );
}

/**
 * Pioche une ou plusieurs cartes
 */
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

//Attaque tous les mobs adverses.
export function AttackAllMobs(
  state: CombatState,
  attacker: InGameCard,
  amount: number,
  opponent: Player
): { killed: boolean } | void {

  // Vérifier s'il y a des mobs sur le plateau adverse
  const hasMobs = opponent.board.some((c) => c.category === "mob");

  if (!hasMobs) {
    // Attaque directe sur le joueur
    opponent.pv -= amount;
    state.log.push(
      `${attacker.name} inflige ${amount} dégâts au joueur (aucun mob adverse) !`
    );
    return { killed: opponent.pv <= 0 };
  }

  // Attaque de zone sur les mobs
  // On parcourt à l'envers pour pouvoir supprimer sans décaler les index des éléments suivants
  for (let i = opponent.board.length - 1; i >= 0; i--) {
    const target = opponent.board[i];
    if (target.category === "mob" && target.pv_durability !== undefined) {
      const finalDamage = applyArmorEffect(target, amount, state);
      target.pv_durability -= finalDamage;
      state.log.push(
        `${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`
      );

      if (target.pv_durability <= 0) {
        // --- Transfert de dégâts (Trample) ---
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






// --------------------- Je suis pas sûr d'en avoir vraiment besoin ---------------------

/**
 * Applique un effet à un joueur pour une certaine durée.
 */
export function applyEffect(
  state: CombatState,
  player: Player,
  action: Action
): void {

  if (!player.effects) player.effects = [];

  // Ajoute l'effet au joueur
  player.effects.push(action.name);

  state.log.push(
    `[Effet] ${player.id} est affecté par "${action.name}".`
  );
}
