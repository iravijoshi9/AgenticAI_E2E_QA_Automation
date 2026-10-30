# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saucedemo-checkout\checkout.spec.js >> SCRUM-101 checkout flow >> Complete order and clear cart
- Location: tests\saucedemo-checkout\checkout.spec.js:145:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('[data-test="firstName"]')
Expected: "Ravi"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" locator('[data-test="firstName"]') with timeout 5000ms
  - waiting for locator('[data-test="firstName"]')
    14 × locator resolved to <input value="" type="text" id="first-name" name="firstName" autocorrect="off" data-test="firstName" autocapitalize="none" aria-label="First Name" placeholder="First Name" class="input_error form_input"/>
       - unexpected value ""

```

```yaml
- textbox "First Name"
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | const baseUrl = 'https://www.saucedemo.com';
  4   | 
  5   | async function logIn(page) {
  6   |   await page.goto(baseUrl);
  7   |   await page.getByPlaceholder('Username').fill('standard_user');
  8   |   await page.getByPlaceholder('Password').fill('secret_sauce');
  9   |   await page.getByRole('button', { name: 'Login' }).click();
  10  |   await expect(page).toHaveURL(/\/inventory\.html$/);
  11  | }
  12  | 
  13  | async function addProduct(page, slug) {
  14  |   await page.locator(`[data-test="add-to-cart-${slug}"]`).click();
  15  | }
  16  | 
  17  | async function openCart(page) {
  18  |   await page.locator('[data-test="shopping-cart-link"]').click();
  19  |   await expect(page).toHaveURL(/\/cart\.html$/);
  20  | }
  21  | 
  22  | async function openCheckout(page) {
  23  |   await openCart(page);
  24  |   await page.locator('[data-test="checkout"]').click();
  25  |   await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  26  | }
  27  | 
  28  | async function completeInformation(page, postalCode = '94043') {
  29  |   const firstName = page.locator('[data-test="firstName"]');
  30  |   const lastName = page.locator('[data-test="lastName"]');
  31  |   const zipCode = page.locator('[data-test="postalCode"]');
  32  | 
  33  |   await firstName.fill('Ravi');
> 34  |   await expect(firstName).toHaveValue('Ravi');
      |                           ^ Error: expect(locator).toHaveValue(expected) failed
  35  |   await lastName.fill('Joshi');
  36  |   await expect(lastName).toHaveValue('Joshi');
  37  |   await zipCode.fill(postalCode);
  38  |   await expect(zipCode).toHaveValue(postalCode);
  39  |   await page.locator('[data-test="continue"]').click();
  40  | }
  41  | 
  42  | async function expectNoHorizontalOverflow(page) {
  43  |   const dimensions = await page.evaluate(() => ({
  44  |     viewportWidth: document.documentElement.clientWidth,
  45  |     documentWidth: document.documentElement.scrollWidth,
  46  |   }));
  47  |   expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  48  | }
  49  | 
  50  | test.describe('SCRUM-101 checkout flow', () => {
  51  |   test.beforeEach(async ({ page }) => {
  52  |     await logIn(page);
  53  |   });
  54  | 
  55  |   test.afterEach(async ({ page }, testInfo) => {
  56  |     if (page && !page.isClosed() && testInfo.status !== testInfo.expectedStatus) {
  57  |       await testInfo.attach('failure-state', {
  58  |         body: await page.screenshot({ fullPage: true }),
  59  |         contentType: 'image/png',
  60  |       });
  61  |     }
  62  |   });
  63  | 
  64  |   test('Review cart item details and total', async ({ page }) => {
  65  |     test.fail(true, 'AC1 defect: the cart does not display the required total calculation.');
  66  |     await addProduct(page, 'sauce-labs-backpack');
  67  |     await addProduct(page, 'sauce-labs-bike-light');
  68  |     await openCart(page);
  69  | 
  70  |     await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  71  |     await expect(page.getByText('Sauce Labs Bike Light')).toBeVisible();
  72  |     await expect(page.getByText('$29.99')).toBeVisible();
  73  |     await expect(page.getByText('$9.99')).toBeVisible();
  74  |     await expect(page.getByText('$39.98', { exact: true })).toBeVisible();
  75  | 
  76  |     await page.getByRole('button', { name: 'Continue Shopping' }).click();
  77  |     await expect(page).toHaveURL(/\/inventory\.html$/);
  78  |     await expect(page.getByRole('button', { name: /Cart, 2 items/ })).toBeVisible();
  79  |     await openCart(page);
  80  |     await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  81  |     await expect(page.getByText('Sauce Labs Bike Light')).toBeVisible();
  82  |     await page.locator('[data-test="checkout"]').click();
  83  |     await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  84  |   });
  85  | 
  86  |   test('Require first name when all checkout fields are empty', async ({ page }) => {
  87  |     await addProduct(page, 'sauce-labs-backpack');
  88  |     await openCheckout(page);
  89  | 
  90  |     await page.locator('[data-test="continue"]').click();
  91  |     await expect(page.getByRole('alert')).toContainText('First Name is required');
  92  |     await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  93  |   });
  94  | 
  95  |   test('Require last name when first name is provided', async ({ page }) => {
  96  |     await addProduct(page, 'sauce-labs-backpack');
  97  |     await openCheckout(page);
  98  |     await page.getByPlaceholder('First Name').fill('Ravi');
  99  | 
  100 |     await page.locator('[data-test="continue"]').click();
  101 |     await expect(page.getByRole('alert')).toContainText('Last Name is required');
  102 |     await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  103 |   });
  104 | 
  105 |   test('Require postal code when names are provided', async ({ page }) => {
  106 |     await addProduct(page, 'sauce-labs-backpack');
  107 |     await openCheckout(page);
  108 |     await page.getByPlaceholder('First Name').fill('Ravi');
  109 |     await page.getByPlaceholder('Last Name').fill('Joshi');
  110 | 
  111 |     await page.locator('[data-test="continue"]').click();
  112 |     await expect(page.getByRole('alert')).toContainText('Postal Code is required');
  113 |     await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  114 |   });
  115 | 
  116 |   test('Reject invalid checkout information', async ({ page }) => {
  117 |     test.fail(true, 'AC5 defect: a postal code containing only special characters is accepted.');
  118 |     await addProduct(page, 'sauce-labs-backpack');
  119 |     await openCheckout(page);
  120 |     await completeInformation(page, '#$%');
  121 | 
  122 |     await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  123 |     await expect(page.getByRole('alert')).toBeVisible();
  124 |   });
  125 | 
  126 |   test('Review order overview and cancel checkout to the cart', async ({ page }) => {
  127 |     test.fail(true, 'Business-rule defect: overview Cancel navigates to inventory instead of the cart.');
  128 |     await addProduct(page, 'sauce-labs-backpack');
  129 |     await addProduct(page, 'sauce-labs-bike-light');
  130 |     await openCheckout(page);
  131 |     await completeInformation(page);
  132 | 
  133 |     await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  134 |     await expect(page.getByText('SauceCard #31337')).toBeVisible();
```