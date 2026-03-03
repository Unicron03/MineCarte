import { describe, it, expect, vi } from 'vitest'
import type { Server } from 'socket.io'
import {
    craftTableEffect,
    detachEquipment,
    applyPotionRegen,
    applySwordEffect,
    checkTotemEffect,
    hasElytra,
    applyPickaxeEffect,
    applyShieldEffect,
    getEquipmentAttackCostReduction,
    EFFECT_IDS,
} from '@/server/functions/cartes/equipementFunction'

import type { CombatState, Player, InGameCard, EffectContext } from '@/components/utils/typesPvp'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCard(overrides: Partial<InGameCard> = {}): InGameCard {
    return {
        uuid: 'card-uuid-' + Math.random(),
        category: 'mob',
        name: 'TestMob',
        imageName: 'test.png',
        cost: 2,
        pv_durability: 10,
        max_pv: 10,
        hasAttacked: false,
        hasUsedTalent: false,
        talent: null,
        attack1: null,
        attack2: null,
        equipment: [],
        effects: [],
        ...overrides,
    } as InGameCard
}

function makeEquipment(name: string): InGameCard {
    return {
        uuid: 'eq-uuid-' + Math.random(),
        category: 'equipement',
        name,
        imageName: `${name}.png`,
        cost: 1,
    } as InGameCard
}

function makePlayer(overrides: Partial<Player> = {}): Player {
    return {
        id: 'player-' + Math.random(),
        energie: 10,
        pv: 100,
        hand: [],
        board: [],
        deck: [],
        discard: [],
        turnCount: 1,
        token: 'token',
        effects: [],
        pendingAction: null,
        _disconnectedAt: null,
        ...overrides,
    }
}

function makeState(): CombatState {
    return { log: [] }
}

const mockIo = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
} as unknown as Server

const roomId = 'test-room'

function makeContext(player: Player, opponent: Player): EffectContext {
    return {
        io: mockIo,
        roomId,
        currentPlayer: player,
        opponentPlayer: opponent,
    }
}

// ─── craftTableEffect ────────────────────────────────────────────────────────

describe('craftTableEffect', () => {
    it('ajoute CRAFT_TABLE_COST_RED_3 aux effets du joueur', () => {
        const player = makePlayer({ effects: [] })
        const context = makeContext(player, makePlayer())

        craftTableEffect(context)

        expect(player.effects).toContain(EFFECT_IDS.CRAFT_TABLE_COST_RED_3)
    })

    it('envoie un log via io', () => {
        const player = makePlayer({ effects: [] })
        const context = makeContext(player, makePlayer())

        craftTableEffect(context)

        expect(mockIo.emit).toHaveBeenCalledWith('log', expect.stringContaining('Table de craft'))
    })

    it('peut empiler plusieurs fois l\'effet si appelé plusieurs fois', () => {
        const player = makePlayer({ effects: [] })
        const context = makeContext(player, makePlayer())

        craftTableEffect(context)
        craftTableEffect(context)

        const count = player.effects!.filter(e => e === EFFECT_IDS.CRAFT_TABLE_COST_RED_3).length
        expect(count).toBe(2)
    })
})

// ─── detachEquipment ─────────────────────────────────────────────────────────

describe('detachEquipment', () => {
    it('déplace les équipements du mob dans la défausse du joueur', () => {
        const eq1 = makeEquipment('Épée')
        const eq2 = makeEquipment('Bouclier')
        const mob = makeCard({ equipment: [eq1, eq2] })
        const player = makePlayer({ discard: [] })

        detachEquipment(player, mob)

        expect(player.discard).toContain(eq1)
        expect(player.discard).toContain(eq2)
        expect(mob.equipment).toHaveLength(0)
    })

    it('ne fait rien si le mob n\'a pas d\'équipement', () => {
        const mob = makeCard({ equipment: [] })
        const player = makePlayer({ discard: [] })

        detachEquipment(player, mob)

        expect(player.discard).toHaveLength(0)
    })
})

// ─── applyPotionRegen ─────────────────────────────────────────────────────────

