import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getUserDecks, createDeck, renameDeck, duplicateDeck, deleteDeck, equipDeck, getActiveDeck, addCardToDeck, removeCardFromDeck } from '@/prisma/requests'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

let user: any

beforeAll(async () => {
    await auth.api.signUpEmail({
        body: {
            email: 'test_decks@gmail.com',
            password: 'azertyuiop',
            name: 'testName',
        }
    });

    user = await prisma.user.findUnique({
        where: { email: 'test_decks@gmail.com' },
    })
    
    if (!user) {
        throw new Error('Utilisateur de test introuvable après création : test_decks@gmail.com')
    }
})

describe('createDeck', () => {
    it('création d’un deck pour l’utilisateur', async () => {
        const deck = await createDeck(user.id)
    })
})


describe('getUserDecks', () => {
    it('récupération des decks de l’utilisateur', async () => {
        const decks = await getUserDecks(user.id)

        expect(decks).toBeInstanceOf(Array)
        expect(decks.length).toBeGreaterThan(0)
        expect(decks[0]).toHaveProperty('name', "Deck n°1")
    })
})

describe('renameDeck', () => {
    it('renommage d’un deck', async () => {
        const decks = await getUserDecks(user.id)
        const deck = decks[0]
        const newName = "Deck renommé"
        await renameDeck(deck.id, newName)
        const updatedDecks = await getUserDecks(user.id)
        expect(updatedDecks[0]).toHaveProperty('name', newName)
    })
})

describe('duplicateDeck', () => {
    it('duplication d’un deck', async () => {
        const decks = await getUserDecks(user.id)
        const deck = decks[0]
        await duplicateDeck(user.id, deck.id)
        const updatedDecks = await getUserDecks(user.id)
        expect(updatedDecks.length).toBeGreaterThan(decks.length)
    })
})

describe('deleteDeck', () => {
    it('suppression d’un deck', async () => {
        const decks = await getUserDecks(user.id)
        const deck = decks[0]
        await deleteDeck(user.id, deck.id)
        const updatedDecks = await getUserDecks(user.id)
        expect(updatedDecks.length).toBeLessThan(decks.length)
    })
})

describe('equipDeck', () => {
    it('équipement d’un deck pour l’utilisateur', async () => {
        const decks = await getUserDecks(user.id)
        const deckToEquip = decks[0]
        await equipDeck(user.id, deckToEquip.id)
        
        const activeDeck = await getActiveDeck(user.id)
        expect(activeDeck).toHaveProperty('id', deckToEquip.id)
        expect(activeDeck).toHaveProperty('is_active', true)
    })
})

describe('addCardToDeck and removeCardFromDeck', () => {
    it('ajout et suppression d’une carte dans un deck', async () => {
        const decks = await getUserDecks(user.id)
        const deck = decks[0]
        const cardId = 1 // Assumant qu'une carte avec l'ID 1 existe en base

        // Ajout
        await addCardToDeck(deck.id, cardId)
        const deckWithCard = await prisma.decks.findUnique({
            where: { id: deck.id },
            include: { deck_cards: true }
        })
        const hasCard = deckWithCard?.deck_cards.some(dc => dc.card_id === cardId)
        expect(hasCard).toBe(true)

        // Suppression
        await removeCardFromDeck(deck.id, cardId)
        const deckWithoutCard = await prisma.decks.findUnique({
            where: { id: deck.id },
            include: { deck_cards: true }
        })
        const stillHasCard = deckWithoutCard?.deck_cards.some(dc => dc.card_id === cardId)
        expect(stillHasCard).toBe(false)
    })
})

afterAll(async () => {
    await prisma.decks.deleteMany({ where: { user_id: user.id } })
    await prisma.user.deleteMany({ where: { email: 'test_decks@gmail.com' } })
})