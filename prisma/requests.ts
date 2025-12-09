import { prisma } from '@/lib/prisma';

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