describe('applyPotionRegen', () => {
    it('soigne un mob équipé d\'une Potion', () => {
        const potion = makeEquipment('Potion')
        const mob = makeCard({ pv_durability: 5, max_pv: 20, equipment: [potion] })
        const player = makePlayer({ board: [mob] })
        const state = makeState()

        applyPotionRegen(state, player)

        expect(mob.pv_durability).toBe(15)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne soigne pas au-delà du max_pv', () => {
        const potion = makeEquipment('Potion')
        const mob = makeCard({ pv_durability: 18, max_pv: 20, equipment: [potion] })
        const player = makePlayer({ board: [mob] })
        const state = makeState()

        applyPotionRegen(state, player)

        expect(mob.pv_durability).toBe(20)
    })

    it('ne soigne pas un mob sans Potion', () => {
        const mob = makeCard({ pv_durability: 5, max_pv: 20, equipment: [] })
        const player = makePlayer({ board: [mob] })
        const state = makeState()

        applyPotionRegen(state, player)

        expect(mob.pv_durability).toBe(5)
        expect(state.log).toHaveLength(0)
    })

    it('ne fait rien si le board est vide', () => {
        const player = makePlayer({ board: [] })
        const state = makeState()

        expect(() => applyPotionRegen(state, player)).not.toThrow()
    })
})

// ─── applySwordEffect ─────────────────────────────────────────────────────────

