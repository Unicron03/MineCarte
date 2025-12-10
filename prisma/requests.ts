import { prisma } from '@/lib/prisma';
import { Prisma } from '../generated/prisma/client';

// Retourne les stats d'un utilisateur par ID.
export async function userStats(id: number = 1) {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			pseudo: true,
		}
	});
}

// Retourne la collection d'un utilisateur par ID.
export async function getUserCollection(id?: number)
: Promise<Prisma.collectionGetPayload<{ include: { card: true } }>[]> {
	return prisma.collection.findMany({
		where: { user_id: id },
		include: { card: true }
	});
}

// Retourne une attaque par ID.
export async function getAttackById(id?: number)
: Promise<Prisma.actionsGetPayload<{ include: { cards_talent: true, cards_attack1: true, cards_attack2: true } }>[]> {
	return prisma.actions.findMany({
		where: { id: id },
		include: { cards_talent: true, cards_attack1: true, cards_attack2: true }
	});
}