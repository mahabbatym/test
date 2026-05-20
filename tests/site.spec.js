const { test, expect } = require('@playwright/test');

// Тексерілетін сайттардың тізімі
const urls = [
  'https://cherry-peach.vercel.app',
  'https://cherry-hbvqws258-meninproektterim.vercel.app'
];

urls.forEach((url) => {
  test.describe(`Сайтты тексеру: ${url}`, () => {
    
    // 1-тест: Сайт сәтті ашылып тұр ма?
    test('Басты бет сәтті ашылуы керек', async ({ page }) => {
      // Сайтқа өту
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      // Сервер қателік бермегенін тексеру (Статус код 200 болуы тиіс)
      expect(response.status()).toBe(200);
      
      // Сайттың скриншотын алып, скриншоттар папкасына сақтау
      await page.screenshot({ path: `screenshots/home-${url.replace('https://', '').replace(/\./g, '-')}.png` });
    });

    // 2-тест: Сайтта қателіктер (Console Errors) шығып тұрған жоқ па?
    test('Консольде критикалық қателіктер болмауы керек', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (exception) => {
        errors.push(exception);
      });

      await page.goto(url);
      
      // Егер консольде қате болса, тест өтпей қалады
      expect(errors).toHaveLength(0);
    });

  });
});