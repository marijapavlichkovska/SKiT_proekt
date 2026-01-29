import { ClientFunction, Selector } from 'testcafe';
const env = require('../../config/environments');

function generateRandomEmail() {
    return `${Math.random().toString(36).substring(2, 10)}@mail.com`;
}

const testEmail = 'admin159@mail.com';
const testPassword = 'admin';
const password = 'Test123@';

const getLocation = ClientFunction(() => document.location.href);
const getHostname = ClientFunction(() => document.location.hostname);

async function ensureOnAutomationExercise(t) {
    await fixGoogleVignette();
    await hideAds();
    const hostname = await getHostname();
    if (!hostname || !hostname.includes('automationexercise.com')) {
        await t.navigateTo(env.automationexercise);
    }
}

const clickVisible = async (t, selector) => {
    const exists = await selector.exists;
    const visible = await selector.visible;
    if (exists && visible) {
        await t.scrollIntoView(selector);
        await t.click(selector);
    }
};

const setSelectValue = ClientFunction((selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.value = value;
});

const safeClickSignUp = async (t, selector) => {
    await hideAds();
    await t.scrollIntoView(selector);
    await t.click(selector);
};

const safeClick = async (t, selector, timeout = 15000) => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        await removeAds();
        await hideAds();
        await closeGoogleVignette();

        const exists = await selector.exists;
        const visible = await selector.visible;
        const rect = await selector.boundingClientRect;

        if (exists && visible && rect.width > 0 && rect.height > 0) {
            try {
                await t.scrollIntoView(selector);
                await t.click(selector);
                return; // success
            } catch (err) {

            }
        }

        await t.wait(500);
    }

    throw new Error(`Selector ${selector} not interactable after ${timeout}ms`);
};

const safeClickContact = async (t, selector, timeout = 20000) => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        await removeAdsContact();
        await t.wait(300);

        const exists = await selector.exists;
        const visible = await selector.visible;
        const rect = await selector.boundingClientRect;

        if (exists && visible && rect.width > 0 && rect.height > 0) {
            try {
                await t.scrollIntoView(selector);
                await t.click(selector);
                return;
            } catch (err) {

            }
        }

        await t.wait(500);
    }

    throw new Error(`Selector ${selector} not interactable after ${timeout}ms`);
};

const removeAds = ClientFunction(() => {
    const adIframes = Array.from(document.querySelectorAll('iframe[id^="aswift_"], iframe[src*="doubleclick"]'));
    adIframes.forEach(iframe => iframe.remove());

    const overlays = Array.from(document.querySelectorAll('div[style*="z-index"]'));
    overlays.forEach(el => {
        const z = parseInt(el.style.zIndex || 0, 10);
        if (z > 1000) el.remove();
    });
});

const removeAdsContact = ClientFunction(() => {
    document.querySelectorAll('iframe[id^="aswift_"], iframe[src*="doubleclick"], iframe[src*="googleads"]').forEach(el => el.remove());

    document.querySelectorAll('div, section').forEach(el => {
        const style = window.getComputedStyle(el);
        const z = parseInt(style.zIndex) || 0;
        const visible = style.display !== 'none' && style.visibility !== 'hidden';
        if (z > 500 && visible) el.remove();
    });

    document.querySelectorAll('.adsbygoogle, .ad-container, #google_vignette').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
    });
});

const scrollToBottom = ClientFunction(() => {
    window.scrollTo(0, document.body.scrollHeight);
});

const removeUrlFragment = ClientFunction(() => {
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
});

const hideAds = ClientFunction(() => {
    const selectors = [
        'iframe[id^="aswift"]',
        'iframe[src*="googleads"]',
        'iframe[src*="doubleclick"]',
        '.adsbygoogle',
        '[id*="google"]'
    ];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
        });
    });
});

const fixGoogleVignette = ClientFunction(() => {
    try {
        const href = window.location.href;

        if (href.includes('google_vignette') || href.includes('https:/automationexercise.com')) {
            window.location.replace('https://automationexercise.com/');
        }
    } catch (e) {
        console.log('Error fixing Google Vignette:', e);
    }
});

