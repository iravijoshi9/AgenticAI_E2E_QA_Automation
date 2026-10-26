const { test, expect } = require('@playwright/test');

const baseUrl = 'https://www.saucedemo.com';

async function logIn(page) {
  await page.goto(baseUrl);
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/inventory\.html$/);
}

async function addProduct(page, slug) {
  await page.locator(`[data-test="add-to-cart-${slug}"]`).click();
}

async function openCart(page) {
  await page.getByRole('button', { name: /Cart/ }).click();
  await expect(page).toHaveURL(/\/cart\.html$/);
}

async function openCheckout(page) {
  await openCart(page);
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
}

async function completeInformation(page, postalCode = '94043') {
  await page.getByPlaceholder('First Name').fill('Ravi');
  await page.getByPlaceholder('Last Name').fill('Joshi');
  await page.getByPlaceholder('Zip/Postal Code').fill(postalCode);
  await page.getByRole('button', { name: 'Continue' }).click();
}

test.describe('SCRUM-101 checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await logIn(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (page && !page.isClosed() && testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('failure-state', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    }
  });

  test('Review cart item details and total', async ({ page }) => {
    test.fail(true, 'AC1 defect: the cart displays item details but no total calculation.');
    // Add two products and inspect the cart contents and price calculation.
    await addProduct(page, 'sauce-labs-backpack');
    await addProduct(page, 'sauce-labs-bike-light');
    await openCart(page);

    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('Sauce Labs Bike Light')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
    await expect(page.getByText('$9.99')).toBeVisible();
    await expect(page.getByText('$39.98', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await openCart(page);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Require first name when all checkout fields are empty', async ({ page }) => {
    await addProduct(page, 'sauce-labs-backpack');
    await openCheckout(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('alert')).toContainText('First Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Require last name when first name is provided', async ({ page }) => {
    await addProduct(page, 'sauce-labs-backpack');
    await openCheckout(page);
    await page.getByPlaceholder('First Name').fill('Ravi');

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('alert')).toContainText('Last Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Require postal code when names are provided', async ({ page }) => {
    await addProduct(page, 'sauce-labs-backpack');
    await openCheckout(page);
    await page.getByPlaceholder('First Name').fill('Ravi');
    await page.getByPlaceholder('Last Name').fill('Joshi');

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('alert')).toContainText('Postal Code is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Reject invalid checkout information', async ({ page }) => {
    test.fail(true, 'AC5 defect: the application accepts a postal code containing only special characters.');
    await addProduct(page, 'sauce-labs-backpack');
    await openCheckout(page);
    await completeInformation(page, '#$%');

    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('Review order overview and cancel checkout to the cart', async ({ page }) => {
    test.fail(true, 'Business-rule defect: Cancel on the overview returns to inventory instead of the cart.');
    await addProduct(page, 'sauce-labs-backpack');
    await addProduct(page, 'sauce-labs-bike-light');
    await openCheckout(page);
    await completeInformation(page);

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.getByText('SauceCard #31337')).toBeVisible();
    await expect(page.getByText('Free Pony Express Delivery!')).toBeVisible();
    await expect(page.getByText('Item total: $39.98')).toBeVisible();
    await expect(page.getByText('Tax: $3.20')).toBeVisible();
    await expect(page.getByText('Total: $43.18')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('Complete order and clear cart', async ({ page }) => {
    await addProduct(page, 'sauce-labs-backpack');
    await addProduct(page, 'sauce-labs-bike-light');
    await openCheckout(page);
    await completeInformation(page);

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

    await page.getByRole('button', { name: 'Back Home' }).click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test('Cancel checkout information and preserve cart', async ({ page }) => {
    await addProduct(page, 'sauce-labs-backpack');
    await openCheckout(page);
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('Prevent checkout without authentication or cart items', async ({ page }) => {
    test.fail(true, 'Business-rule defect: an empty cart still allows navigation to checkout information.');
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.goto(`${baseUrl}/checkout-step-one.html`);
    await expect(page).toHaveURL(baseUrl + '/');
    await expect(page.getByRole('alert')).toContainText('when you are logged in');

    await logIn(page);
    await openCart(page);
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/\/cart\.html$/);
  });

  test('Keep checkout usable at a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await addProduct(page, 'sauce-labs-backpack');
    await openCheckout(page);

    const formDimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    expect(formDimensions.documentWidth).toBeLessThanOrEqual(formDimensions.viewportWidth);
    await expect(page.getByPlaceholder('First Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

    await completeInformation(page);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.getByText('Total: $32.39')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
  });
});
