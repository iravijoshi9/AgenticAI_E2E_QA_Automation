# SCRUM-101 Checkout Test Execution Report

**Execution date:** 2026-10-28  
**Application:** https://www.saucedemo.com  
**Browsers:** Chromium, Firefox, WebKit  
**Viewport:** Desktop and 390 x 844 mobile viewport  
**Test account:** `standard_user` (password intentionally omitted)

## Executive Summary

The test plan defines 10 scenarios. All 10 were manually explored, and all 10 were automated and run in Chromium, Firefox, and WebKit (30 browser/test executions).

The final Playwright run completed successfully with **30 accepted outcomes and 0 unexpected failures**. This includes **18 passing test outcomes and 12 expected failures**: four confirmed application defects, each asserted in all three browser projects. The overall quality status is **FAIL / remediation required**, because AC1 and AC5 and two checkout business rules are not met.

| Measure | Result |
|---|---:|
| Scenarios planned | 10 |
| Scenarios manually explored | 10 |
| Automated executions | 30 (10 scenarios x 3 browser projects) |
| Final passing outcomes | 18 |
| Final expected-failure outcomes | 12 |
| Unexpected automation failures | 0 |
| Confirmed application defects | 4 |

## Manual Test Results

| # | Scenario | Result | Observation |
|---|---|---|---|
| 1 | Review cart item details and total | **FAIL** | Both products, descriptions, quantities, and prices were present. The cart did not display the required $39.98 subtotal/total. See [cart review](./evidence/cart-review.png). |
| 2 | Require first name when fields are empty | **PASS** | Continue was blocked with “First Name is required”. See [required-field error](./evidence/required-first-name-error.png). |
| 3 | Require last name when first name is provided | **PASS** | Continue was blocked with “Last Name is required”. |
| 4 | Require postal code when names are provided | **PASS** | Continue was blocked with “Postal Code is required”. |
| 5 | Reject invalid checkout information | **FAIL** | Postal value `#$%` was accepted and the application navigated to the overview. See [invalid postal code accepted](./evidence/invalid-postal-accepted.png). |
| 6 | Review overview and cancel to cart | **FAIL** | Payment/shipping details and totals were correct ($39.98 subtotal, $3.20 tax, $43.18 total), but Cancel returned to inventory instead of the cart. See [order overview](./evidence/order-overview-valid.png). |
| 7 | Complete order and clear cart | **PASS** | Finish showed the success message, the cart was empty, and Back Home returned to inventory. See [order confirmation](./evidence/order-confirmation.png). |
| 8 | Cancel checkout information and preserve cart | **PASS** | Cancel returned to the cart and preserved the selected product. |
| 9 | Prevent checkout without authentication or cart items | **PARTIAL / FAIL** | Direct unauthenticated access redirected to login. With an empty cart, Checkout remained enabled and opened the information form. See [empty cart](./evidence/empty-cart-checkout-available.png). |
| 10 | Keep checkout usable on mobile | **PASS** | At 390 x 844, the information, overview, and confirmation pages had no horizontal document overflow; primary controls remained visible and usable. See [mobile information](./evidence/mobile-checkout-information.png), [mobile overview](./evidence/mobile-order-overview.png), and [mobile confirmation](./evidence/mobile-order-confirmation.png). |

### Exploratory observations

- The cart exposes stable `data-test` selectors for its controls and products.
- The required-field messages are specific and appear in an accessible alert.
- The overview shows SauceCard #31337, Free Pony Express Delivery!, and the expected item/tax/total calculations.
- A 390 px window reported no horizontal document overflow on the tested checkout pages.
- The browser console recorded 401 responses from the app's external Backtrace telemetry event endpoint; no console warnings were observed. These did not block checkout testing.

## Automated Test Results

**Suite:** [`checkout.spec.js`](../tests/saucedemo-checkout/checkout.spec.js)  
**Plan:** [`saucedemo-checkout-test-plan.md`](../specs/saucedemo-checkout-test-plan.md)

The suite covers the 10 planned scenarios. Browser projects are Chromium, Firefox, and WebKit (the Safari engine).

### Initial run

The first run produced **27 passing outcomes and 3 unexpected failures**. All three failures were the authentication/empty-cart scenario timing out because it used a nonexistent `[data-test="open-menu"]` selector.

### Healing activities

