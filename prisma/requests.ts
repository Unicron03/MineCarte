import { prisma } from '@/lib/prisma';
import { Prisma, GameMode } from '../generated/prisma/client';

// Mettre à jour le pseudo d'un utilisateur
export async function updateUserPseudo(userId: string, newPseudo: string) {
    return prisma.user.update({
        where: { id: userId },
        data: { name: newPseudo }
    });
}

// Retourne l'utilisateur par ID.
export async function getUser(id: string) {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			email: true,
			timeNextChest: true,
		}
	});
}

// Supprimer un utilisateur par ID
export async function deleteUser(userId: string) {
    return prisma.user.delete({
        where: { id: userId }
    });
}

// Récupérer toutes les stats d'un utilisateur
export async function getAllUserStats(userId: string) {
    return prisma.game_stats.findMany({
        where: { user_id: userId }
    });
}

// Récupérer les stats pour un mode spécifique
export async function getUserStatsForMode(userId: string, gameMode: string) {
    return prisma.game_stats.findUnique({
        where: {
            user_id_game_mode: {
                user_id: userId,
                game_mode: gameMode as any
            }
        }
    });
}

// Récupérer le top 10 des joueurs pour un mode de jeu spécifique
export async function getLeaderboard(gameMode: GameMode, limit: number = 10) {
    return prisma.game_stats.findMany({
        where: {
            game_mode: gameMode
        },
        orderBy: {
            points: 'desc'  // Trier par points décroissants
        },
        take: limit,  // Limiter aux X meilleurs (10 par défaut)
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
}

// Retourne toutes les cartes avec l'info si l'utilisateur les possède
export async function getAllCardsWithUserCollection(userId?: string) {
	const allCards = await prisma.cards.findMany({
		orderBy: { id: 'asc' }
	});
	
	const userCollection = await prisma.collection.findMany({
		where: { user_id: userId },
		select: { card_id: true, favorite: true, quantity: true }
	});
	
	const collectionMap = new Map(
		userCollection.map(item => [item.card_id, { favorite: item.favorite, quantity: item.quantity }])
	);
	
	return allCards.map(card => ({
		card,
		isDiscovered: collectionMap.has(card.id),
		favorite: collectionMap.get(card.id)?.favorite ?? false,
		quantity: collectionMap.get(card.id)?.quantity ?? 0
	}));
}

// Retourne la collection d'un utilisateur par ID.
export async function getUserCollection(id?: string): Promise<Prisma.collectionGetPayload<{ include: { card: true } }>[]> {
	return prisma.collection.findMany({
		where: { user_id: id },
		include: { card: true },
		orderBy: {
			card: {
				id: 'asc'
			}
		}
	});
}

// Retourne les cartes favorites d'un utilisateur avec leur quantité
export async function getUserFavoriteCards(userId?: string) {
	const favoriteCards = await prisma.collection.findMany({
		where: { 
			user_id: userId,
			favorite: true,
			card_id: { not: null } // Exclure les entrées sans carte
		},
		include: { card: true },
		orderBy: {
			card: {
				id: 'asc'
			}
		}
	});
	
	// Filtrer les null et retourner avec la quantité
	return favoriteCards
		.filter((item): item is typeof item & { card: NonNullable<typeof item.card> } => item.card !== null)
		.map(item => ({
			...item.card,
			quantity: item.quantity
		}));
}

// Fonction pour tirer une carte selon les probabilités de rareté
function getRandomRarity(): number {
    const random = Math.random() * 100;
    
    if (random < 85) {
        return 1; // Commune (85%)
    } else if (random < 97) { // 85 + 12
        return 2; // Rare (12%)
    } else {
        return 3; // Légendaire (3%)
    }
}

type DrawnCard = Prisma.cardsGetPayload<{}> & { 
    isNew: boolean;
    quantity: number;
    favorite: boolean;
};

// Version optimisée - charge toutes les cartes une seule fois
export async function drawCards(userId: string, amount: number): Promise<DrawnCard[]> {
    // Récupérer toutes les cartes par rareté en une seule fois
    const allCards = await prisma.cards.findMany({
        orderBy: { id: 'asc' }
    });
    
    // Grouper par rareté
    const cardsByRarity = {
        1: allCards.filter(c => c.rarity === 1),
        2: allCards.filter(c => c.rarity === 2),
        3: allCards.filter(c => c.rarity === 3)
    };
    
    const drawnCards: DrawnCard[] = [];
    
    for (let i = 0; i < amount; i++) {
        const rarity = getRandomRarity();
        const cardsOfRarity = cardsByRarity[rarity as 1 | 2 | 3];
        
        if (cardsOfRarity.length === 0) {
            throw new Error(`No cards found with rarity ${rarity}`);
        }
        
        // Sélectionner une carte au hasard
        const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
        
        // Vérifier si l'utilisateur possède déjà cette carte
        const existingCard = await prisma.collection.findFirst({
            where: {
                user_id: userId,
                card_id: randomCard.id
            }
        });
        
        let newQuantity: number;
        
        if (existingCard) {
            // Incrémenter la quantité
            const updated = await prisma.collection.update({
                where: { id: existingCard.id },
                data: { quantity: existingCard.quantity + 1 }
            });
            newQuantity = updated.quantity;
        } else {
            // Ajouter la carte à la collection
            await prisma.collection.create({
                data: {
                    user_id: userId,
                    card_id: randomCard.id,
                    quantity: 1,
                    favorite: false
                }
            });
            newQuantity = 1;
        }
        
        drawnCards.push({
            ...randomCard,
            isNew: !existingCard,
            quantity: newQuantity,
            favorite: existingCard ? existingCard.favorite : false
        });
    }
    
    return drawnCards;
}

// Retourne une attaque par ID.
export async function getAttackById(id?: number)
: Promise<Prisma.actionsGetPayload<{ include: { cards_talent: true, cards_attack1: true, cards_attack2: true } }>[]> {
	return prisma.actions.findMany({
		where: { id: id },
		include: { cards_talent: true, cards_attack1: true, cards_attack2: true }
	});
}

// Mets ou non une carte en favorite
export async function setFavoriteCard(cardId: number, userId: string, isFavorite: boolean) {
	const result = await prisma.collection.updateMany({
		where: {
			user_id: userId,
			card_id: cardId,
		},
		data: {
			favorite: isFavorite,
		},
	});
	
	return result;
}

// Récupérer les decks d'un utilisateur avec leurs cartes
export async function getUserDecks(userId: string) {
    return prisma.decks.findMany({
        where: { user_id: userId },
        include: {
            deck_cards: {
                include: {
                    card: {
                        include: {
                            talent_action: true,
                            attack1_action: true,
                            attack2_action: true,
                        }
                    },
                }
            }
        },
		orderBy: {
			id: 'asc'
		}
    });
}

// Crée un deck avec pour nom 'Deck n°[nombre de deck + 1]'
export async function createDeck(userId: string) {
	const lastDeck = await prisma.decks.findFirst({
        orderBy: {
            id: 'desc'
        },
        select: {
            id: true
        }
    });

	const userDecks = await prisma.decks.findMany({
		where: { user_id: userId },
	});

	const newDeckName = `Deck n°${(lastDeck?.id || 0) + 1}`;

	return prisma.decks.create({
		data: {
			name: newDeckName,
			user_id: userId,
		},
	});
}

// Supprime un deck par ID
export async function deleteDeck(userId: string, deckId: number) {
	return prisma.decks.delete({
		where: { id: deckId, user_id: userId},
	});
}

// Renomme le deck par son ID
export async function renameDeck(deckId: number, newName: string) {
	return prisma.decks.update({
		where: { id: deckId },
		data: { name: newName },
	});
}

// Dupliquer un deck
export async function duplicateDeck(userId: string, deckId: number) {
    // Récupérer le deck original avec ses cartes
    const originalDeck = await prisma.decks.findUnique({
        where: { 
            id: deckId,
            user_id: userId 
        },
        include: {
            deck_cards: true
        }
    });

    if (!originalDeck) {
        throw new Error("Deck non trouvé");
    }

    // Créer le nouveau deck
    const newDeck = await prisma.decks.create({
        data: {
            user_id: userId,
            name: `${originalDeck.name || 'Deck'} (copie)`,
            is_active: false
        }
    });

    // Copier toutes les cartes du deck original
    if (originalDeck.deck_cards.length > 0) {
        await prisma.deck_cards.createMany({
            data: originalDeck.deck_cards.map(deckCard => ({
                deck_id: newDeck.id,
                card_id: deckCard.card_id,
                quantity: deckCard.quantity
            }))
        });
    }

    return newDeck;
}

// Équiper un deck (désactive tous les autres decks de l'utilisateur)
export async function equipDeck(userId: string, deckId: number) {
    // Désactiver tous les decks de l'utilisateur
    await prisma.decks.updateMany({
        where: { user_id: userId },
        data: { is_active: false }
    });

    // Activer le deck sélectionné
    return prisma.decks.update({
        where: { 
            id: deckId,
            user_id: userId 
        },
        data: { is_active: true }
    });
}

// Récupérer le deck actif d'un utilisateur
export async function getActiveDeck(userId: string) {
    return prisma.decks.findFirst({
        where: { 
            user_id: userId,
            is_active: true 
        },
        include: {
            deck_cards: {
                include: {
                    card: {
                        include: {
                            talent_action: true,
                            attack1_action: true,
                            attack2_action: true,
                        }
                    },
                }
            }
        }
    });
}

// Ajouter une carte au deck (ou incrémenter quantity si elle existe déjà)
export async function addCardToDeck(deckId: number, cardId: number) {
    // Vérifier d'abord la limite
    const existing = await prisma.deck_cards.findUnique({
        where: {
            deck_id_card_id: {
                deck_id: deckId,
                card_id: cardId
            }
        }
    });

    if (existing && existing.quantity >= 2) {
        throw new Error("Maximum 2 exemplaires de cette carte");
    }

    // Utiliser upsert pour éviter les race conditions
    return prisma.deck_cards.upsert({
        where: {
            deck_id_card_id: {
                deck_id: deckId,
                card_id: cardId
            }
        },
        update: {
            quantity: {
                increment: 1
            }
        },
        create: {
            deck_id: deckId,
            card_id: cardId,
            quantity: 1
        }
    });
}

// Retirer une carte du deck
export async function removeCardFromDeck(deckId: number, cardId: number) {
    const existing = await prisma.deck_cards.findUnique({
        where: {
            deck_id_card_id: {
                deck_id: deckId,
                card_id: cardId
            }
        }
    });

    if (!existing) return null;

    if (existing.quantity > 1) {
        return prisma.deck_cards.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity - 1 }
        });
    }

    return prisma.deck_cards.delete({
        where: { id: existing.id }
    });
}