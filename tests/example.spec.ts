import { test, expect } from '@playwright/test';

test('Affichage de la page', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Voir le texte de copyright
  await expect(page.getByText('© 2026 MineCarte. Tous droits réservés.')).toBeVisible();
});

test('Inscription', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  // Cliquer sur le bouton d'inscription
  await page.getByRole('button', { name: 'S\'inscrire' }).click();
  await page.getByPlaceholder('Votre pseudo').fill('Amen123');
  await page.getByPlaceholder('super.exemple@gmail.com').fill('ahouandogboamen@gmail.com');
  await page.getByPlaceholder('Votre mot de passe').fill('azerty1234');
  await page.getByRole('button', { name: 'S\'inscrire' }).click();
});

test('Connexion', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  // Cliquer sur le bouton de connexion
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByPlaceholder('super.exemple@gmail.com').fill('ahouandogboamen@gmail.com');
  await page.getByPlaceholder('Votre mot de passe').fill('azerty1234');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.pause();
});





/*test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});*/
