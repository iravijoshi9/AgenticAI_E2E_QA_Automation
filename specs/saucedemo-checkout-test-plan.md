# SCRUM-101 Saucedemo Checkout Test Plan

## Application Overview

End-to-end functional, validation, navigation, responsive, and cart/order coverage for the SCRUM-101 checkout story on https://www.saucedemo.com. Use the standard_user / secret_sauce test account. Each scenario starts in a fresh logged-in state unless it explicitly tests authentication; add specified products from the inventory when needed. Observed product data: Sauce Labs Backpack $29.99 and Sauce Labs Bike Light $9.99. The application currently proceeds to overview when postal code contains '#$%' and the cart screen has no displayed total; retain acceptance-criteria assertions to detect these potential defects.

## Test Scenarios

### 1. Checkout Flow

**Seed:** `tests/seed.spec.ts`

#### 1.1. Review cart item details and total

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in as standard_user / secret_sauce, add Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99), then open the cart.
    - expect: The cart page is displayed with a quantity of 1 for each selected product.
  2. Inspect each cart row and the cart summary.
    - expect: Both product names, descriptions, unit prices ($29.99 and $9.99), and quantities are correct.
    - expect: A cart total/subtotal calculation of $39.98 is visible, as required by AC1.
  3. Select Continue Shopping and reopen the cart.
    - expect: The inventory page opens and the same products remain in the cart.
  4. Select Checkout.
    - expect: The checkout information form opens.

#### 1.2. Require first name when all checkout fields are empty

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add a product, open the cart, and select Checkout.
    - expect: The checkout information form is displayed.
  2. Leave First Name, Last Name, and Zip/Postal Code empty and select Continue.
    - expect: The user remains on the information form and sees 'First Name is required'.

#### 1.3. Require last name when first name is provided

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add a product, open Checkout, and enter a valid first name while leaving the other fields empty.
    - expect: The entered first name is retained.
  2. Select Continue.
    - expect: The user remains on the form and sees 'Last Name is required'.

#### 1.4. Require postal code when names are provided

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add a product, open Checkout, and enter valid first and last names while leaving Zip/Postal Code empty.
    - expect: The two entered names are retained.
  2. Select Continue.
    - expect: The user remains on the form and sees 'Postal Code is required'.

#### 1.5. Reject invalid checkout information

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add a product, open Checkout, and enter names plus a clearly invalid postal code such as '#$%'.
    - expect: The invalid postal value is rejected with a clear validation message.
  2. Select Continue.
    - expect: Navigation to the overview is blocked until postal information is valid.

#### 1.6. Review order overview and cancel checkout

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add Backpack and Bike Light, proceed to Checkout, and enter Ravi, Joshi, and 94043.
    - expect: The overview page lists both products and correct unit prices.
  2. Inspect payment, shipping, subtotal, tax, and total.
    - expect: Payment and shipping information are visible.
    - expect: Subtotal is $39.98, tax is $3.20, and total is $43.18.
  3. Select Cancel.
    - expect: The user returns to the cart and the order has not been completed.

#### 1.7. Complete order and clear cart

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add Backpack and Bike Light, proceed to Checkout, and enter Ravi, Joshi, and 94043.
    - expect: The order overview shows the expected products and totals.
  2. Select Finish.
    - expect: The order confirmation page displays 'Thank you for your order!' and a Back Home button.
    - expect: The cart is empty after order completion.
  3. Select Back Home.
    - expect: The inventory page is displayed.

#### 1.8. Cancel checkout information and preserve cart

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Log in, add one product, open Checkout, and select Cancel.
    - expect: The user returns to the cart and the product remains in the cart.

#### 1.9. Prevent checkout without authentication or cart items

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. In a logged-out browser state, navigate directly to /checkout-step-one.html.
    - expect: The user is redirected to the login page or otherwise denied checkout access.
  2. Log in with standard_user / secret_sauce, open the cart without adding products, then inspect checkout controls and attempt the checkout URL directly.
    - expect: An empty cart cannot proceed to checkout or create an order.

#### 1.10. Verify checkout layout at mobile viewport

**File:** `tests/saucedemo-checkout/checkout.spec.js`

**Steps:**
  1. Set a mobile viewport, log in, add a product, and navigate through Checkout to the overview.
    - expect: The checkout form fields and primary actions remain visible and usable without horizontal overflow.
  2. Inspect the overview and confirmation at the same viewport.
    - expect: Order details, totals, Finish, confirmation message, and Back Home remain visible and usable.
