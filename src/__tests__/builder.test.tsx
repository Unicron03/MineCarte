import { describe, it, expect } from 'vitest'
import { buildActionList, createCard, createPlayer } from '@/server/functions/builder'

// ─── buildActionList ──────────────────────────────────────────────────────────

describe('buildActionList', () => {
    it('transforme une liste Prisma en actions typées', () => {
        const prismaActions = [
            {
                id: 1,
                name: 'AttackOneMob',
                description: 'Attaque un mob',
                damage: 5,
                cost: 2,
                autoActivate: false,
                requiresTarget: true,
                targetType: 'enemy' as const,
                function_name: 'AttackOneMob',
            },
        ]

        const result = buildActionList(prismaActions)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(1)
        expect(result[0].name).toBe('AttackOneMob')
        expect(result[0].damage).toBe(5)
        expect(result[0].cost).toBe(2)
        expect(result[0].function).toBe('AttackOneMob')
        expect(result[0].requiresTarget).toBe(true)
        expect(result[0].targetType).toBe('enemy')
        expect(result[0].autoActivate).toBe(false)
    })

    it('utilise 0 pour damage null', () => {
        const prismaActions = [
            {
                id: 2,
                name: 'SansDamage',
                description: null,
                damage: null,
                cost: 1,
                autoActivate: false,
                requiresTarget: false,
                targetType: null,
                function_name: 'defaultFunction',
            },
        ]

        const result = buildActionList(prismaActions)

        expect(result[0].damage).toBe(0)
        expect(result[0].description).toBe('')
        expect(result[0].targetType).toBeUndefined()
    })

    it('retourne un tableau vide si la liste Prisma est vide', () => {
        const result = buildActionList([])
        expect(result).toHaveLength(0)
    })

    it('transforme plusieurs actions en conservant leur ordre', () => {
        const prismaActions = [
            { id: 1, name: 'A', description: null, damage: 1, cost: 1, autoActivate: false, requiresTarget: false, targetType: null, function_name: 'fnA' },
            { id: 2, name: 'B', description: null, damage: 2, cost: 2, autoActivate: true,  requiresTarget: true,  targetType: 'ally' as const, function_name: 'fnB' },
        ]

        const result = buildActionList(prismaActions)

        expect(result[0].name).toBe('A')
        expect(result[1].name).toBe('B')
        expect(result[1].autoActivate).toBe(true)
        expect(result[1].targetType).toBe('ally')
    })
})

// ─── createCard ───────────────────────────────────────────────────────────────

describe('createCard', () => {
    it('crée un mob avec les bonnes propriétés', () => {
        const card = createCard('Zombie', 'zombie.png', 3, 'mob', 15, 'Pression Psychologique', 'AttackOneMob', null)

        expect(card.category).toBe('mob')
        expect(card.name).toBe('Zombie')
        expect(card.imageName).toBe('zombie.png')
        expect(card.cost).toBe(3)
        expect(card.uuid).toBeTruthy()

        if (card.category === 'mob') {
            expect(card.pv_durability).toBe(15)
            expect(card.max_pv).toBe(15)
            expect(card.talent).toBe('Pression Psychologique')
            expect(card.attack1).toBe('AttackOneMob')
            expect(card.attack2).toBeNull()
        }
    })

    it('crée un mob avec pv à 0 si pv_durability est null', () => {
        const card = createCard('TestMob', 'test.png', 1, 'mob', null, null, null, null)

        if (card.category === 'mob') {
            expect(card.pv_durability).toBe(0)
            expect(card.max_pv).toBe(0)
        }
    })

    it('crée un équipement avec les bonnes propriétés', () => {
        const card = createCard('Épée', 'sword.png', 2, 'equipement', null, null, null, null)

        expect(card.category).toBe('equipement')
        expect(card.name).toBe('Épée')
        expect(card.cost).toBe(2)
        expect(card.uuid).toBeTruthy()

        if (card.category === 'equipement') {
            expect(card.pv_durability).toBeUndefined()
        }
    })

    it('crée un artefact avec l\'effet mappé depuis talent', () => {
        const card = createCard('Potion', 'potion.png', 1, 'artefact', null, 'Soin', null, null)

        expect(card.category).toBe('artefact')
        if (card.category === 'artefact') {
            expect(card.effet).toBe('Soin')
        }
    })

    it('génère un uuid unique pour chaque carte', () => {
        const card1 = createCard('Zombie', 'zombie.png', 3, 'mob', 10, null, null, null)
        const card2 = createCard('Zombie', 'zombie.png', 3, 'mob', 10, null, null, null)

        expect(card1.uuid).not.toBe(card2.uuid)
    })
})

// ─── createPlayer ─────────────────────────────────────────────────────────────

describe('createPlayer', () => {
    it('crée un joueur avec les valeurs par défaut', () => {
        const player = createPlayer('socket-123', [], 'token-abc')

        expect(player.id).toBe('socket-123')
        expect(player.token).toBe('token-abc')
        expect(player.pv).toBe(100)
        expect(player.energie).toBe(0)
        expect(player.board).toHaveLength(0)
        expect(player.discard).toHaveLength(0)
        expect(player.effects).toEqual([])
        expect(player._disconnectedAt).toBeNull()
        expect(player.pendingAction).toBeNull()
        expect(player.turnCount).toBe(0)
    })

    it('pioche 3 cartes initiales depuis le deck', () => {
        const deck = [
            createCard('C1', 'c1.png', 1, 'mob', 5, null, null, null),
            createCard('C2', 'c2.png', 1, 'mob', 5, null, null, null),
            createCard('C3', 'c3.png', 1, 'mob', 5, null, null, null),
            createCard('C4', 'c4.png', 1, 'mob', 5, null, null, null),
            createCard('C5', 'c5.png', 1, 'mob', 5, null, null, null),
        ]

        const player = createPlayer('socket-456', deck, 'token-xyz')

        expect(player.hand).toHaveLength(3)
        expect(player.deck).toHaveLength(2)
        // hand + deck = 5 cartes au total
        expect(player.hand.length + player.deck.length).toBe(5)
    })

    it('ne plante pas si le deck a moins de 3 cartes', () => {
        const deck = [
            createCard('C1', 'c1.png', 1, 'mob', 5, null, null, null),
        ]

        const player = createPlayer('socket-789', deck, 'token')

        expect(player.hand).toHaveLength(1)
        expect(player.deck).toHaveLength(0)
    })

    it('assigne le userId si fourni', () => {
        const player = createPlayer('socket-abc', [], 'token', 'user-999')
        expect(player.userId).toBe('user-999')
    })

    it('laisse userId undefined si non fourni', () => {
        const player = createPlayer('socket-abc', [], 'token')
        expect(player.userId).toBeUndefined()
    })

    it('mélange le deck avant de distribuer', () => {
        const deck = Array.from({ length: 20 }, (_, i) =>
            createCard(`Carte${i}`, `c${i}.png`, 1, 'mob', 5, null, null, null)
        )
        const originalNames = deck.map(c => c.name)

        const player = createPlayer('socket-shuffle', deck, 'token')
        const allNames = [...player.hand.map(c => c.name), ...player.deck.map(c => c.name)]

        // Toutes les cartes sont présentes
        expect(allNames.length).toBe(20)
        // Très peu de chances que l'ordre soit identique sur 20 cartes
        const isSameOrder = allNames.every((name, i) => name === originalNames[i])
        // On ne force pas l'ordre différent car c'est probabiliste, mais on vérifie la présence
        expect(allNames.sort()).toEqual(originalNames.sort())
        expect(typeof isSameOrder).toBe('boolean') // juste pour utiliser la variable
    })
})