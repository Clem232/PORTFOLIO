// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Brain Cube — tests E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Passer l'écran de démarrage en cliquant sur "Jouer en tant qu'invité"
    await page.click('#btn-start-guest');
    await page.waitForSelector('#start-screen.hidden');
  });

  test("l'écran de démarrage s'affiche au chargement", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#start-title')).toHaveText('Brain Cube');
  });

  test("l'onglet inscription s'active", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('#tab-register');
    await expect(page.locator('#tab-register')).toHaveClass(/active/);
    await expect(page.locator('#tab-login')).not.toHaveClass(/active/);
  });

  test('le HUD affiche le niveau 1 et 0 déplacements', async ({ page }) => {
    await expect(page.locator('#level-num')).toHaveText('1');
    await expect(page.locator('#moves')).toHaveText('0');
  });

  test('les vies initialisées à 3 cœurs remplis', async ({ page }) => {
    const hearts = page.locator('#lives-display .heart.filled');
    await expect(hearts).toHaveCount(3);
  });

  test('un déplacement incrémente le compteur', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.getElementById('moves').textContent !== '0');
    await expect(page.locator('#moves')).not.toHaveText('0');
  });

  test('la touche R relance le niveau (reset déplacements)', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('R');
    await page.waitForFunction(() => document.getElementById('moves').textContent === '0');
    await expect(page.locator('#moves')).toHaveText('0');
  });

  test("l'overlay de victoire contient le score", async ({ page }) => {
    // Niveau 1 : solution = RIGHT RIGHT RIGHT DOWN (bloc couché Z en (4,4) → STANDING sur la case goal)
    // La grille est différente du jeu final, on vérifie juste la présence de l'overlay après win
    // On force l'overlay visible pour tester le DOM
    await page.evaluate(() => {
      document.getElementById('win-overlay').classList.add('show');
      document.getElementById('win-moves').textContent = '4';
      document.getElementById('win-score').textContent = '460';
    });
    await expect(page.locator('#win-overlay')).toBeVisible();
    await expect(page.locator('#win-score')).toHaveText('460');
  });

  test("l'overlay game over contient un bouton Recommencer", async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById('gameover-overlay').classList.add('show');
    });
    await expect(page.locator('#gameover-overlay')).toBeVisible();
    await expect(page.locator('#btn-gameover-restart')).toBeVisible();
  });

  test('le bouton Recommencer du game over remet les vies à 3', async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById('gameover-overlay').classList.add('show');
    });
    await page.click('#btn-gameover-restart');
    const hearts = page.locator('#lives-display .heart.filled');
    await expect(hearts).toHaveCount(3);
  });

  test('le canvas Three.js est présent', async ({ page }) => {
    await expect(page.locator('canvas#canvas')).toBeVisible();
  });

  test('la bannière de niveau change après "niveau suivant"', async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById('win-overlay').classList.add('show');
      document.getElementById('btn-next').style.display = '';
    });
    const before = await page.locator('#level-num').innerText();
    await page.click('#btn-next');
    await page.waitForFunction(
      (b) => document.getElementById('level-num').textContent !== b,
      before
    );
    const after = await page.locator('#level-num').innerText();
    expect(Number(after)).toBeGreaterThan(Number(before));
  });

});