1. Replaced the nonexistent menu selector with the accessible “Open Menu” button.
2. Corrected the logout selector to the actual “Logout” button after the intermediate run showed it was not a link.
3. Changed checkout information entry to stable `data-test` locators and added value assertions before Continue. This addressed an intermittent WebKit form-entry failure without weakening validation assertions.
4. Preserved acceptance assertions for the four confirmed application defects as expected failures; the tests still verify the required behavior and do not treat the defects as passing functionality.
5. Re-ran the focused completion/authentication scenarios, then the full suite across all three browser projects.

### Final run

The final run completed with exit code 0: **30 accepted outcomes, 0 unexpected failures**. There were 18 normal passes and 12 expected-failure outcomes (four product defects x three browsers).

| Browser project | Scenarios | Passing outcomes | Expected failures | Unexpected failures |
|---|---:|---:|---:|---:|
| Chromium | 10 | 6 | 4 | 0 |
| Firefox | 10 | 6 | 4 | 0 |
| WebKit | 10 | 6 | 4 | 0 |
| **Total** | **30** | **18** | **12** | **0** |

## Defects Log

| Bug ID | Severity | Title | Expected vs. actual | Reproduction summary | Evidence |
|---|---|---|---|---|---|
| SCRUM-101-QA-01 | Medium | Cart total is not displayed | AC1 requires a cart total calculation; the cart shows item prices but no total/subtotal. | Add Backpack and Bike Light, open the cart, and inspect its summary. | [Cart review](./evidence/cart-review.png) |
| SCRUM-101-QA-02 | Medium | Invalid postal value is accepted | AC5 requires invalid data to be rejected; `#$%` advances to the order overview. | Add a product, enter valid names and `#$%` as postal code, then Continue. | [Invalid postal code accepted](./evidence/invalid-postal-accepted.png) |
| SCRUM-101-QA-03 | Medium | Empty cart can proceed to checkout | Business rule requires a non-empty cart; Checkout is enabled and opens checkout information with no items. | Remove all items, select Checkout, and observe the information page. | [Empty cart](./evidence/empty-cart-checkout-available.png) |
| SCRUM-101-QA-04 | Low | Overview Cancel returns to inventory | Business rule says cancellation at any checkout step returns to the cart; overview Cancel navigates to inventory. | Add items, proceed to overview, and select Cancel. | [Order overview](./evidence/order-overview-valid.png) |

These are observed test defects against the public demo application, not changes made to application code in this repository. No independent bug tracker IDs were available; the IDs above are report-local.

## Test Coverage Analysis

| Acceptance criterion / rule | Manual | Automated | Coverage and result |
|---|---|---|---|
| AC1: Cart item details, total, and navigation | Yes | Yes, all 3 browsers | Product details and navigation verified; cart total missing (defect). |
| AC2: Checkout information and mandatory fields | Yes | Yes, all 3 browsers | First name, last name, and postal-code required validations pass. |
| AC3: Order overview, payment/shipping, totals, Cancel | Yes | Yes, all 3 browsers | Overview data and calculations pass; Cancel destination fails the business rule. |
| AC4: Order completion, confirmation, and cart clearing | Yes | Yes, all 3 browsers | Passes, including Back Home navigation. |
| AC5: Invalid checkout information | Yes | Yes, all 3 browsers | Invalid postal data is accepted (defect). |
| Authentication rule | Yes | Yes, all 3 browsers | Direct access while logged out redirects to login. |
| Non-empty cart rule | Yes | Yes, all 3 browsers | Empty cart is allowed to proceed (defect). |
| Mobile checkout | Yes | Yes, all 3 browsers | Checked at 390 x 844; no horizontal overflow observed. |

**Gaps:** Responsive behavior was checked at one mobile viewport, not on physical devices or a broad device matrix. Browser coverage uses Chromium, Firefox, and WebKit projects; branded Chrome and physical Safari were not separately tested. No server-side order persistence or payment processing was in scope.

## Summary and Recommendations

The core happy path works across the configured browsers, including order totals, successful completion, cart clearing, and return to inventory. Mandatory-field checks and unauthenticated-access handling also behave as expected. Release confidence remains limited by the four confirmed defects:

1. Add and verify a cart subtotal/total.
2. Validate postal-code input and block invalid values.
3. Disable or reject checkout when the cart is empty, including direct route access.
4. Return to the cart when Cancel is selected from the overview.

After these fixes, rerun the full suite in all three browser projects and add broader device/viewport coverage. The checkout tests intentionally retain assertions for the unmet requirements so the defects remain visible in subsequent runs.
