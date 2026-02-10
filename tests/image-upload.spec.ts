import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// HELPERS
// ============================================

/** Create a minimal valid PNG file for testing (1x1 red pixel) */
function createTestPng(filePath: string): void {
  // Minimal valid PNG: 1x1 pixel, red
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  fs.writeFileSync(filePath, png);
}

/** Create a valid JPEG file for testing */
function createTestJpeg(filePath: string): void {
  // Minimal valid JPEG: 1x1 pixel
  const jpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c,
    0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d,
    0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34,
    0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4,
    0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff,
    0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04,
    0x00, 0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00,
    0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
    0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1,
    0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35,
    0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55,
    0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65,
    0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85,
    0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94,
    0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2,
    0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba,
    0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8,
    0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6,
    0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda,
    0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    0x7b, 0x94, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xff, 0xd9,
  ]);
  fs.writeFileSync(filePath, jpeg);
}

/** Create a simple SVG test file */
function createTestSvg(filePath: string): void {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="red"/></svg>`;
  fs.writeFileSync(filePath, svg);
}

/** Create a text file (invalid image) for rejection testing */
function createInvalidFile(filePath: string): void {
  fs.writeFileSync(filePath, 'This is not an image file');
}

// Temp dir for test assets
const tmpDir = path.join(__dirname, '.tmp-test-assets');

test.beforeAll(async () => {
  // Create temp dir and test files
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  createTestPng(path.join(tmpDir, 'test-logo.png'));
  createTestJpeg(path.join(tmpDir, 'test-hero.jpg'));
  createTestSvg(path.join(tmpDir, 'test-logo.svg'));
  createInvalidFile(path.join(tmpDir, 'invalid.txt'));
});

test.afterAll(async () => {
  // Cleanup temp files
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

/** Log in as Super Admin via the demo button */
async function loginAsSuperAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for login page to load — look for demo buttons
  // The demo buttons show the user's first name
  const superAdminBtn = page.locator('button').filter({ hasText: /Super/i }).first();
  await expect(superAdminBtn).toBeVisible({ timeout: 15000 });
  await superAdminBtn.click();
  
  // Wait for navigation to Dashboard (confirms login succeeded)
  await page.waitForTimeout(1500);
  await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
}

/** Navigate to Settings → Appearance tab */
async function goToAppearanceTab(page: any) {
  // Click Settings in the nav
  const settingsBtn = page.locator('button').filter({ hasText: /Settings/i }).first();
  await settingsBtn.click();
  await page.waitForTimeout(800);
  
  // Click the Appearance tab
  const appearanceTab = page.locator('button').filter({ hasText: /Appearance/i }).first();
  await expect(appearanceTab).toBeVisible({ timeout: 5000 });
  await appearanceTab.click();
  await page.waitForTimeout(500);
}

// ============================================
// TESTS
// ============================================

test.describe('Image Upload System', () => {

  test.describe('Login & Navigation', () => {
    test('can log in as Super Admin and reach Settings', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);
      
      // Verify Appearance tab content is visible
      await expect(page.locator('text=Branding & Theme').first()).toBeVisible();
      await expect(page.locator('text=Platform Logo').first()).toBeVisible();
      await expect(page.locator('text=Login Experience').first()).toBeVisible();
    });
  });

  test.describe('Platform Logo Upload', () => {
    test('can upload a PNG logo via the platform logo uploader', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      // Switch logo mode to Upload
      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      // Find the platform logo upload area
      const uploadPlatformBtn = page.locator('button').filter({ hasText: /Upload Platform Logo/i }).first();
      await expect(uploadPlatformBtn).toBeVisible();

      // Trigger file upload via the hidden input
      const fileInput = page.locator('[data-testid="logo-platform-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.png'));

      // Wait for upload to complete — preview should appear
      const preview = page.locator('[data-testid="platform-logo-preview"]');
      await expect(preview).toBeVisible({ timeout: 10000 });
      
      // Verify the preview shows the filename
      await expect(preview.locator('text=test-logo.png')).toBeVisible();
    });

    test('can upload a light mode logo', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      const fileInput = page.locator('[data-testid="logo-light-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.png'));

      const preview = page.locator('[data-testid="light-logo-preview"]');
      await expect(preview).toBeVisible({ timeout: 10000 });
    });

    test('can upload a dark mode logo', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      const fileInput = page.locator('[data-testid="logo-dark-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.png'));

      const preview = page.locator('[data-testid="dark-logo-preview"]');
      await expect(preview).toBeVisible({ timeout: 10000 });
    });

    test('can upload SVG logo', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      const fileInput = page.locator('[data-testid="logo-platform-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.svg'));

      const preview = page.locator('[data-testid="platform-logo-preview"]');
      await expect(preview).toBeVisible({ timeout: 10000 });
      await expect(preview.locator('text=test-logo.svg')).toBeVisible();
    });

    test('can reset platform logo to default', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      // Upload first
      const fileInput = page.locator('[data-testid="logo-platform-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.png'));

      const preview = page.locator('[data-testid="platform-logo-preview"]');
      await expect(preview).toBeVisible({ timeout: 10000 });

      // Click reset button
      const resetBtn = page.locator('[data-testid="reset-platform-logo"]');
      await resetBtn.click();
      await page.waitForTimeout(500);

      // Preview should disappear
      await expect(preview).not.toBeVisible();
    });
  });

  test.describe('Hero Image Upload', () => {
    test('can upload a hero image', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      // Scroll to Login Experience section
      await page.locator('text=Login Experience').first().scrollIntoViewIfNeeded();

      // Switch to Upload mode for hero
      const heroUploadToggle = page.locator('text=Login Experience').locator('..').locator('button').filter({ hasText: /^Upload$/ });
      // Find the Upload button in the hero section (second toggle on page)
      const allUploadToggles = page.locator('button').filter({ hasText: /^Upload$/ });
      // The second "Upload" toggle should be the hero one (first is logo)
      const heroToggle = allUploadToggles.nth(1);
      await heroToggle.click();
      await page.waitForTimeout(300);

      // Upload hero image
      const fileInput = page.locator('[data-testid="hero-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-hero.jpg'));
      await page.waitForTimeout(1500);

      // The hero preview should update — look for the Preview badge
      const previewBadge = page.locator('text=Preview');
      await expect(previewBadge).toBeVisible();
    });

    test('can reset hero image to default', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      // Switch to Upload mode
      const allUploadToggles = page.locator('button').filter({ hasText: /^Upload$/ });
      const heroToggle = allUploadToggles.nth(1);
      await heroToggle.click();
      await page.waitForTimeout(300);

      // Upload first
      const fileInput = page.locator('[data-testid="hero-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-hero.jpg'));
      await page.waitForTimeout(1500);

      // Reset button should appear
      const resetBtn = page.locator('[data-testid="reset-hero-image"]');
      await expect(resetBtn).toBeVisible({ timeout: 5000 });
      await resetBtn.click();
      await page.waitForTimeout(500);

      // Reset button should disappear (no uploaded image)
      await expect(resetBtn).not.toBeVisible();
    });
  });

  test.describe('Logo Display Propagation', () => {
    test('uploaded platform logo appears in the navigation bar', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      // Switch to upload mode
      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      // Upload platform logo
      const fileInput = page.locator('[data-testid="logo-platform-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.png'));
      await page.waitForTimeout(1500);

      // Save settings
      const saveBtn = page.locator('button').filter({ hasText: /Save Changes/i }).first();
      await saveBtn.click();
      await page.waitForTimeout(1500);

      // The navbar logo should now be an <img> element (not the default text circle)
      // The logo is in the top-left pill
      const navLogo = page.locator('header img').first();
      await expect(navLogo).toBeVisible({ timeout: 5000 });
      
      // Verify it has a src attribute that's a data URL (from localStorage)
      const src = await navLogo.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src!.startsWith('data:image/')).toBeTruthy();
    });
  });

  test.describe('Persistence Across Sessions', () => {
    test('uploaded logo persists after page reload', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      // Switch to upload mode and upload
      const uploadToggle = page.locator('button').filter({ hasText: /^Upload$/ }).first();
      await uploadToggle.click();
      await page.waitForTimeout(300);

      const fileInput = page.locator('[data-testid="logo-platform-file-input"]');
      await fileInput.setInputFiles(path.join(tmpDir, 'test-logo.png'));
      await page.waitForTimeout(1000);

      // Save settings
      const saveBtn = page.locator('button').filter({ hasText: /Save Changes/i }).first();
      await saveBtn.click();
      await page.waitForTimeout(1500);

      // Reload page — session may reset to login
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Re-login (session is not persisted across reloads in this mock setup)
      await loginAsSuperAdmin(page);

      // After re-login, the nav logo should be an <img> loaded from persisted localStorage data
      const navLogo = page.locator('header img').first();
      await expect(navLogo).toBeVisible({ timeout: 10000 });

      const src = await navLogo.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src!.startsWith('data:image/')).toBeTruthy();
    });
  });

  test.describe('File Validation', () => {
    test('shows settings page with file inputs restricted to image types', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await goToAppearanceTab(page);

      // Verify the hidden file inputs have correct accept attributes
      const logoInput = page.locator('[data-testid="logo-platform-file-input"]');
      const accept = await logoInput.getAttribute('accept');
      expect(accept).toContain('image/png');
      expect(accept).toContain('image/jpeg');
      expect(accept).toContain('image/svg+xml');
      expect(accept).toContain('.png');
      expect(accept).toContain('.jpg');
      expect(accept).toContain('.svg');
    });
  });
});