const closeGoogleVignette = ClientFunction(() => {
    const vignette = document.querySelector('#google_vignette, .vignette-close');
    if (vignette) {
        const closeBtn = vignette.querySelector('.vignette-close') || vignette;
        closeBtn.click();
        return true;
    }
    return false;
});

export const scrollIntoView = async (t, selector, timeout = 15000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const exists = await selector.exists;
        const visible = await selector.visible;
        const disabled = await selector.hasAttribute('disabled');

        if (exists && visible && !disabled) {
            await t.scrollIntoView(selector); // no offset
            return;
        }

        await t.wait(500);
    }
    throw new Error(`Selector ${selector} not visible or interactable after ${timeout}ms`);
};

fixture('AutomationExercise - TestCafe')
    .page(env.automationexercise)
    .beforeEach(async t => {
        await ensureOnAutomationExercise(t);
    });

//1. signup
test('Signup with full registration form', async t => {
    await ensureOnAutomationExercise(t);
    await safeClickSignUp(t, Selector('a').withText('Signup / Login'));

    const email = generateRandomEmail();

    await t.typeText('[data-qa="signup-name"]', 'Test')
        .typeText('[data-qa="signup-email"]', email);

    await safeClick(t, Selector('[data-qa="signup-button"]'));
    await t.expect(Selector('form[action*="signup"]').exists).ok({ timeout: 15000 });

    await safeClick(t, Selector('#id_gender1'));
    await t.typeText('#password', password);

    await setSelectValue('#days', '15');
    await setSelectValue('#months', '6');
    await setSelectValue('#years', '1995');

    await clickVisible(t, Selector('#newsletter'));
    await clickVisible(t, Selector('#optin'));

    await t
        .typeText('#first_name', 'Test')
        .typeText('#last_name', 'User')
        .typeText('#company', 'MyCompany')
        .typeText('#address1', '123 Main St')
        .typeText('#address2', 'Apt 4');

    await setSelectValue('#country', 'United States');

    await t
        .typeText('#state', 'CA')
        .typeText('#city', 'Los Angeles')
        .typeText('#zipcode', '90001')
        .typeText('#mobile_number', '123456789');

    await safeClick(t, Selector('[data-qa="create-account"]'));

    await t.expect(Selector('*').withText('ACCOUNT CREATED').exists).ok({ timeout: 15000 });

    await clickVisible(t, Selector('a').withText('Continue'));

    await t.navigateTo('https://automationexercise.com/');

    const logoutLink = Selector('a[href="/logout"]');
    await t.expect(logoutLink.exists).ok({ timeout: 15000 });
});

//2. view by category
test('View Products by Category', async t => {
    await ensureOnAutomationExercise(t);
    const categoriesSidebar = Selector('.left-sidebar');

    await t.expect(categoriesSidebar.exists).ok({ timeout: 10000 });
    await t.expect(categoriesSidebar.withText(/Category/i).exists).ok();

    const womenTopsLink = categoriesSidebar.find('a').withText('Tops').nth(0);
    const womenTopsHref = await womenTopsLink.getAttribute('href');

    await t.navigateTo(env.automationexercise + womenTopsHref);
    await ensureOnAutomationExercise(t);

    await t.expect(getLocation()).contains('category_products')
        .expect(Selector('.features_items').exists).ok()
        .expect(Selector('.title').innerText).contains('WOMEN - TOPS PRODUCTS');

    const menJeansLink = categoriesSidebar.find('a').withText('Jeans').nth(0);
    const menJeansHref = await menJeansLink.getAttribute('href');

    await t.navigateTo(env.automationexercise + menJeansHref);
    await ensureOnAutomationExercise(t);

    await t.expect(getLocation()).contains('category_products')
        .expect(Selector('.features_items').exists).ok()
        .expect(Selector('.title').innerText).contains('MEN - JEANS PRODUCTS');
});

