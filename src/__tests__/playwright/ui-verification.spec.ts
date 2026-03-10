import { test, expect, Page } from '@playwright/test';

// Helper pour la connexion (réutilisable)
async function login(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByPlaceholder('super.exemple@gmail.com').fill('alice@prisma.io');
  await page.getByPlaceholder('Votre mot de passe').fill('azertyuiop');
  await page.getByRole('button', { name: 'Se connecter' }).click();
}

test.describe('Vérifications UI', () => {
  
  test('Affichage de la page d\'accueil', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.getByText('© 2026 MineCarte. Tous droits réservés.')).toBeVisible();
  });

  test('Vérification des boutons sur la page d\'accueil', async ({ page }) => {
    await login(page);

    // Vérification des éléments de la page d'accueil
    await page.waitForTimeout(15000);
    await expect(page.getByRole('button', { name: /^(sombre|clair)$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Infos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Collection' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Combats' })).toBeVisible();
  });

  test('Vérification des éléments sur la page Collection', async ({ page }) => {
    await login(page);
    
    await page.getByRole('link', { name: 'Collection' }).click();
    
    // Vérifications
    await expect(page.getByRole('link', { name: 'Vitrine' })).toBeVisible();
    await expect(page.locator('div').nth(2)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Combats' })).toBeVisible();
  });


    test('Vérification des éléments sur la page de combat', async ({ page }) => {
    await login(page);
    
    await page.getByRole('link', { name: 'Combats' }).click();
    
    // Vérifications
    await expect(page.locator('span').filter({ hasText: '1v1' })).toBeVisible(); // Si le mode est visible
    await expect(page.getByRole('link').filter({ hasText: /^$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Collection' })).toBeVisible();
    // await page.pause();


  });

});

// DB setup/teardown are performed by scripts/test-setup.ts and scripts/test-teardown.ts