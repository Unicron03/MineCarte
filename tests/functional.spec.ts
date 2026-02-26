import { test, expect } from '@playwright/test';

test.describe('Fonctionnalités', () => {
  
  test('Inscription d\'un nouvel utilisateur', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    await page.getByPlaceholder('Votre pseudo').fill('Amen123');
    await page.getByPlaceholder('super.exemple@gmail.com').fill('alice@prisma.io');
    await page.getByPlaceholder('Votre mot de passe').fill('azertyuiop');
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
  });

  test('Connexion avec un compte existant', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.getByPlaceholder('super.exemple@gmail.com').fill('alice@prisma.io');
    await page.getByPlaceholder('Votre mot de passe').fill('azertyuiop');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    

  });


    test('Ouverture du coffre', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        
        // Connexion
        await page.getByRole('button', { name: 'Se connecter' }).click();
        await page.getByPlaceholder('super.exemple@gmail.com').fill('alice@prisma.io');
        await page.getByPlaceholder('Votre mot de passe').fill('azertyuiop');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        
        // Ouvrir le coffre quand il est disponible 
        await page.getByRole('img', { name: 'Coffre' }).click();
        await page.locator('span').nth(1).click();
  });

  test('Accès et modification du pseudo', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Connexion
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.getByPlaceholder('super.exemple@gmail.com').fill('alice@prisma.io');
    await page.getByPlaceholder('Votre mot de passe').fill('azertyuiop');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Ouvrir la configuration et modifier le pseudo
    await page.locator('header').getByRole('link').click();
    await page.locator('#edit-pseudo-button').click();

    
    
    // Vérifier que le dialog s'ouvre

        await expect(page.locator('#edit-pseudo-champ')).toBeVisible();
   //await expect(page.getByRole('heading', { name: 'Modifier le pseudo' })).toBeVisible();
    
  });
  

  test('Création de deck', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Connexion
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.getByPlaceholder('super.exemple@gmail.com').fill('alice@prisma.io');
    await page.getByPlaceholder('Votre mot de passe').fill('azertyuiop');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Ouvrir la page de combats
    await page.getByRole('link', { name: 'Combats' }).click();

    // Clique le bouton de création deck
    await page.pause();
    await page.locator('#decks').click();
    await page.getByRole('button', { name: 'Créer un nouveau deck' }).click();
    await page.getByRole('img', { name: 'Deck vide' }).click();
    // await page.pause();
  });



  

});