//3. view by brand
test('View Products by Brand', async t => {
    await ensureOnAutomationExercise(t);
    const brandsSidebar = Selector('.brands_products');

    await t.expect(brandsSidebar.exists).ok();

    const firstBrand = brandsSidebar.find('a').nth(0);
    const firstBrandName = (await firstBrand.innerText).split('(')[0].trim();
    const firstBrandHref = await firstBrand.getAttribute('href');

    await t.navigateTo(env.automationexercise + firstBrandHref);
    await ensureOnAutomationExercise(t);

    await t.expect(getLocation()).contains('brand_products')
        .expect(Selector('.features_items').exists).ok()
        .expect(Selector('.title').innerText).contains(firstBrandName);

    const secondBrand = brandsSidebar.find('a').nth(1);
    const secondBrandName = (await secondBrand.innerText).split('(')[0].trim();
    const secondBrandHref = await secondBrand.getAttribute('href');

    await t.navigateTo(env.automationexercise + secondBrandHref);
    await ensureOnAutomationExercise(t);

    await t.expect(getLocation()).contains('brand_products')
        .expect(Selector('.features_items').exists).ok()
        .expect(Selector('.title').innerText).contains(secondBrandName);
});

//4. search, view and review
test('Product Search, View Product, and Write Review', async t => {
    await ensureOnAutomationExercise(t);

    await t.navigateTo(env.automationexercise + '/products');

    const searchInput = Selector('#search_product');
    const searchButton = Selector('#submit_search');

    await removeAds();
    await t.typeText(searchInput, 'Dress');
    await removeAds();
    await t.click(searchButton);

    const productCards = Selector('.product-image-wrapper');
    await t.expect(productCards.count).gt(0);

    await t.navigateTo(env.automationexercise + '/product_details/3');

    const productInformation = Selector('.product-information');
    await t.expect(productInformation.exists).ok({ timeout: 15000 });

    const reviewName = Selector('#name');
    const reviewEmail = Selector('#email');
    const reviewTextArea = Selector('#review');
    const reviewButton = Selector('#button-review');

    await t
        .typeText(reviewName, 'Test User')
        .typeText(reviewEmail, generateRandomEmail())
        .typeText(
            reviewTextArea,
            'This review was written by TestCafe automation.'
        );

    await removeAds();
    await t.click(reviewButton);

    const reviewSuccess = Selector('*').withText('Thank you for your review.');
    await t.expect(reviewSuccess.exists).ok({ timeout: 10000 });
});

//5. add one product to cart
test('Add Product to Cart', async t => {
    await ensureOnAutomationExercise(t);
    await t.navigateTo(env.automationexercise + '/products');

    const firstProduct = Selector('.product-image-wrapper').nth(0);
    const addToCartBtn = firstProduct.find('.add-to-cart');

    await t.hover(firstProduct);
    await safeClick(t, addToCartBtn);

    await hideAds();

    const modalViewCart = Selector('#cartModal a').withText(/View Cart/i);
    const globalViewCart = Selector('a').withText(/View Cart/i);

    if (await modalViewCart.exists && await modalViewCart.visible) {
        await safeClick(t, modalViewCart);
    } else {
        await safeClick(t, globalViewCart);
    }

    await t.expect(Selector('.cart_info').exists).ok();
});

//6. add multiple products to cart
test('Add multiple products using Continue Shopping', async t => {
    await ensureOnAutomationExercise(t);
    await t.navigateTo(env.automationexercise + '/products');

    const products = Selector('.product-image-wrapper');
    await t.expect(products.count).gt(1);

    const product7Add = products.nth(6).find('.productinfo .add-to-cart');
    await safeClick(t, product7Add);

    const modal = Selector('#cartModal');
    const continueShoppingBtn = modal.find('button').withText(/Continue Shopping/i);
    await t.expect(continueShoppingBtn.visible).ok({ timeout: 10000 });
    await safeClick(t, continueShoppingBtn);

    const product2Add = products.nth(1).find('.productinfo .add-to-cart');
    await safeClick(t, product2Add);

    const viewCartLink = Selector('a').withText(/View Cart/i);
    await safeClick(t, viewCartLink);

    const cartInfo = Selector('.cart_info');
    const cartRows = cartInfo.find('tbody tr');

    await t.expect(cartInfo.exists).ok();
    await t.expect(cartRows.count).eql(2);
});

