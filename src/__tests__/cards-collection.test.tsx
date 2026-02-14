import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAllCardsWithUserCollection, drawCards, getUserCollection, getUserFavoriteCards, setFavoriteCard } from '@/prisma/requests'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

let user: any

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test_card-collection@gmail.com' } })

    await auth.api.signUpEmail({
        body: {
            email: 'test_card-collection@gmail.com',
            password: 'azertyuiop',
            name: 'testNameLeaderboard',
        }
    });

    user = await prisma.user.findUnique({
        where: { email: 'test_card-collection@gmail.com' },
    })
    
    if (!user) {
        throw new Error('Utilisateur de test introuvable après création : test_card-collection@gmail.com')
    }
})

describe('drawCards', () => {
    it('tirage de cartes pour l’utilisateur', async () => {
        // On supprime toutes les cartes de la collection de l'utilisateur pour partir d'une base propre
        await prisma.collection.deleteMany({ where: { user_id: user.id } })

        const initialCollection = await getUserCollection(user.id)
        const initialCount = initialCollection.length

        await drawCards(user.id, 5)

        const updatedCollection = await getUserCollection(user.id)
        const updatedCount = updatedCollection.length

        expect(updatedCount).toBeGreaterThan(initialCount)
        
        await prisma.collection.deleteMany({ where: { user_id: user.id } })
    })
})

describe('getAllCardsWithUserCollection', () => {
    it('récupération de toutes les cartes avec la collection de l’utilisateur', async () => {
        // On supprime toutes les cartes de la collection de l'utilisateur pour partir d'une base propre
        await prisma.collection.deleteMany({ where: { user_id: user.id } })

        let cards = await getAllCardsWithUserCollection(user.id)
        expect(cards).toBeInstanceOf(Array)
        expect(cards.length).toBeGreaterThan(0)

        // On vérifie que les cartes ont bien la propriété "owned" à false
        cards.forEach((card: any) => {
            expect(card).toHaveProperty('isDiscovered', false)
        })
    })
})

describe('getUserCollection', () => {
    it('récupération de toutes les cartes avec la collection de l’utilisateur', async () => {
        // On supprime toutes les cartes de la collection de l'utilisateur pour partir d'une base propre
        await prisma.collection.deleteMany({ where: { user_id: user.id } })

        // On simule une ouverture de carte pour s'assurer que l'utilisateur a au moins une carte dans sa collection
        await drawCards(user.id, 5)

        const cards = await getUserCollection(user.id)
        expect(cards).toBeInstanceOf(Array)
        expect(cards.length).toBeGreaterThan(0)
        
        await prisma.collection.deleteMany({ where: { user_id: user.id } })
    })
})

describe('setFavoriteCard', () => {
    it('définition d’une carte comme favorite', async () => {
        // On supprime toutes les cartes de la collection de l'utilisateur pour partir d'une base propre
        await prisma.collection.deleteMany({ where: { user_id: user.id } })

        // On simule une ouverture de carte pour s'assurer que l'utilisateur a au moins une carte dans sa collection
        await drawCards(user.id, 5)

        let cards = await getUserCollection(user.id)
        const cardToFavorite = cards[0]
        expect(cardToFavorite).toHaveProperty('favorite', false)

        if (!cardToFavorite.card_id) {
            throw new Error('La carte à favoriser n’a pas été trouvée')
        }
        await setFavoriteCard(cardToFavorite.card_id, user.id, true)

        cards = await getUserCollection(user.id)
        const favoritedCard = cards.find((card: any) => card.card_id === cardToFavorite.card_id)
        expect(favoritedCard).toHaveProperty('favorite', true)

        // await prisma.collection.deleteMany({ where: { user_id: user.id } })
    })
})

describe('getUserFavoriteCards', () => {
    it('récupération des cartes favorites de l’utilisateur', async () => {
        // On supprime toutes les cartes de la collection de l'utilisateur pour partir d'une base propre
        await prisma.collection.deleteMany({ where: { user_id: user.id } })

        // On simule une ouverture de carte pour s'assurer que l'utilisateur a au moins une carte dans sa collection
        await drawCards(user.id, 5)

        const cards = await getUserCollection(user.id)
        expect(cards).toBeInstanceOf(Array)
        expect(cards.length).toBeGreaterThan(0)
        
        await prisma.collection.deleteMany({ where: { user_id: user.id } })
    })
})

afterAll(async () => {
    await prisma.collection.deleteMany({ where: { user_id: user.id } })
    await prisma.user.deleteMany({ where: { email: 'test_card-collection@gmail.com' } })
})