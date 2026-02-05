/*import { test, expect } from '@playwright/test';

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
 // Connexion au compte 
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByPlaceholder('super.exemple@gmail.com').fill('ahouandogboamen@gmail.com');
  await page.getByPlaceholder('Votre mot de passe').fill('azerty1234');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByRole('img', { name: 'Coffre' });
});

test('Verification des boutons sur la page d\'acceuil', async ({ page }) => {
  // Acces à la page d'accueil
  await page.goto('http://localhost:3000/');

  // Connexion au compte 
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByPlaceholder('super.exemple@gmail.com').fill('ahouandogboamen@gmail.com');
  await page.getByPlaceholder('Votre mot de passe').fill('azerty1234');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // Verification des elements de la page d'accueil
  await page.locator('div').nth(1); 
  await page.getByRole('button', { name: /sombre|clair/i });
  await page.getByRole('button', { name: 'Infos' });
  await page.locator('header').getByRole('button', {name : 'link'});
  await page.locator('link').nth(1); 
  await page.getByRole('link', { name: 'Accueil' });
  await page.getByRole('link', { name: 'Collection' });
  await page.getByRole('link', { name: 'Combats' });
  await page.locator('link').nth(5); 
});

test('Acces à la page de configuration du compte', async ({ page }) => {
   await page.goto('http://localhost:3000/');

  // Connexion au compte 
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByPlaceholder('super.exemple@gmail.com').fill('ahouandogboamen@gmail.com');
  await page.getByPlaceholder('Votre mot de passe').fill('azerty1234');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Ouvrir la page de configuration du compte et tester l'affichage de la pop-up de modification du pseudo
  await page.locator('header').getByRole('link').click();
  await page.getByRole('button').nth(3).click();
  await page.getByRole('dialog', { name: 'Modifier le pseudo' });

});

test('Vérification des éléments sur la page Collection', async ({ page }) => {
   await page.goto('http://localhost:3000/');

  // Connexion au compte 
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByPlaceholder('super.exemple@gmail.com').fill('ahouandogboamen@gmail.com');
  await page.getByPlaceholder('Votre mot de passe').fill('azerty1234');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // La page de colllection et vérifier des éléments de la page
  await page.getByRole('link', { name: 'Collection' }).click();
  await page.getByRole('link', { name: 'Vitrine' });
  await page.locator('div').nth(2);
  await page.pause();
});

*/













