import 'dotenv/config'

// Ce script nettoie la table decks pour l'utilisateur de test avant d'exécuter les tests E2E.
// Exécuter via: `npx tsx scripts/test-setup.ts`

async function main() {
  const mod = await import('./../src/lib/prisma')
  const prisma = mod.prisma
  try {
    const user = await prisma.user.findUnique({ where: { email: 'alice@prisma.io' } })
    const userId = user?.id
    if (userId) {
      await prisma.decks.deleteMany({ where: { user_id: userId } })
      console.log('Deleted decks for user', userId)
    } else {
      console.log('Test user not found; skipping deck cleanup')
    }
  } catch (e) {
    console.error('Setup error', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect?.()
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