describe('applySwordEffect', () => {
    it('inflige 5 dégâts à tous les mobs adverses si l\'attaquant a une Épée', () => {
        const sword = makeEquipment('Épée')
        const attacker = makeCard({ equipment: [sword] })
        const mob1 = makeCard({ name: 'Mob1', pv_durability: 10 })
        const mob2 = makeCard({ name: 'Mob2', pv_durability: 8 })
        const opponent = makePlayer({ board: [mob1, mob2] })
        const state = makeState()

        applySwordEffect(state, attacker, opponent)

        expect(mob1.pv_durability).toBe(5)
        expect(mob2.pv_durability).toBe(3)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne fait rien si l\'attaquant n\'a pas d\'Épée', () => {
        const attacker = makeCard({ equipment: [] })
        const mob = makeCard({ pv_durability: 10 })
        const opponent = makePlayer({ board: [mob] })
        const state = makeState()

        applySwordEffect(state, attacker, opponent)

        expect(mob.pv_durability).toBe(10)
        expect(state.log).toHaveLength(0)
    })

    it('envoie le mob mort à la défausse si ses PV tombent à 0', () => {
        const sword = makeEquipment('Épée')
        const attacker = makeCard({ equipment: [sword] })
        const weakMob = makeCard({ name: 'FaibleMob', pv_durability: 3 })
        const opponent = makePlayer({ board: [weakMob], discard: [] })
        const state = makeState()

        applySwordEffect(state, attacker, opponent, mockIo, roomId)

        expect(opponent.board).not.toContain(weakMob)
    })
})

// ─── checkTotemEffect ────────────────────────────────────────────────────────

describe('checkTotemEffect', () => {
    it('sauve le mob et fixe ses PV à 5 si un Totem est équipé', () => {
        const totem = makeEquipment('Totem')
        const mob = makeCard({ pv_durability: 0, equipment: [totem] })
        const player = makePlayer()
        const state = makeState()

        const saved = checkTotemEffect(state, mob, player)

        expect(saved).toBe(true)
        expect(mob.pv_durability).toBe(5)
        expect(mob.equipment).toHaveLength(0)
        expect(player.discard).toContain(totem)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('retourne false si le mob n\'a pas de Totem', () => {
        const mob = makeCard({ pv_durability: 0, equipment: [] })
        const player = makePlayer()
        const state = makeState()

        const saved = checkTotemEffect(state, mob, player)

        expect(saved).toBe(false)
        expect(mob.pv_durability).toBe(0)
    })
})

// ─── hasElytra ────────────────────────────────────────────────────────────────

describe('hasElytra', () => {
    it('retourne true si le mob a une Elitra', () => {
        const elytra = makeEquipment('Elitra')
        const mob = makeCard({ equipment: [elytra] })

        expect(hasElytra(mob)).toBe(true)
    })

    it('retourne false si le mob n\'a pas d\'Elitra', () => {
        const mob = makeCard({ equipment: [] })

        expect(hasElytra(mob)).toBe(false)
    })

    it('retourne false si equipment est undefined', () => {
        const mob = makeCard({ equipment: undefined })

        expect(hasElytra(mob)).toBe(false)
    })
})

// ─── applyPickaxeEffect ───────────────────────────────────────────────────────

describe('applyPickaxeEffect', () => {
    it('pioche une carte si un mob a une Pioche équipée', () => {
        const pickaxe = makeEquipment('Pioche')
        const mob = makeCard({ equipment: [pickaxe] })
        const cardInDeck = makeCard({ name: 'CarteDeck' })
        const player = makePlayer({ board: [mob], deck: [cardInDeck], hand: [] })
        const state = makeState()

        applyPickaxeEffect(state, player)

        expect(player.hand).toContain(cardInDeck)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne pioche pas si aucun mob n\'a de Pioche', () => {
        const mob = makeCard({ equipment: [] })
        const cardInDeck = makeCard({ name: 'CarteDeck' })
        const player = makePlayer({ board: [mob], deck: [cardInDeck], hand: [] })
        const state = makeState()

        applyPickaxeEffect(state, player)

        expect(player.hand).toHaveLength(0)
        expect(state.log).toHaveLength(0)
    })

    it('ne plante pas si le board est vide', () => {
        const player = makePlayer({ board: [], deck: [] })
        const state = makeState()

        expect(() => applyPickaxeEffect(state, player)).not.toThrow()
    })
})

// ─── applyShieldEffect ────────────────────────────────────────────────────────

describe('applyShieldEffect', () => {
    it('inflige 10 dégâts à l\'attaquant si la cible a un Bouclier', () => {
        const shield = makeEquipment('Bouclier')
        const target = makeCard({ equipment: [shield] })
        const attacker = makeCard({ pv_durability: 15 })
        const attackerPlayer = makePlayer({ board: [attacker] })
        const state = makeState()

        applyShieldEffect(state, target, attacker, attackerPlayer)

        expect(attacker.pv_durability).toBe(5)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne fait rien si la cible n\'a pas de Bouclier', () => {
        const target = makeCard({ equipment: [] })
        const attacker = makeCard({ pv_durability: 15 })
        const attackerPlayer = makePlayer({ board: [attacker] })
        const state = makeState()

        applyShieldEffect(state, target, attacker, attackerPlayer)

        expect(attacker.pv_durability).toBe(15)
        expect(state.log).toHaveLength(0)
    })

    it('tue l\'attaquant si ses PV tombent à 0 après riposte', () => {
        const shield = makeEquipment('Bouclier')
        const target = makeCard({ equipment: [shield] })
        const attacker = makeCard({ pv_durability: 5 })
        const attackerPlayer = makePlayer({ board: [attacker] })
        const state = makeState()

        applyShieldEffect(state, target, attacker, attackerPlayer, mockIo, roomId)

        expect(attacker.pv_durability).toBeLessThanOrEqual(0)
    })
})

// ─── getEquipmentAttackCostReduction ─────────────────────────────────────────

describe('getEquipmentAttackCostReduction', () => {
    it('retourne 1 si le mob a des Bottes célérité', () => {
        const boots = makeEquipment('Botte célérité')
        const mob = makeCard({ equipment: [boots] })

        expect(getEquipmentAttackCostReduction(mob)).toBe(1)
    })

    it('retourne 0 si le mob n\'a pas de Bottes célérité', () => {
        const mob = makeCard({ equipment: [] })

        expect(getEquipmentAttackCostReduction(mob)).toBe(0)
    })

    it('retourne 0 si le mob n\'a aucun équipement', () => {
        const mob = makeCard({ equipment: undefined })

        expect(getEquipmentAttackCostReduction(mob)).toBe(0)
    })
})