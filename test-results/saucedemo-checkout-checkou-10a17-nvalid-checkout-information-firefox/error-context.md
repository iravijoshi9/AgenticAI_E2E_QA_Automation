# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saucedemo-checkout\checkout.spec.js >> SCRUM-101 checkout flow >> Reject invalid checkout information
- Location: tests\saucedemo-checkout\checkout.spec.js:116:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/checkout-step-one\.html$/
Received string:  "https://www.saucedemo.com/checkout-step-two.html"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "https://www.saucedemo.com/checkout-step-two.html"

```

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, 1 items": "1"
  - text: "Checkout: Overview"
- main:
  - text: QTY Description 1
  - button "View details for Sauce Labs Backpack": Sauce Labs Backpack
  - text: "carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection. $29.99 Payment Information: SauceCard #31337 Shipping Information: Free Pony Express Delivery! Price Total Item total: $29.99 Tax: $2.40 Total: $32.39"
  - button "Cancel"
  - button "Finish"
- contentinfo:
  - list:
    - listitem:
      - link "X":
        - /url: https://x.com/saucelabs
    - listitem:
      - link "Facebook":
        - /url: https://www.facebook.com/saucelabs
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/sauce-labs/
  - text: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
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
  34  |   await expect(firstName).toHaveValue('Ravi');
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
> 122 |     await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  135 |     await expect(page.getByText('Free Pony Express Delivery!')).toBeVisible();
  136 |     await expect(page.getByText('Item total: $39.98')).toBeVisible();
  137 |     await expect(page.getByText('Tax: $3.20')).toBeVisible();
  138 |     await expect(page.getByText('Total: $43.18')).toBeVisible();
  139 | 
  140 |     await page.locator('[data-test="cancel"]').click();
  141 |     await expect(page).toHaveURL(/\/cart\.html$/);
  142 |     await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  143 |   });
  144 | 
  145 |   test('Complete order and clear cart', async ({ page }) => {
  146 |     await addProduct(page, 'sauce-labs-backpack');
  147 |     await addProduct(page, 'sauce-labs-bike-light');
  148 |     await openCheckout(page);
  149 |     await completeInformation(page);
  150 | 
  151 |     await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  152 |     await page.locator('[data-test="finish"]').click();
  153 |     await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  154 |     await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  155 |     await expect(page.getByRole('button', { name: 'Back Home' })).toBeVisible();
  156 |     await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
  157 | 
  158 |     await page.locator('[data-test="back-to-products"]').click();
  159 |     await expect(page).toHaveURL(/\/inventory\.html$/);
  160 |   });
  161 | 
  162 |   test('Cancel checkout information and preserve cart', async ({ page }) => {
  163 |     await addProduct(page, 'sauce-labs-backpack');
  164 |     await openCheckout(page);
  165 |     await page.locator('[data-test="cancel"]').click();
  166 | 
  167 |     await expect(page).toHaveURL(/\/cart\.html$/);
  168 |     await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  169 |   });
  170 | 
  171 |   test('Prevent checkout without authentication or cart items', async ({ page }) => {
  172 |     test.fail(true, 'Business-rule defect: checkout from an empty cart is not blocked.');
  173 |     await page.getByRole('button', { name: 'Open Menu' }).click();
  174 |     await page.getByRole('button', { name: 'Logout' }).click();
  175 |     await page.goto(`${baseUrl}/checkout-step-one.html`);
  176 |     await expect(page).toHaveURL(baseUrl + '/');
  177 |     await expect(page.getByRole('alert')).toContainText('when you are logged in');
  178 | 
  179 |     await logIn(page);
  180 |     await openCart(page);
  181 |     await page.locator('[data-test="checkout"]').click();
  182 |     await expect(page).toHaveURL(/\/cart\.html$/);
  183 |   });
  184 | 
  185 |   test('Keep checkout usable at a mobile viewport', async ({ page }) => {
  186 |     await page.setViewportSize({ width: 390, height: 844 });
  187 |     await addProduct(page, 'sauce-labs-backpack');
  188 |     await openCheckout(page);
  189 | 
  190 |     await expectNoHorizontalOverflow(page);
  191 |     await expect(page.getByPlaceholder('First Name')).toBeVisible();
  192 |     await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  193 | 
  194 |     await completeInformation(page);
  195 |     await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  196 |     await expect(page.getByText('Total: $32.39')).toBeVisible();
  197 |     await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
  198 |     await expectNoHorizontalOverflow(page);
  199 | 
  200 |     await page.locator('[data-test="finish"]').click();
  201 |     await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  202 |     await expect(page.getByRole('button', { name: 'Back Home' })).toBeVisible();
  203 |     await expectNoHorizontalOverflow(page);
  204 |   });
  205 | });
  206 | 
```