//7. add from recommended
test('Add to cart from Recommended Items', async t => {
    await ensureOnAutomationExercise(t);

    await scrollToBottom();

    const recommendedSection = Selector('.recommended_items');
    await t.expect(recommendedSection.exists).ok();

    const firstRecommendedProduct = recommendedSection.find('.carousel-inner .active .productinfo').nth(0);
    const addToCartBtn = firstRecommendedProduct.find('.add-to-cart');

    await t.scrollIntoView(addToCartBtn);
    await safeClick(t, addToCartBtn);

    const viewCartLink = Selector('#cartModal').find('a').withText(/View Cart/i);
    await t.expect(viewCartLink.visible).ok({ timeout: 10000 });
    await safeClick(t, viewCartLink);

    const cartInfo = Selector('.cart_info');
    const cartRows = cartInfo.find('tbody tr');

    await t.expect(getLocation()).contains('view_cart');
    await t.expect(cartInfo.exists).ok();
    await t.expect(cartRows.count).eql(1);
});

//8. checkout
test('Checkout Flow', async t => {
    await ensureOnAutomationExercise(t);
    await t.navigateTo(env.automationexercise + '/login');

    await t.typeText('[data-qa="login-email"]', testEmail, { replace: true });
    await t.typeText('[data-qa="login-password"]', testPassword, { replace: true });
    await clickVisible(t, Selector('[data-qa="login-button"]'));

    const loggedInAs = Selector('*').withText(/Logged in as/i);
    await t.expect(loggedInAs.exists).ok({ timeout: 15000 });

    await t.navigateTo(env.automationexercise + '/products');

    const firstProduct = Selector('.product-image-wrapper').nth(0);
    const addToCart = firstProduct.find('.add-to-cart');
    await clickVisible(t, addToCart);

    const modalViewCart = Selector('#cartModal').find('a').withText(/View Cart/i);
    const globalViewCart = Selector('a').withText(/View Cart/i);

    if (await modalViewCart.exists && await modalViewCart.visible) {
        await clickVisible(t, modalViewCart);
    } else {
        await clickVisible(t, globalViewCart);
    }

    await clickVisible(t, Selector('a').withText('Proceed To Checkout'));

    for (let i = 0; i < 5; i++) {
        const closed = await closeGoogleVignette();
        if (closed) break;
        await t.wait(500);
    }

    await removeUrlFragment();

    await clickVisible(t, Selector('a').withText('Place Order'));

    await t.navigateTo(env.automationexercise + '/payment');
    const nameOnCard = Selector('[name="name_on_card"]');
    await t.expect(nameOnCard.exists).ok({ timeout: 15000 });

    await t
        .typeText(nameOnCard, 'Test User')
        .typeText('[name="card_number"]', '4111111111111111')
        .typeText('[name="cvc"]', '311')
        .typeText('[name="expiry_month"]', '12')
        .typeText('[name="expiry_year"]', '2028');

    await clickVisible(t, Selector('#submit'));

    const successMessage = Selector('*').withText('Congratulations! Your order has been confirmed!');
    await t.expect(successMessage.exists).ok({ timeout: 15000 });

    await removeUrlFragment();
});

//9. add to cart and remove
test('Add product to cart and remove it', async t => {
    await ensureOnAutomationExercise(t);

    const firstProduct = Selector('.product-image-wrapper').nth(0);
    const addToCart = firstProduct.find('.add-to-cart');

    await t.hover(firstProduct);
    await safeClick(t, addToCart);

    const modalViewCart = Selector('#cartModal').find('a').withText(/View Cart/i);
    await t.expect(modalViewCart.visible).ok({ timeout: 10000 });
    await safeClick(t, modalViewCart);

    const cartInfo = Selector('.cart_info');
    const cartRows = cartInfo.find('tbody tr');

    await t.expect(cartInfo.exists).ok();
    await t.expect(cartRows.count).gt(0);

    const removeBtn = Selector('.cart_quantity_delete').nth(0);
    await safeClick(t, removeBtn);

    await t.expect(cartRows.count).eql(0);

    const emptyCartText = Selector('*').withText('Cart is empty');
    await t.expect(emptyCartText.exists).ok();
});

