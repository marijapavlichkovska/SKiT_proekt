import { test, expect } from '@playwright/test';

const USERS = [
    { username: 'standard_user', password: 'secret_sauce', valid: true },
    { username: 'locked_out_user', password: 'secret_sauce', valid: false },
    { username: 'problem_user', password: 'secret_sauce', valid: true },
    { username: 'performance_glitch_user', password: 'secret_sauce', valid: true }
];

async function login(page, username, password) {
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
}

async function logout(page) {
    await page.click('#react-burger-menu-btn');
    await page.click('.bm-item.menu-item:nth-child(3)');
}

async function addBackpack(page) {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
}


test.describe('Saucedemo – Playwright', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
    });

    //1. get the message that you cant access the inventory page without logging in
    test('Cannot access inventory page without login', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/inventory.html');
        await expect(page).toHaveURL('https://www.saucedemo.com/');
    });

    //2. log in without any data and get the error message
    test('Log in with no data', async ({ page }) => {
        await page.click('[data-test="login-button"]');
        await expect(page.locator('[data-test="error"]')).toBeVisible();
    });

    //3. log in with invalid data and get the error message
    test('Log in with invalid data', async ({ page }) => {
        await login(page, 'invalid', 'invalid');
        await expect(page.locator('[data-test="error"]')).toBeVisible();
    });

    //4. add an item to cart and check the count of the items
    test('Add to cart and check count', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');

        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
        await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
        await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');

        await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
    });

    //5. remove an item from cart and check count from the cart
    test('Remove items from cart and check count from cart', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');
        await addBackpack(page);

        await page.click('[data-test="shopping-cart-link"]');
        await page.click('[data-test="remove-sauce-labs-backpack"]');

        await expect(page.locator('.cart_item')).toHaveCount(0);
    });

    //6. add an item to the cart and remove that item from the home page
    test('Add to cart and remove items from cart on home page', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');

        await addBackpack(page);
        await page.click('[data-test="remove-sauce-labs-backpack"]');

        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });

    //7. add an item to cart, go to the checkout page, go back and add more items to cart
    test('Add to cart, go to checkout, go back and add more items', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');

        await addBackpack(page);
        await page.click('[data-test="shopping-cart-link"]');
        await page.click('[data-test="continue-shopping"]');

        await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
        await page.click('[data-test="shopping-cart-link"]');
        await page.click('[data-test="checkout"]');

        await page.fill('[data-test="firstName"]', 'Test');
        await page.fill('[data-test="lastName"]', 'User');
        await page.fill('[data-test="postalCode"]', '1000');
        await page.click('[data-test="continue"]');

        await expect(page).toHaveURL(/checkout-step-two/);
    });

    //8. sort the items on home page from low to high
    test('Sorting low to high', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');

        const pricesBefore = await page
            .locator('.inventory_item_price')
            .allTextContents();

        const numsBefore = pricesBefore.map(p => parseFloat(p.replace('$', '')));
        const sorted = [...numsBefore].sort((a, b) => a - b);

        await page.selectOption('.product_sort_container', 'lohi');

        const pricesAfter = await page
            .locator('.inventory_item_price')
            .allTextContents();

        const numsAfter = pricesAfter.map(p => parseFloat(p.replace('$', '')));
        expect(numsAfter).toEqual(sorted);
    });

    //9. open product details from the home page and go back to the home page
    test('Open product details and go back', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.fill('[data-test="username"]', 'standard_user');
        await page.fill('[data-test="password"]', 'secret_sauce');
        await page.click('[data-test="login-button"]');

        await page.click('.inventory_item_name >> nth=0');
        await expect(page.locator('.inventory_details_name')).toBeVisible();

        await page.click('[data-test="back-to-products"]');
        await expect(page).toHaveURL(/inventory.html/);
    });

    //10. go to the cart, click checkout and enter card details
    test('Order', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');

        await addBackpack(page);
        await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
        await page.click('[data-test="shopping-cart-link"]');
        await page.click('[data-test="checkout"]');

        await page.fill('[data-test="firstName"]', 'Test');
        await page.fill('[data-test="lastName"]', 'User');
        await page.fill('[data-test="postalCode"]', '1000');
        await page.click('[data-test="continue"]');
        await page.click('[data-test="finish"]');

        await expect(page.locator('[data-test="complete-header"]')).toBeVisible();
    });

    //11. cancel the checkout and return to the cart
    test('Cancel checkout returns to cart', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.fill('[data-test="username"]', 'standard_user');
        await page.fill('[data-test="password"]', 'secret_sauce');
        await page.click('[data-test="login-button"]');

        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
        await page.click('[data-test="shopping-cart-link"]');
        await page.click('[data-test="checkout"]');
        await page.click('[data-test="cancel"]');

        await expect(page).toHaveURL(/cart.html/);
    });

    //12. from navigation bar click about
    test('Click about', async ({ page }) => {
        await login(page, 'standard_user', 'secret_sauce');

        await page.click('#react-burger-menu-btn');
        await expect(
            page.locator('.bm-item.menu-item').nth(1)
        ).toHaveAttribute('href', /saucelabs\.com/);
    });

    //13. from navigation bar click reset app state
    test('Reset app state clears cart', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.fill('[data-test="username"]', 'standard_user');
        await page.fill('[data-test="password"]', 'secret_sauce');
        await page.click('[data-test="login-button"]');

        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        await page.click('#react-burger-menu-btn');
        await page.click('.bm-item.menu-item:has-text("Reset App State")');

        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });
});