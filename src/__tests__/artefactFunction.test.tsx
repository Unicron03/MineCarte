import { describe, it, expect, vi } from 'vitest'
import type { Server } from 'socket.io'
import {
    applyEffect,
    healPlayer,
    drawCardsEffect,
    applyArtifactDamage,
    healGolem,
    halveLifeEffect,
    discardOwnCard,
    fishingRodEffect,
    giveInvisibleEffect,
    applyBurnEffect,
    applyGoldenAppleEffect,
    applyEnchantmentTableEffect,
    healEndCreature,
    getAnvilCandidates,
    checkAnvilCondition,
    anvilEffect,
    applyBellEffect,
} from '@/server/functions/cartes/artefactFunction'

import type { CombatState, Player, InGameCard, Action } from '@/components/utils/typesPvp'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCard(overrides: Partial<InGameCard> = {}): InGameCard {
    return {
        uuid: 'uuid-' + Math.random(),
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

function makeEquipCard(name: string): InGameCard {
    return {
        uuid: 'eq-' + Math.random(),
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

function makeAction(overrides: Partial<Action> = {}): Action {
    return {
        id: 1,
        name: 'TestAction',
        damage: 5,
        cost: 2,
        ...overrides,
    }
}

const mockIo = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
} as unknown as Server

const roomId = 'test-room'

// ─── applyEffect ──────────────────────────────────────────────────────────────

describe('applyEffect', () => {
    it("ajoute le nom de l'action aux effets du joueur", () => {
        const state = makeState()
        const player = makePlayer({ effects: [] })
        const action = makeAction({ name: 'Poison' })

        applyEffect(state, player, action)

        expect(player.effects).toContain('Poison')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it("initialise le tableau d'effets si undefined", () => {
        const state = makeState()
        const player = makePlayer({ effects: undefined })
        const action = makeAction({ name: 'Stun' })

        applyEffect(state, player, action)

        expect(player.effects).toContain('Stun')
    })
})

// ─── healPlayer ───────────────────────────────────────────────────────────────

describe('healPlayer', () => {
    it('soigne le joueur du montant donné', () => {
        const state = makeState()
        const player = makePlayer({ pv: 70 })

        healPlayer(state, player, 20)

        expect(player.pv).toBe(90)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne soigne pas au-delà de 100 PV', () => {
        const state = makeState()
        const player = makePlayer({ pv: 95 })

        healPlayer(state, player, 20)

        expect(player.pv).toBe(100)
    })

    it('ne fait rien si le joueur est déjà à 100 PV', () => {
        const state = makeState()
        const player = makePlayer({ pv: 100 })

        healPlayer(state, player, 10)

        expect(player.pv).toBe(100)
    })
})

// ─── drawCardsEffect ──────────────────────────────────────────────────────────

describe('drawCardsEffect', () => {
    it('pioche le bon nombre de cartes', () => {
        const state = makeState()
        const card1 = makeCard({ name: 'Carte1' })
        const card2 = makeCard({ name: 'Carte2' })
        const player = makePlayer({ deck: [card1, card2], hand: [] })

        drawCardsEffect(state, player, 2)

        expect(player.hand).toHaveLength(2)
        expect(player.deck).toHaveLength(0)
    })

    it('pioche ce qui reste si le deck est insuffisant', () => {
        const state = makeState()
        const card = makeCard()
        const player = makePlayer({ deck: [card], hand: [] })

        drawCardsEffect(state, player, 5)

        expect(player.hand).toHaveLength(1)
    })
})

// ─── applyArtifactDamage ──────────────────────────────────────────────────────

describe('applyArtifactDamage', () => {
    it('inflige des dégâts à la carte cible', () => {
        const state = makeState()
        const target = makeCard({ pv_durability: 10 })
        const opponent = makePlayer({ board: [target] })

        applyArtifactDamage(mockIo, roomId, state, opponent, 0, 4, 'Arc')

        expect(target.pv_durability).toBeLessThan(10)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it("ne fait rien si la cible n'existe pas", () => {
        const state = makeState()
        const opponent = makePlayer({ board: [] })

        applyArtifactDamage(mockIo, roomId, state, opponent, 5, 4, 'Arc')

        expect(state.log).toContain('Cible inexistante pour Arc.')
    })
})

// ─── healGolem ────────────────────────────────────────────────────────────────

describe('healGolem', () => {
    it('soigne un Golem allié', () => {
        const state = makeState()
        const golem = makeCard({ name: 'Golem', pv_durability: 5, max_pv: 20 })
        const player = makePlayer({ board: [golem] })

        healGolem(state, player, 0, 8, 'Pioche en fer')

        expect(golem.pv_durability).toBe(13)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('refuse de soigner une carte qui n\'est pas un Golem', () => {
        const state = makeState()
        const mob = makeCard({ name: 'Zombie', pv_durability: 5, max_pv: 20 })
        const player = makePlayer({ board: [mob] })

        healGolem(state, player, 0, 8, 'Pioche en fer')

        expect(mob.pv_durability).toBe(5)
        expect(state.log[0]).toContain('Golem')
    })

    it('ne soigne pas au-delà du max_pv', () => {
        const state = makeState()
        const golem = makeCard({ name: 'Golem', pv_durability: 18, max_pv: 20 })
        const player = makePlayer({ board: [golem] })

        healGolem(state, player, 0, 10, 'Pioche en fer')

        expect(golem.pv_durability).toBe(20)
    })

    it('ne fait rien si la cible est inexistante', () => {
        const state = makeState()
        const player = makePlayer({ board: [] })

        expect(() => healGolem(state, player, 5, 10, 'Pioche en fer')).not.toThrow()
    })
})

// ─── halveLifeEffect ──────────────────────────────────────────────────────────

describe('halveLifeEffect', () => {
    it('divise les PV de la carte cible par 2', () => {
        const state = makeState()
        const target = makeCard({ pv_durability: 10 })
        const opponent = makePlayer({ board: [target] })

        halveLifeEffect(mockIo, roomId, state, opponent, 0, 'Trident')

        expect(target.pv_durability).toBe(5)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('arrondit au supérieur pour les PV impairs', () => {
        const state = makeState()
        const target = makeCard({ pv_durability: 7 })
        const opponent = makePlayer({ board: [target] })

        halveLifeEffect(mockIo, roomId, state, opponent, 0, 'Trident')

        expect(target.pv_durability).toBe(3)
    })

    it('log une erreur si la cible est invalide', () => {
        const state = makeState()
        const opponent = makePlayer({ board: [] })

        halveLifeEffect(mockIo, roomId, state, opponent, 5, 'Trident')

        expect(state.log[0]).toContain('invalide')
    })
})

// ─── discardOwnCard ───────────────────────────────────────────────────────────

describe('discardOwnCard', () => {
    it('retire la carte du plateau du joueur', () => {
        const state = makeState()
        const mob = makeCard({ name: 'Zombie' })
        const player = makePlayer({ board: [mob] })

        discardOwnCard(mockIo, roomId, state, player, 0, 'Portail')

        expect(player.board).not.toContain(mob)
    })

    it('ne fait rien si la cible est inexistante', () => {
        const state = makeState()
        const player = makePlayer({ board: [] })

        expect(() => discardOwnCard(mockIo, roomId, state, player, 5, 'Portail')).not.toThrow()
    })
})

// ─── fishingRodEffect ─────────────────────────────────────────────────────────

describe('fishingRodEffect', () => {
    it('transfère de l\'énergie entre les joueurs (vol ou don)', () => {
        const state = makeState()
        const player = makePlayer({ energie: 5 })
        const opponent = makePlayer({ energie: 5 })

        const playerBefore = player.energie
        const opponentBefore = opponent.energie

        fishingRodEffect(state, player, opponent)

        // L'énergie totale doit rester la même (transfert)
        expect(player.energie + opponent.energie).toBe(playerBefore + opponentBefore)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne descend jamais l\'énergie en dessous de 0', () => {
        const state = makeState()
        const player = makePlayer({ energie: 0 })
        const opponent = makePlayer({ energie: 0 })

        fishingRodEffect(state, player, opponent)

        expect(player.energie).toBeGreaterThanOrEqual(0)
        expect(opponent.energie).toBeGreaterThanOrEqual(0)
    })
})

// ─── giveInvisibleEffect ──────────────────────────────────────────────────────

describe('giveInvisibleEffect', () => {
    it('applique l\'effet Invisible au mob ciblé', () => {
        const state = makeState()
        const mob = makeCard({ effects: [] })
        const player = makePlayer({ board: [mob] })

        giveInvisibleEffect(state, player, 0, 'Cape')

        expect(mob.effects).toContain('Invisible')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it("n'applique pas Invisible deux fois", () => {
        const state = makeState()
        const mob = makeCard({ effects: ['Invisible'] })
        const player = makePlayer({ board: [mob] })

        giveInvisibleEffect(state, player, 0, 'Cape')

        const count = mob.effects!.filter(e => e === 'Invisible').length
        expect(count).toBe(1)
    })

    it('ne fait rien si la cible est inexistante', () => {
        const state = makeState()
        const player = makePlayer({ board: [] })

        expect(() => giveInvisibleEffect(state, player, 5, 'Cape')).not.toThrow()
    })
})

// ─── applyBurnEffect ──────────────────────────────────────────────────────────

describe('applyBurnEffect', () => {
    it("applique l'effet Burn_3 à la carte cible", () => {
        const state = makeState()
        const target = makeCard({ effects: [] })
        const opponent = makePlayer({ board: [target] })

        applyBurnEffect(state, opponent, 0, 'Briquet')

        expect(target.effects).toContain('Burn_3')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('réinitialise la durée si une brûlure existe déjà', () => {
        const state = makeState()
        const target = makeCard({ effects: ['Burn_1'] })
        const opponent = makePlayer({ board: [target] })

        applyBurnEffect(state, opponent, 0, 'Briquet')

        expect(target.effects).not.toContain('Burn_1')
        expect(target.effects).toContain('Burn_3')
    })

    it('ne fait rien si la cible est inexistante', () => {
        const state = makeState()
        const opponent = makePlayer({ board: [] })

        expect(() => applyBurnEffect(state, opponent, 5, 'Briquet')).not.toThrow()
    })
})

// ─── applyGoldenAppleEffect ───────────────────────────────────────────────────

describe('applyGoldenAppleEffect', () => {
    it("applique l'effet GoldenApple_3 à la carte cible", () => {
        const state = makeState()
        const target = makeCard({ effects: [] })
        const player = makePlayer({ board: [target] })

        applyGoldenAppleEffect(state, player, 0, 'Pomme dorée')

        expect(target.effects).toContain('GoldenApple_3')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('réinitialise la durée si un effet GoldenApple existe déjà', () => {
        const state = makeState()
        const target = makeCard({ effects: ['GoldenApple_1'] })
        const player = makePlayer({ board: [target] })

        applyGoldenAppleEffect(state, player, 0, 'Pomme dorée')

        expect(target.effects).not.toContain('GoldenApple_1')
        expect(target.effects).toContain('GoldenApple_3')
    })

    it('ne fait rien si la cible est inexistante', () => {
        const state = makeState()
        const player = makePlayer({ board: [] })

        expect(() => applyGoldenAppleEffect(state, player, 5, 'Pomme dorée')).not.toThrow()
    })
})

// ─── applyEnchantmentTableEffect ──────────────────────────────────────────────

describe('applyEnchantmentTableEffect', () => {
    it("ajoute l'effet Table d'enchantement au joueur", () => {
        const player = makePlayer({ effects: [] })

        applyEnchantmentTableEffect(mockIo, roomId, player, "Table d'enchantement")

        expect(player.effects).toContain("Table d'enchantement")
    })

    it("n'applique pas l'effet deux fois", () => {
        const player = makePlayer({ effects: ["Table d'enchantement"] })

        applyEnchantmentTableEffect(mockIo, roomId, player, "Table d'enchantement")

        const count = player.effects!.filter(e => e === "Table d'enchantement").length
        expect(count).toBe(1)
    })
})

// ─── healEndCreature ──────────────────────────────────────────────────────────

describe('healEndCreature', () => {
    it('soigne un Enderman', () => {
        const state = makeState()
        const enderman = makeCard({ name: 'Enderman', pv_durability: 5, max_pv: 15 })
        const player = makePlayer({ board: [enderman] })

        healEndCreature(state, player, 0, 8, 'Portail de l\'End')

        expect(enderman.pv_durability).toBe(13)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('soigne un Shulker', () => {
        const state = makeState()
        const shulker = makeCard({ name: 'Shulker', pv_durability: 3, max_pv: 10 })
        const player = makePlayer({ board: [shulker] })

        healEndCreature(state, player, 0, 5, 'Portail de l\'End')

        expect(shulker.pv_durability).toBe(8)
    })

    it('refuse de soigner une créature non-End', () => {
        const state = makeState()
        const zombie = makeCard({ name: 'Zombie', pv_durability: 5, max_pv: 15 })
        const player = makePlayer({ board: [zombie] })

        healEndCreature(state, player, 0, 8, 'Portail de l\'End')

        expect(zombie.pv_durability).toBe(5)
        expect(state.log[0]).toContain('End')
    })

    it('ne soigne pas au-delà du max_pv', () => {
        const state = makeState()
        const dragon = makeCard({ name: 'Ender Dragon', pv_durability: 18, max_pv: 20 })
        const player = makePlayer({ board: [dragon] })

        healEndCreature(state, player, 0, 50, 'Portail de l\'End')

        expect(dragon.pv_durability).toBe(20)
    })
})

// ─── getAnvilCandidates ───────────────────────────────────────────────────────

describe('getAnvilCandidates', () => {
    it('retourne les équipements présents dans la défausse', () => {
        const eq = makeEquipCard('Épée')
        const mob = makeCard({ name: 'Zombie' })
        const player = makePlayer({ discard: [eq, mob] })

        const candidates = getAnvilCandidates(player)

        expect(candidates).toContain(eq)
        expect(candidates).not.toContain(mob)
    })

    it('retourne un tableau vide si aucun équipement en défausse', () => {
        const player = makePlayer({ discard: [] })

        expect(getAnvilCandidates(player)).toHaveLength(0)
    })
})

// ─── checkAnvilCondition ──────────────────────────────────────────────────────

describe('checkAnvilCondition', () => {
    it('retourne valid:true si un équipement est en défausse', () => {
        const eq = makeEquipCard('Bouclier')
        const player = makePlayer({ discard: [eq] })

        expect(checkAnvilCondition(player).valid).toBe(true)
    })

    it('retourne valid:false si aucun équipement en défausse', () => {
        const player = makePlayer({ discard: [] })
        const result = checkAnvilCondition(player)

        expect(result.valid).toBe(false)
        expect(result.msg).toBeDefined()
    })
})

// ─── anvilEffect ──────────────────────────────────────────────────────────────

describe('anvilEffect', () => {
    it('déplace un équipement aléatoire de la défausse vers la main', () => {
        const eq = makeEquipCard('Épée')
        const player = makePlayer({ discard: [eq], hand: [] })

        anvilEffect(mockIo, roomId, player, 'Enclume')

        expect(player.hand).toContain(eq)
        expect(player.discard).not.toContain(eq)
    })

    it('ne fait rien si la défausse est vide', () => {
        const player = makePlayer({ discard: [], hand: [] })

        expect(() => anvilEffect(mockIo, roomId, player, 'Enclume')).not.toThrow()
        expect(player.hand).toHaveLength(0)
    })
})

// ─── applyBellEffect ──────────────────────────────────────────────────────────

describe('applyBellEffect', () => {
    it('applique BellDiscount_1 si le Warden a moins de 50% de PV', () => {
        const state = makeState()
        const warden = makeCard({ name: 'Warden', pv_durability: 4, max_pv: 10, effects: [] })
        const player = makePlayer({ board: [warden] })

        applyBellEffect(state, player, 0, 'Cloche')

        expect(warden.effects).toContain('BellDiscount_1')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne fait pas l\'effet si le Warden a plus de 50% de PV', () => {
        const state = makeState()
        const warden = makeCard({ name: 'Warden', pv_durability: 8, max_pv: 10, effects: [] })
        const player = makePlayer({ board: [warden] })

        applyBellEffect(state, player, 0, 'Cloche')

        expect(warden.effects).not.toContain('BellDiscount_1')
    })

    it("n'applique pas BellDiscount_1 deux fois", () => {
        const state = makeState()
        const warden = makeCard({ name: 'Warden', pv_durability: 4, max_pv: 10, effects: ['BellDiscount_1'] })
        const player = makePlayer({ board: [warden] })

        applyBellEffect(state, player, 0, 'Cloche')

        const count = warden.effects!.filter(e => e === 'BellDiscount_1').length
        expect(count).toBe(1)
    })

    it('refuse une cible qui n\'est pas un Warden', () => {
        const state = makeState()
        const zombie = makeCard({ name: 'Zombie', pv_durability: 4, max_pv: 10 })
        const player = makePlayer({ board: [zombie] })

        applyBellEffect(state, player, 0, 'Cloche')

        expect(state.log[0]).toContain('invalide')
    })
})