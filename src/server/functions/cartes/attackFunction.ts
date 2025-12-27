import { InGameCard, Player, CombatState, Action } from "../../../typesPvp";
import { applyArmorEffect, hasEsquive, getModifiedDamage } from "./../testEffectFonctions";

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

  // Calcul des dégâts réels (prise en compte du x2 Golem etc.)
  const realDamage = getModifiedDamage(attacker, amount);

  // --- Attaque directe sur joueur ---
  if (!target && opponent) {
    opponent.pv -= realDamage;
    state.log.push(
      `${attacker.name} inflige ${realDamage} dégâts au joueur !`
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

  // --- Gestion de l'Esquive (45% de chance) ---
  if (hasEsquive(target, state)) {
    return { killed: false };
  }

  const finalDamage = applyArmorEffect(target, realDamage, state);

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

// Soigne une carte mob
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

//Attaque tous les mobs adverses.
export function AttackAllMobs(
  state: CombatState,
  attacker: InGameCard,
  amount: number,
  opponent: Player
): { killed: boolean } | void {

  // Calcul des dégâts réels (prise en compte du x2 Golem etc.)
  const realDamage = getModifiedDamage(attacker, amount);

  // Vérifier s'il y a des mobs sur le plateau adverse
  const hasMobs = opponent.board.some((c) => c.category === "mob");

  if (!hasMobs) {
    // Attaque directe sur le joueur
    opponent.pv -= realDamage;
    state.log.push(
      `${attacker.name} inflige ${realDamage} dégâts au joueur (aucun mob adverse) !`
    );
    return { killed: opponent.pv <= 0 };
  }

  // Attaque de zone sur les mobs
  // On parcourt à l'envers pour pouvoir supprimer sans décaler les index des éléments suivants
  for (let i = opponent.board.length - 1; i >= 0; i--) {
    const target = opponent.board[i];
    if (target.category === "mob" && target.pv_durability !== undefined) {
      
      // --- Gestion de l'Esquive sur attaque de zone ---
      if (hasEsquive(target, state)) {
        continue;
      }

      const finalDamage = applyArmorEffect(target, realDamage, state);
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

// Inflige des dégâts et applique "Esquive" au lanceur
export function attackEsquive(
  state: CombatState,
  attacker: InGameCard,
  target: InGameCard | null,
  amount: number,
  opponent?: Player
): { killed: boolean } | void {

  // Calcul des dégâts réels (prise en compte du x2 Golem etc.)
  const realDamage = getModifiedDamage(attacker, amount);

  // 1. Appliquer l'effet Esquive au lanceur (dans tous les cas)
  if (attacker.category === "mob") {
    if (!attacker.effects) attacker.effects = [];
    if (!attacker.effects.includes("Esquive")) {
      attacker.effects.push("Esquive");
      state.log.push(
        `${attacker.name} devient furtif et gagne Esquive (45% de chance d'éviter les coups au prochain tour).`
      );
    }
  }

  // 2. Attaque directe sur joueur (si pas de cible)
  if (!target && opponent) {
    opponent.pv -= realDamage;
    state.log.push(`${attacker.name} inflige ${realDamage} dégâts au joueur !`);
    return { killed: opponent.pv <= 0 };
  }

  // 3. Vérifier la cible
  if (!target) return;

  if (target.category !== "mob" || target.pv_durability === undefined) {
    state.log.push(`${attacker.name} ne peut pas attaquer ${target.name}`);
    return { killed: false };
  }

  // 4. Infliger les dégâts
  if (hasEsquive(target, state)) {
    return { killed: false };
  }

  const finalDamage = applyArmorEffect(target, realDamage, state);
  target.pv_durability -= finalDamage;
  state.log.push(`${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`);

  // Transfert de dégâts (Trample)
  if (target.pv_durability < 0 && opponent) {
    transfertDamageToPlayer(state, Math.abs(target.pv_durability), opponent, attacker.name);
  }

  return { killed: target.pv_durability <= 0 };
}

// Attaque spéciale : Inflige des dégâts puis tue le lanceur (Explosion)
export function damageAndDie(
  state: CombatState,
  attacker: InGameCard,
  target: InGameCard | null,
  amount: number,
  player: Player,
  opponent: Player
): { killed: boolean } | void {
  // 1. Infliger les dégâts (réutilisation de la logique standard)
  const result = AttackOneMob(state, attacker, target, amount, opponent);

  // 2. Le lanceur meurt instantanément
  const index = player.board.findIndex((c) => c.uuid === attacker.uuid);
  if (index !== -1) {
    player.discard.push(attacker);
    player.board.splice(index, 1);
    state.log.push(`${attacker.name} explose et est détruit !`);
  }
  return result;
}

// Inflige des dégâts et vole de l'énergie à l'adversaire
export function voleEnergie(
  state: CombatState,
  attacker: InGameCard,
  target: InGameCard | null,
  amount: number,
  opponent: Player
): { killed: boolean } | void {
  // 1. Infliger les dégâts (réutilisation de la logique standard)
  const result = AttackOneMob(state, attacker, target, amount, opponent);

  // Si l'attaque n'a pas été exécutée (ex: cible invalide), on arrête ici
  if (result === undefined) return;

  // 2. Retirer de l'énergie à l'adversaire
  if (opponent && opponent.energie > 0) {
    opponent.energie -= 1;
    state.log.push(`L'adversaire se fait voler 1 énergie !`);
  } else {
    state.log.push(`L'adversaire n'a plus d'énergie à voler.`);
  }

  return result;
}

// Attaque directe sur le joueur (ignore les mobs)
export function attackDirectPlayer(
  state: CombatState,
  attacker: InGameCard,
  amount: number,
  opponent: Player
): { killed: boolean } | void {
  // Calcul des dégâts réels (prise en compte du x2 Golem etc.)
  const realDamage = getModifiedDamage(attacker, amount);

  opponent.pv -= realDamage;
  state.log.push(
    `${attacker.name} inflige ${realDamage} dégâts directement au joueur !`
  );

  return { killed: opponent.pv <= 0 };
}

// Applique l'effet de régénération de la Potion (équipement)
// À appeler au début du tour
export function applyPotionRegen(
  state: CombatState,
  player: Player
): void {
  player.board.forEach((card) => {
    if (card.category === "mob" && card.equipment) {
      const hasPotion = card.equipment.some((eq) => eq.name === "Potion");
      if (hasPotion) {
        state.log.push(`[Potion] La potion s'active sur ${card.name}.`);
        // La potion soigne de 10 PV (défini par la carte, mais on force 10 ici pour la logique)
        heal(state, card, 10);
      }
    }
  });
}




// --------------------- Je suis pas sûr d'en avoir vraiment besoin ---------------------

//Applique un effet à un joueur pour une certaine durée.
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
