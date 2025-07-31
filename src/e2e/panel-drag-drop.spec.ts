import { test, expect } from "@playwright/test";

test("Floating panel drag and drop works", async ({ page }) => {
  await page.goto("http://localhost:5173");
  // Example: Find a panel and drag it
  const panel = await page.locator('[data-testid="floating-panel"]').first();
  await expect(panel).toBeVisible();
  // Simulate drag (update selector and logic as needed for your UI)
  await panel.dragTo(await page.locator('[data-testid="canvas"]'));
  // Add more assertions as needed
});
