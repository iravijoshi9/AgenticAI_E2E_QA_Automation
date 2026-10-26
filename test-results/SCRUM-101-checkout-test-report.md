# SCRUM-101 Checkout Test Execution Report

**Application:** https://www.saucedemo.com  
**Execution date:** 2026-10-26  
**Automation:** Playwright 1.64.1  
**Browsers:** Chromium, Firefox, WebKit (Safari engine)  
**Test account:** `standard_user` (password omitted)

## 1. Executive Summary

The checkout happy path, required-field validation, authentication guard, cancellation from the information step, and mobile layout were verified. Four product behavior gaps remain against the story/business rules: the cart has no total, invalid postal characters are accepted, checkout is allowed with an empty cart, and overview cancellation returns to inventory instead of the cart.

| Measure | Result |
|---|---:|
| Planned scenarios | 10 |
| Manual scenarios exercised | 10 |
| Automated scenarios | 10 |
| Final browser executions | 30 (10 per project) |
| Final unexpected automation failures | 0 |
| Confirmed defects | 4 |

Four defect tests remain marked as expected failures with assertions intact. A passing Playwright run means those tests still detected their documented product defects; it does not mean the defects are fixed.

**Overall status: FAIL.** SCRUM-101 is not release-ready until the four logged product defects are resolved. **Blocked: 0 scenarios.**

### Execution counts

| Measure | Planned | Executed | Result |
|---|---:|---:|---|
| Test scenarios | 10 | 10 manual + 10 automated scenarios | 100% of planned scenarios exercised |
| Final browser executions | 30 | 30 | 10 each on Chromium, Firefox, and WebKit |
| Manual scenarios | 10 | 10 | 6 PASS, 4 FAIL |
| Automation suite | 1 suite / 10 tests | 30 browser-test executions | 6 tests pass normally and 4 known-defect tests fail as expected per browser |
| Blocked scenarios | 0 | 0 | None |

The four defect tests are deliberately marked expected-to-fail so the suite continues to detect the known product gaps. Thus, the final Playwright summary of **30 passed** means 30 outcomes matched the test expectations (including 12 expected failures for the four defect tests across three browsers), not that all product behavior passed. There were **0 unexpected automation failures** in the final run.

## 2. Manual Test Results

| Scenario | Result | Observation |
|---|---|---|
| Cart review | **FAIL** | Product details and unit prices were shown; no cart subtotal or total was displayed. |
| Empty information form | **PASS** | Continue displayed `First Name is required`. |
| Missing last name | **PASS** | Continue displayed `Last Name is required`. |
| Missing postal code | **PASS** | Continue displayed `Postal Code is required`. |
| Invalid postal data | **FAIL** | `#$%` was accepted and the application navigated to overview. |
| Overview and cancellation | **FAIL** | Payment, shipping, subtotal, tax, and total were visible. Cancel returned to inventory rather than cart. |
| Order completion | **PASS** | Confirmation appeared, cart became empty, and Back Home returned to inventory. |
| Cancel information step | **PASS** | Returned to cart with the item preserved. |
| Authentication/empty cart | **FAIL** | Logged-out direct checkout was denied, but an empty cart could proceed to checkout information. |
| Mobile checkout | **PASS** | At 390px controls and totals were usable without horizontal overflow. |

### Screenshots

- [Cart review](./manual-cart-review.png)
- [Order overview](./manual-checkout-overview.png)
- [Required-field error](./manual-required-field-error.png)
- [Order confirmation](./manual-order-confirmation.png)
- [Mobile checkout](./manual-mobile-checkout.png)

## 3. Automated Test Results

The suite is [`tests/saucedemo-checkout/checkout.spec.js`](../tests/saucedemo-checkout/checkout.spec.js).

### Initial execution

The initial Chromium run covered all **10 scenarios** and reported **6 passed, 4 failed**. Each failure matched a product behavior gap confirmed manually.

The initial cross-browser run with six workers encountered Firefox login timeouts under parallel access to the public demo. Serial execution avoided this contention.

### Step 5 follow-up execution

On 2026-10-26, the full serial run first had **29 passed, 1 failed** (30 browser-test executions). The unexpected WebKit failure was `Complete order and clear cart`: after entering the checkout information, the demo displayed `First Name is required`.

The isolated WebKit scenario then passed twice with `--repeat-each=2`. A subsequent full serial rerun passed all 30 expected outcomes, with 10 each on Chromium, Firefox, and WebKit, and no unexpected failures. The failure was not reproducible, so no test-code changes were needed.

**Healing notes:** The configured healer agent could not be invoked: although its agent file and the other QA agent files specify `model: Auto`, the agent launcher still resolved `Claude Sonnet 4.6` and rejected it as unavailable. No test-code changes were made. The isolated WebKit retry and full serial rerun were used to investigate the transient failure; the retry passed twice and the failure did not recur.

The test runner clears its configured `test-results/` output directory at startup. During this follow-up run that removed the previous report and screenshot evidence; this report and the screenshots above were restored after the final test run.

## 4. Defects Log

