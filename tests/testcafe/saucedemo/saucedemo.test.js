import { Selector, ClientFunction } from 'testcafe';

const env = {
    saucedemo: 'https://www.saucedemo.com'
};

const getLocation = ClientFunction(() => document.location.href);

const clearStorage = ClientFunction(() => {
    localStorage.clear();
    sessionStorage.clear();
});

const clearCookies = ClientFunction(() => {
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
});

const usernameInput = Selector('[data-test="username"]');
const passwordInput = Selector('[data-test="password"]');
const loginButton   = Selector('[data-test="login-button"]');
const errorMessage  = Selector('[data-test="error"]');
const cartBadge     = Selector('.shopping_cart_badge');

const safeClick = async (t, selector, timeout = 10000) => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const exists = await selector.exists;
        const visible = await selector.visible;

        if (exists && visible) {
            try {
                await t.click(selector);
                return;
            } catch (err) {

            }
        }

        await t.wait(300);
    }

    throw new Error(`Selector not interactable after ${timeout}ms`);
};

async function login(t, username, password) {
    await t
        .typeText(usernameInput, username, { replace: true })
        .typeText(passwordInput, password, { replace: true });

    await safeClick(t, loginButton);
    await t.wait(1000);
}

async function addBackpack(t) {
    await safeClick(t, Selector('[data-test="add-to-cart-sauce-labs-backpack"]'));
}

async function ensureLoggedOut(t) {
    await clearStorage();
    await clearCookies();
    await t.navigateTo(env.saucedemo);
    await t.wait(500);

    const isLoginPage = await loginButton.exists;
    if (!isLoginPage) {
        await t.navigateTo(env.saucedemo);
        await t.wait(500);
    }
}

fixture('Saucedemo – TestCafe')
    .page(env.saucedemo)
    .beforeEach(async t => {
        await ensureLoggedOut(t);
        await t.expect(loginButton.exists).ok({ timeout: 10000 });
    })
    .afterEach(async t => {
        await clearStorage();
        await clearCookies();
    });

//1. get the message that you cant access the inventory page without logging in
test('cannot access inventory page without login', async t => {
    await t.navigateTo(env.saucedemo + '/inventory.html');
    await t.wait(500);

    await t.expect(
        Selector('[data-test="error"]').innerText
    ).contains('You can only access');
});

//2. log in without any data and get the error message
test('login with no data', async t => {
    await safeClick(t, loginButton);
    await t.expect(errorMessage.exists).ok({ timeout: 5000 });
});

//3. log in with invalid data and get the error message
test('login with invalid data', async t => {
    await login(t, 'invalid', 'invalid');
    await t.expect(errorMessage.exists).ok({ timeout: 5000 });
});

//4. add an item to cart and check the count of the items
test('add to cart and check count', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await safeClick(t, Selector('[data-test="add-to-cart-sauce-labs-backpack"]'));
    await safeClick(t, Selector('[data-test="add-to-cart-sauce-labs-bike-light"]'));
    await safeClick(t, Selector('[data-test="add-to-cart-sauce-labs-fleece-jacket"]'));

    await t.expect(cartBadge.innerText).eql('3');
});

//5. remove an item from cart and check count from the cart
test('remove item from cart and check count', async t => {
    await login(t, 'standard_user', 'secret_sauce');
    await addBackpack(t);

    await safeClick(t, Selector('.shopping_cart_link'));
    await safeClick(t, Selector('[data-test="remove-sauce-labs-backpack"]'));

    await t.expect(Selector('.cart_item').count).eql(0);
});

//6. add an item to the cart and remove that item from the home page
test('add and remove item on inventory page', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await addBackpack(t);
    await safeClick(t, Selector('[data-test="remove-sauce-labs-backpack"]'));

    await t.expect(cartBadge.exists).notOk();
});

//7. add an item to cart, go to the checkout page, go back and add more items to cart
test('Add to cart, go to checkout, go back and add more items', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await addBackpack(t);
    await safeClick(t, Selector('.shopping_cart_link'));
    await safeClick(t, Selector('[data-test="continue-shopping"]'));

    await safeClick(t, Selector('[data-test="add-to-cart-sauce-labs-bike-light"]'));
    await safeClick(t, Selector('.shopping_cart_link'));
    await safeClick(t, Selector('[data-test="checkout"]'));

    await t
        .typeText('[data-test="firstName"]', 'Test')
        .typeText('[data-test="lastName"]', 'User')
        .typeText('[data-test="postalCode"]', '1000');

    await safeClick(t, Selector('[data-test="continue"]'));

    await t.expect(Selector('[data-test="finish"]').exists).ok({ timeout: 5000 });
});

//8. sort the items on home page from low to high
test('Sorting price low to high', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await safeClick(t, Selector('.product_sort_container'));
    await safeClick(t, Selector('option').withAttribute('value', 'lohi'));

    const prices = Selector('.inventory_item_price');

    const price1 = await prices.nth(0).innerText;
    const price2 = await prices.nth(1).innerText;

    await t.expect(
        parseFloat(price1.replace('$', ''))
    ).lte(
        parseFloat(price2.replace('$', ''))
    );
});

//9. open product details from the home page and go back to the home page
test('Open product details and go back', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await safeClick(t, Selector('.inventory_item_name').nth(0));
    await t.expect(Selector('.inventory_details_name').exists).ok({ timeout: 5000 });

    await safeClick(t, Selector('[data-test="back-to-products"]'));
    await t.expect(Selector('.inventory_list').exists).ok({ timeout: 5000 });
});

//10. go to the cart, click checkout and enter card details
test('Complete order', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await addBackpack(t);
    await safeClick(t, Selector('[data-test="add-to-cart-sauce-labs-bike-light"]'));

    await safeClick(t, Selector('.shopping_cart_link'));
    await safeClick(t, Selector('[data-test="checkout"]'));

    await t
        .typeText('[data-test="firstName"]', 'Test')
        .typeText('[data-test="lastName"]', 'User')
        .typeText('[data-test="postalCode"]', '1000');

    await safeClick(t, Selector('[data-test="continue"]'));
    await safeClick(t, Selector('[data-test="finish"]'));

    await t.expect(Selector('[data-test="complete-header"]').exists).ok({ timeout: 5000 });
});

//11. cancel the checkout and return to the cart
test('Cancel checkout returns to cart', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await addBackpack(t);
    await safeClick(t, Selector('.shopping_cart_link'));
    await safeClick(t, Selector('[data-test="checkout"]'));
    await safeClick(t, Selector('[data-test="cancel"]'));

    await t.expect(Selector('.cart_list').exists).ok({ timeout: 5000 });
});

//12. from navigation bar click about
test('Click about link', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await safeClick(t, Selector('#react-burger-menu-btn'));
    await t.wait(500);

    await t.expect(
        Selector('.bm-item').withText('About').getAttribute('href')
    ).contains('saucelabs.com');
});

//13. from navigation bar click reset app state
test('Reset app state clears cart', async t => {
    await login(t, 'standard_user', 'secret_sauce');

    await addBackpack(t);
    await t.expect(cartBadge.innerText).eql('1');

    await safeClick(t, Selector('#react-burger-menu-btn'));
    await t.wait(500);
    await safeClick(t, Selector('.bm-item').withText('Reset App State'));
    await t.wait(500);

    await t.expect(cartBadge.exists).notOk();
});