//10. contact
test('Contact Form', async t => {
    await ensureOnAutomationExercise(t);
    await t.navigateTo(env.automationexercise + '/contact_us');

    const email = generateRandomEmail();

    await t.typeText('[name="name"]', 'Test')
        .typeText('[name="email"]', email)
        .typeText('[name="subject"]', 'Test Subject')
        .typeText('#message', 'This is a test message from automation test.');

    await t.setNativeDialogHandler(() => true);
    await safeClickContact(t, Selector('[name="submit"]'));

    const successAlert = Selector('.status.alert-success').withText(
        'Success! Your details have been submitted successfully.'
    );
    await t.expect(successAlert.exists).ok({ timeout: 15000 });
});

//11. subscribe
test('Verify Subscription', async t => {
    await ensureOnAutomationExercise(t);
    await scrollToBottom();

    const footer = Selector('#footer');
    await t.expect(footer.exists).ok();

    const subscriptionText = footer.withText(/Subscription/i);
    await t.expect(subscriptionText.exists).ok();

    const email = generateRandomEmail();

    const emailInputPrimary = footer.find('#susbscribe_email');
    const emailInputFallback = footer.find('input[name="email"]');

    if (await emailInputPrimary.exists) {
        await t.typeText(emailInputPrimary, email);
    } else {
        await t.typeText(emailInputFallback, email);
    }

    const arrowBtnPrimary = footer.find('#subscribe');
    const arrowBtnFallback = footer.find('button[type="submit"]');

    if (await arrowBtnPrimary.exists) {
        await safeClick(t, arrowBtnPrimary);
    } else {
        await safeClick(t, arrowBtnFallback);
    }

    const successAlert = footer.find('.alert-success').withText(
        'You have been successfully subscribed!'
    );
    await t.expect(successAlert.exists).ok({ timeout: 10000 });
});

//12. logout
test('Logout', async t => {
    await ensureOnAutomationExercise(t);
    await t.navigateTo(env.automationexercise + '/login');

    const loginEmail = Selector('[data-qa="login-email"]');
    const loginPassword = Selector('[data-qa="login-password"]');
    const loginButton = Selector('[data-qa="login-button"]');

    await t.typeText(loginEmail, testEmail, { replace: true });
    await t.typeText(loginPassword, testPassword, { replace: true });

    await safeClick(t, loginButton);

    const loggedInAs = Selector('*').withText(/Logged in as/i);
    await t.expect(loggedInAs.exists).ok({ timeout: 15000 });

    const logoutLink = Selector('a[href="/logout"]');
    await safeClick(t, logoutLink);

    await t.expect(getLocation()).contains('login');
    const loginHeader = Selector('*').withText('Login to your account');
    await t.expect(loginHeader.exists).ok();
});

//13. create and delete
test('Create Account and Delete Account', async t => {
    await ensureOnAutomationExercise(t);
    await fixGoogleVignette(); // remove any ad overlays
    await clickVisible(t, Selector('a').withText('Signup / Login'));

    const email = generateRandomEmail();

    await t.typeText('[data-qa="signup-name"]', 'DeleteTest')
        .typeText('[data-qa="signup-email"]', email);

    await clickVisible(t, Selector('[data-qa="signup-button"]'));
    await t.expect(Selector('form[action*="signup"]').exists).ok({ timeout: 15000 });

    await clickVisible(t, Selector('#id_gender1'));
    await t.typeText('#password', password);

    await setSelectValue('#days', '10');
    await setSelectValue('#months', '5');
    await setSelectValue('#years', '1998');

    await t
        .typeText('#first_name', 'Delete')
        .typeText('#last_name', 'User')
        .typeText('#address1', 'Test Street 1');

    await setSelectValue('#country', 'United States');

    await t
        .typeText('#state', 'CA')
        .typeText('#city', 'LA')
        .typeText('#zipcode', '90001')
        .typeText('#mobile_number', '123456789');

    await clickVisible(t, Selector('[data-qa="create-account"]'));

    await t.expect(Selector('*').withText('ACCOUNT CREATED').exists).ok({ timeout: 15000 });

    await fixGoogleVignette();
    await clickVisible(t, Selector('a').withText('Continue'));

    await t.navigateTo(env.automationexercise);

    await t.setNativeDialogHandler(() => true);
    await clickVisible(t, Selector('a[href="/delete_account"]'));

    await t.expect(Selector('*').withText('ACCOUNT DELETED').exists).ok({ timeout: 15000 });
});