### SCRUM-101-BUG-01 — Cart total is absent

- **Severity:** Medium
- **Description:** AC1 requires a cart total; none is displayed.
- **Steps:** Log in, add Backpack and Bike Light, open the cart.
- **Expected:** A total of $39.98 is displayed.
- **Actual:** Only item details and unit prices are shown.
- **Evidence:** [Manual cart review screenshot](./manual-cart-review.png); automated scenario `Review cart item details and total` in [`checkout.spec.js`](../tests/saucedemo-checkout/checkout.spec.js).
- **Environment:** Saucedemo public site (`standard_user`); manual exploratory session and automated Chromium, Firefox, and WebKit runs on 2026-10-26.

### SCRUM-101-BUG-02 — Invalid postal characters are accepted

- **Severity:** Medium
- **Description:** AC5 requires invalid checkout information to be rejected.
- **Steps:** Add an item; open Checkout; enter valid names and postal code `#$%`; select Continue.
- **Expected:** Validation message and blocked navigation.
- **Actual:** Application proceeds to checkout overview.
- **Evidence:** Manual result recorded above; automated scenario `Reject invalid checkout information` in [`checkout.spec.js`](../tests/saucedemo-checkout/checkout.spec.js). No dedicated screenshot of the invalid postal-code state was retained.
- **Environment:** Saucedemo public site (`standard_user`); manual exploratory session and automated Chromium, Firefox, and WebKit runs on 2026-10-26.

### SCRUM-101-BUG-03 — Checkout is available for an empty cart

- **Severity:** Medium
- **Description:** Business rule 3 prohibits checkout with an empty cart.
- **Steps:** Log in with an empty cart; open `/cart.html`; select Checkout.
- **Expected:** Checkout is disabled or the attempt is blocked.
- **Actual:** Checkout information form opens.
- **Evidence:** Manual authentication/empty-cart result recorded above; automated scenario `Prevent checkout without authentication or cart items` in [`checkout.spec.js`](../tests/saucedemo-checkout/checkout.spec.js). No dedicated empty-cart screenshot was retained.
- **Environment:** Saucedemo public site; unauthenticated and `standard_user` sessions, automated Chromium, Firefox, and WebKit runs on 2026-10-26.

### SCRUM-101-BUG-04 — Overview cancellation returns to inventory

- **Severity:** Low
- **Description:** Business rule 5 says cancellation at any checkout step returns to the cart.
- **Steps:** Add an item; complete checkout information; select Cancel on overview.
- **Expected:** Cart page is displayed with the item preserved.
- **Actual:** Inventory page is displayed; item remains in cart.
- **Evidence:** [Manual checkout overview screenshot](./manual-checkout-overview.png); automated scenario `Review order overview and cancel checkout to the cart` in [`checkout.spec.js`](../tests/saucedemo-checkout/checkout.spec.js).
- **Environment:** Saucedemo public site (`standard_user`); manual exploratory session and automated Chromium, Firefox, and WebKit runs on 2026-10-26.

## 5. Test Coverage Analysis

| Requirement | Coverage | Result |
|---|---|---|
| AC1: Cart details, total, continue/checkout | Manual and automated | Partial; cart total missing |
| AC2: Mandatory checkout fields | Manual and automated | Pass |
| AC3: Overview values and cancel/finish | Manual and automated | Amounts pass; cancel destination differs |
| AC4: Confirmation and Back Home | Manual and automated | Pass |
| AC5: Invalid information | Manual and automated | Fail; invalid postal value accepted |
| Authentication required | Manual and automated | Pass |
| Non-empty cart required | Manual and automated | Fail |
| Cart cleared after completion | Manual and automated | Pass |
| Cancel returns to cart | Manual and automated | Partial; overview cancel returns to inventory |
| Mobile layout | Manual and automated | Pass at tested 390px viewport |

One Playwright suite (`SCRUM-101 checkout flow`) contains 10 cases; final per-browser execution was 10 cases each on Chromium, Firefox, and WebKit. WebKit was tested as the Safari engine; no separate physical Safari browser was used. Further viewport sizes, browser/device combinations, postal-code boundary formats, and a retained screenshot for each defect remain useful additional coverage.

## 6. Summary and Recommendations

The standard purchase path and required-field checks work in the tested browser engines, but four acceptance/business-rule defects remain. Address the four product defects before considering SCRUM-101 complete. Keep their assertions in place; remove the expected-failure markers once the application is corrected. Continue serial execution against the shared public demo account to reduce login contention. Capture and retain defect-specific screenshots, especially for invalid postal input and empty-cart checkout, and add broader mobile/browser and postal-code boundary coverage.

## 7. Commit and Push Status

The target repository `https://github.com/ivarjoshi/AgenticAI_E2E_QA_Automation.git` already exists on branch `main`. The local workspace has no `.git` directory, so the requested commit was performed through the GitHub MCP server. The report, user story, test plan, and checkout automation script are included in the commit. The five PNG screenshots were not uploaded because the available GitHub MCP write tool accepts text file content only and no binary-upload tool was available.
