import { InGameCard, Player, CombatState, Action } from "../../typesPvp";

/**
 * Inflige des dégâts à une carte ou directement au joueur
 */
export function dealDamage(
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

  // --- GESTION ARMURE / ÉQUIPEMENT ---
  let finalDamage = amount;
  if (target.equipment && target.equipment.length > 0) {
    const hasArmor = target.equipment.some((eq) => eq.name === "Armure");
    if (hasArmor) {
      finalDamage = Math.max(0, finalDamage - 10);
      state.log.push(`🛡️ L'armure de ${target.name} absorbe 10 dégâts !`);
    }
  }

  // --- Attaque sur mob ---
  target.pv_durability -= finalDamage;
  state.log.push(
    `${attacker.name} inflige ${finalDamage} dégâts à ${target.name}`
  );

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

  target.pv_durability += amount;
  state.log.push(
    `${target.name} récupère ${amount} PV`
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
