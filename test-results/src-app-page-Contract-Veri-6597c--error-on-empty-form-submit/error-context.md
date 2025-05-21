# Test info

- Name: Contract Verification UI >> shows error on empty form submit
- Location: /Users/test/30 DAYS OF VIBE CODING /DAY6/src/app/page.spec.ts:4:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/test/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Contract Verification UI', () => {
>  4 |   test('shows error on empty form submit', async ({ page }) => {
     |       ^ Error: browserType.launch: Executable doesn't exist at /Users/test/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
   5 |     await page.goto('/');
   6 |     await expect(page.getByText('Contract Verification-as-a-Service')).toBeVisible();
   7 |     await page.getByRole('button', { name: /verify contract/i }).click();
   8 |     await expect(page.getByText(/error/i)).toBeVisible();
   9 |   });
  10 |
  11 |   // Add more tests for valid input, network selection, etc.
  12 | }); 
```