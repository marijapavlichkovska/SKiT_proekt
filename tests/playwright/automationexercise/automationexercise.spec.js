const { test, expect } = require('@playwright/test');
const env = require('../../config/environments');

function generateRandomEmail() {
    const randomStr = Math.random().toString(36).substring(2, 10); // 8 chars
    return `${randomStr}@mail.com`;
}

const testEmail = 'admin159@mail.com';
const testPassword = 'admin';
const password = 'Test123@';

//test.describe.configure({mode: 'serial'});

test.describe('AutomationExercise - Playwright', () => {
    test.beforeEach(async ({ page }) => {
        // Block popup tabs opened by ads
        page.on('popup', async popup => {
            await popup.close();
        });
    });

    //1. signup a new user
    test('Signup with full registration form', async ({ page }) => {
        await page.goto(env.automationexercise);

        await page.click('text=Signup / Login');

        const email = generateRandomEmail();

        await page.fill('[data-qa="signup-name"]', 'Test');
        await page.fill('[data-qa="signup-email"]', email);
        await page.click('[data-qa="signup-button"]');

        await page.waitForSelector('form[action*="signup"]');

        await page.check('input[id="id_gender1"]');

        await page.fill('#password', password);

        await page.selectOption('#days', '15');
        await page.selectOption('#months', '6');
        await page.selectOption('#years', '1995');

        await page.check('#newsletter');
        await page.check('#optin');

        await page.fill('#first_name', 'Test');
        await page.fill('#last_name', 'User');
        await page.fill('#company', 'MyCompany');
        await page.fill('#address1', '123 Main St');
        await page.fill('#address2', 'Apt 4');
        await page.selectOption('#country', 'United States');
        await page.fill('#state', 'CA');
        await page.fill('#city', 'Los Angeles');
        await page.fill('#zipcode', '90001');
        await page.fill('#mobile_number', '1234567890');

        await page.click('button[data-qa="create-account"]');

        await expect(page.locator('text=ACCOUNT CREATED')).toBeVisible({ timeout: 10000 });

        await page.click('text=Continue');

        await expect(page.locator(`text=Logged in as Test`)).toBeVisible();
    });

    //2. view product from category
    test('View Products by Category', async ({ page }) => {
        await page.goto(env.automationexercise);

        const categoriesSidebar = page.locator('.left-sidebar');
        await expect(categoriesSidebar).toBeVisible();
        await expect(categoriesSidebar.getByText('Category')).toBeVisible();

        const womenTopsLink = categoriesSidebar
            .locator('a')
            .filter({ hasText: 'Tops' })
            .first();

        const womenTopsHref = await womenTopsLink.getAttribute('href');
        await page.goto(`${env.automationexercise}${womenTopsHref}`);

        await expect(page).toHaveURL(/category_products/);
        await expect(page.locator('.features_items')).toBeVisible();
        await expect(page.locator('.title'))
            .toContainText('WOMEN - TOPS PRODUCTS', { ignoreCase: true });

        const menJeansLink = categoriesSidebar
            .locator('a')
            .filter({ hasText: 'Jeans' })
            .first();

        const menJeansHref = await menJeansLink.getAttribute('href');
        await page.goto(`${env.automationexercise}${menJeansHref}`);

        await expect(page).toHaveURL(/category_products/);
        await expect(page.locator('.features_items')).toBeVisible();
        await expect(page.locator('.title'))
            .toContainText('MEN - JEANS PRODUCTS', { ignoreCase: true });
    });

    //3. view product from brand
    test('View Products by Brand', async ({ page }) => {
        await page.goto(env.automationexercise);

        const brandsSidebar = page.locator('.brands_products');
        await expect(brandsSidebar).toBeVisible();

        const firstBrand = brandsSidebar.locator('a').first();
        const firstBrandText = (await firstBrand.textContent()).trim();
        const firstBrandName = firstBrandText.split('(')[0].trim();

        const firstBrandHref = await firstBrand.getAttribute('href');
        await page.goto(`${env.automationexercise}${firstBrandHref}`);

        await expect(page).toHaveURL(/brand_products/);
        await expect(page.locator('.features_items')).toBeVisible();
        await expect(page.locator('.title'))
            .toContainText(firstBrandName, { ignoreCase: true });

        const secondBrand = brandsSidebar.locator('a').nth(1);
        const secondBrandText = (await secondBrand.textContent()).trim();
        const secondBrandName = secondBrandText.split('(')[0].trim();

        const secondBrandHref = await secondBrand.getAttribute('href');
        await page.goto(`${env.automationexercise}${secondBrandHref}`);

        await expect(page).toHaveURL(/brand_products/);
        await expect(page.locator('.features_items')).toBeVisible();
        await expect(page.locator('.title'))
            .toContainText(secondBrandName, { ignoreCase: true });
    });

    //4. product, view and review
    test('Product Search, View Product, and Write Review', async ({ page }) => {
        await page.goto(env.automationexercise + '/products');

        await page.fill('#search_product', 'Dress');
        await page.click('#submit_search');

        const productCards = page.locator('.product-image-wrapper');
        await expect(productCards.first()).toBeVisible();

        const count = await productCards.count();
        const maxIndex = Math.min(count, 5);
        const randomIndex = Math.floor(Math.random() * maxIndex);

        const selectedCard = productCards.nth(randomIndex);

        const viewProductBtn = selectedCard.locator('.choose a');
        await viewProductBtn.scrollIntoViewIfNeeded();
        await viewProductBtn.click();

        await expect(page.locator('.product-information')).toBeVisible();

        await page.fill('#name', 'Test User');
        await page.fill('#email', `${Math.random().toString(36).slice(2)}@mail.com`);
        await page.fill('#review', 'This review was written by Playwright automation.');
        await page.click('#button-review');

        await expect(
            page.getByText('Thank you for your review.', { exact: false })
        ).toBeVisible({ timeout: 5000 });
    });

    //5. single item add to cart
    test('Add Product to Cart', async ({ page }) => {
        await page.goto(env.automationexercise + '/products');

        await page.hover('.product-image-wrapper:nth-of-type(1)');
        await page.click('.add-to-cart');

        await page.click('text=View Cart');

        await expect(page.locator('.cart_info')).toBeVisible();
    });

    //6. multiple items add to cart
    test('Add multiple products using Continue Shopping', async ({ page }) => {
        await page.goto(env.automationexercise + '/products');

        const products = page.locator('.product-image-wrapper');
        await expect(products.first()).toBeVisible();

        await products
            .nth(6)
            .locator('.productinfo .add-to-cart')
            .click({ force: true });

        await page.getByRole('button', { name: /Continue Shopping/i }).click();

        await products
            .nth(1)
            .locator('.productinfo .add-to-cart')
            .click({ force: true });

        await page.getByRole('link', { name: /View Cart/i }).click();

        await expect(page.locator('.cart_info')).toBeVisible();
        await expect(page.locator('.cart_info tbody tr')).toHaveCount(2);
    });

    //7. add product from recommended
    test('Add to cart from Recommended Items', async ({ page }) => {
        // 1 & 2. Launch browser and navigate
        await page.goto(env.automationexercise);

        // 3. Scroll to bottom of page
        const footer = page.locator('#footer');
        await footer.scrollIntoViewIfNeeded();

        // 4. Verify 'RECOMMENDED ITEMS' are visible
        const recommendedSection = page.locator('.recommended_items');
        await expect(recommendedSection).toBeVisible();
        await expect(
            recommendedSection.getByText('Recommended Items', { exact: false })
        ).toBeVisible();

        // 5. Click on 'Add To Cart' on a Recommended product
        const firstRecommendedProduct = recommendedSection
            .locator('.productinfo')
            .first();

        await expect(firstRecommendedProduct).toBeVisible();

        await firstRecommendedProduct
            .locator('.add-to-cart')
            .click();

        // 6. Click on 'View Cart' button
        await page.getByRole('link', { name: /View Cart/i }).click();

        // 7. Verify that product is displayed in cart page
        await expect(page).toHaveURL(/view_cart/);
        await expect(page.locator('.cart_info')).toBeVisible();
        await expect(page.locator('.cart_info tbody tr')).toHaveCount(1);
    });

    //8. checkout
    test('Checkout Flow', async ({ page }) => {
        if (!testEmail) {
            throw new Error('testEmail not set — signup test did not run');
        }
        await page.goto(env.automationexercise);

        await page.click('text=Signup / Login');

        await page.fill('[data-qa="login-email"]', testEmail);
        await page.fill('[data-qa="login-password"]', testPassword);
        await page.click('[data-qa="login-button"]');

        await expect(page.locator('a:has-text("Logged in as")')).toBeVisible();

        await page.goto(env.automationexercise + '/products');

        const firstProduct = page.locator('.product-image-wrapper').first();
        await expect(firstProduct).toBeVisible();

        await firstProduct.hover();
        await firstProduct.locator('.add-to-cart').first().click();

        await page.click('text=View Cart');

        await expect(page).toHaveURL(/view_cart/);
        await expect(page.locator('.cart_info')).toBeVisible();

        await page.click('text=Proceed To Checkout');

        await page.click('text=Place Order');

        await page.fill('[name="name_on_card"]', 'Test User');
        await page.fill('[name="card_number"]', '4111111111111111');
        await page.fill('[name="cvc"]', '311');
        await page.fill('[name="expiry_month"]', '12');
        await page.fill('[name="expiry_year"]', '2028');

        await page.click('#submit');

        await expect(
            page.getByText('Congratulations! Your order has been confirmed!', {
                exact: false
            })
        ).toBeVisible({ timeout: 10000 });
    });

    //9. add product and remove from cart
    test('Add product to cart and remove it', async ({ page }) => {
        await page.goto(env.automationexercise);

        await expect(page).toHaveURL(env.automationexercise);
        await expect(page.locator('body')).toBeVisible();

        const firstProduct = page.locator('.product-image-wrapper').first();
        await expect(firstProduct).toBeVisible();

        await firstProduct.hover();
        await firstProduct.locator('.add-to-cart').first().click();

        await page.click('text=View Cart');

        await expect(page).toHaveURL(/view_cart/);
        await expect(page.locator('.cart_info')).toBeVisible();

        const removeBtn = page.locator('.cart_quantity_delete').first();
        await removeBtn.click();

        await expect(page.locator('.cart_info tbody tr')).toHaveCount(0);

        await expect(
            page.getByText('Cart is empty', { exact: false })
        ).toBeVisible();
    });

    //10. contact form
    test('Contact Form', async ({ page }) => {
        await page.goto(env.automationexercise + '/contact_us');

        const email = generateRandomEmail()

        await page.fill('[name="name"]', 'Test');
        await page.fill('[name="email"]', email);
        await page.fill('[name="subject"]', 'Test Subject');
        await page.fill('#message', 'This is a test message from automation test.');

        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await page.click('[name="submit"]');

        const successAlert = page.locator('.status.alert-success');

        await expect(successAlert).toBeVisible({ timeout: 10000 });
        await expect(successAlert).toContainText(
            'Success! Your details have been submitted successfully.'
        );
    });

    //11. subscribe
    test('Verify Subscription', async ({ page }) => {
        await page.goto(env.automationexercise);

        await expect(page).toHaveURL(env.automationexercise);
        await expect(page.locator('body')).toBeVisible();

        const footer = page.locator('#footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();

        const subscriptionText = footer.locator('text=Subscription');
        await expect(subscriptionText).toBeVisible();

        const email = generateRandomEmail();
        const emailInput = footer.locator('#susbscribe_email, input[name="email"]');
        await emailInput.fill(email);

        const arrowBtn = footer.locator('#subscribe, button[type="submit"]');
        await arrowBtn.click();

        const successAlert = footer.locator('.alert-success').filter({
            hasText: 'You have been successfully subscribed!'
        });
        await expect(successAlert).toBeVisible({ timeout: 10000 });
    });

    //12. logout
    test('Logout', async ({ page }) => {
        if (!testEmail) {
            throw new Error('testEmail not set — signup test did not run');
        }

        await page.goto(env.automationexercise);

        await page.click('text=Signup / Login');

        await page.fill('[data-qa="login-email"]', testEmail);
        await page.fill('[data-qa="login-password"]', testPassword);
        await page.click('[data-qa="login-button"]');

        await expect(page.locator('a:has-text("Logged in as")')).toBeVisible();

        await page.click('a[href="/logout"]');

        await expect(page).toHaveURL(/login/);

        await expect(
            page.locator('text=Login to your account')
        ).toBeVisible();
    });

    //13. create and delete account
    test('Create Account and Delete Account', async ({ page }) => {
        await page.goto(env.automationexercise);

        await page.click('text=Signup / Login');

        const email = generateRandomEmail();
        const password = testPassword;

        await page.fill('[data-qa="signup-name"]', 'DeleteTest');
        await page.fill('[data-qa="signup-email"]', email);
        await page.click('[data-qa="signup-button"]');

        await page.waitForSelector('form[action*="signup"]');

        await page.check('#id_gender1');
        await page.fill('#password', password);

        await page.selectOption('#days', '10');
        await page.selectOption('#months', '5');
        await page.selectOption('#years', '1998');

        await page.fill('#first_name', 'Delete');
        await page.fill('#last_name', 'User');
        await page.fill('#address1', 'Test Street 1');
        await page.selectOption('#country', 'United States');
        await page.fill('#state', 'CA');
        await page.fill('#city', 'LA');
        await page.fill('#zipcode', '90001');
        await page.fill('#mobile_number', '123456789');

        await page.click('[data-qa="create-account"]');

        await expect(page.locator('text=ACCOUNT CREATED!')).toBeVisible({ timeout: 10000 });
        await page.click('text=Continue');

        await expect(page.locator('a:has-text("Logged in as")')).toBeVisible();

        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await page.click('a[href="/delete_account"]');

        await expect(page.locator('text=ACCOUNT DELETED!')).toBeVisible({ timeout: 10000 });

        await page.click('text=Continue');

        await expect(page.locator('text=Signup / Login')).toBeVisible();
    });

});
