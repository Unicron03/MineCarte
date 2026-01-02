import { Player, CombatState } from "../../../typesPvp";

// Pioche une ou plusieurs cartes
export function drawCard(state: CombatState, player: Player, count: number): void {

    // Nombre de cartes effectivement piochées
    let drawn = 0;

    // Pioche les cartes
    for (let i = 0; i < count; i++) {
        if (player.deck.length === 0) break;
        player.hand.push(player.deck.shift()!);
        drawn++;
    }

    state.log.push(`${player.id} pioche ${drawn} carte(s)`);
}