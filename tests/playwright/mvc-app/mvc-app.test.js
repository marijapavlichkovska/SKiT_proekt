const { test, expect } = require('@playwright/test');
const environments = require("../../config/environments")

test.use({
    baseURL: environments.mvc
});

class AuthHelper {
    constructor(page) {
        this.page = page;
    }

    async loginAsAdmin() {
        await this.login('admin', 'admin');
    }

    async loginAsUser() {
        await this.login('elena.atanasoska', 'ea');
    }

    async login(username, password) {
        await this.page.goto('/login');
        await this.page.fill('#username', username);
        await this.page.fill('#password', password);
        await this.page.click('#submit');
        await this.page.waitForLoadState('networkidle');
    }

    async logout() {
        await this.page.click('a[href="/logout"]');
        await this.page.waitForLoadState('networkidle');
    }

    async register(username, password, name, surname) {
        await this.page.goto('/register');
        await this.page.fill('#username', username);
        await this.page.fill('#password', password);
        await this.page.fill('#repeatedPassword', password);
        await this.page.fill('#name', name);
        await this.page.fill('#surname', surname);
        await this.page.click('button[type="submit"]');
        await this.page.waitForLoadState('networkidle');
    }
}

test.describe('Spring Boot Shop - Playwright', () => {
    let authHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
    });

    //1. register a new user
    test('Register a new user', async ({ page }) => {
        const timestamp = Date.now();
        const username = `testuser${timestamp}`;

        await page.goto('/register');

        await page.fill('#username', username);
        await page.fill('#password', 'password123');
        await page.fill('#repeatedPassword', 'password123');
        await page.fill('#name', 'Test');
        await page.fill('#surname', 'User');

        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        console.log(`Registered new user: ${username}`);
    });

    //2. log in as an existing user and logout
    test('Log in as user and logout', async ({ page }) => {
        await authHelper.login('elena.atanasoska', 'ea');
        await page.waitForLoadState('networkidle');

        const logoutButton = page.locator('a[href="/logout"]');
        await expect(logoutButton).toBeVisible();

        console.log('User logged in successfully');

        await authHelper.logout();

        await expect(page).toHaveURL(/.*login.*/);
        console.log('User logged out successfully');
    });

    //3. log in as admin and logout
    test('Log in as admin and logout', async ({ page }) => {
        await authHelper.loginAsAdmin();
        await page.waitForLoadState('networkidle');

        const logoutButton = page.locator('a[href="/logout"]');
        await expect(logoutButton).toBeVisible();

        console.log('Admin logged in successfully');

        await authHelper.logout();

        await expect(page).toHaveURL(/.*login.*/);
        console.log('Admin logged out successfully');
    });

    //4. log in with a non-existing account to show the BadCredentials message
    test('Log in with non-existing account', async ({ page }) => {
        await page.goto('/login');

        await page.fill('#username', 'nonexistentuser12345');
        await page.fill('#password', 'wrongpassword');
        await page.click('#submit');

        await page.waitForLoadState('networkidle');

        const errorMsg = page.locator('.text-danger');
        await expect(errorMsg).toBeVisible();

        const errorText = await errorMsg.textContent();
        console.log(`Error message displayed: ${errorText}`);

        expect(errorText.toLowerCase()).toContain('bad');
    });

    //5. try creating a product as a user and seeing the access refused message
    test('Try to create product as user', async ({ page }) => {
        await authHelper.loginAsUser();
        await page.waitForLoadState('networkidle');

        await page.goto('/products/add-form');
        await page.waitForLoadState('networkidle');

        const accessDeniedText = page.locator('text=Sorry, your access is refused');
        await expect(accessDeniedText).toBeVisible();

        console.log('Access denied message displayed');

        const goBackButton = page.locator('a.btn-danger', { hasText: 'Go Back' });
        await expect(goBackButton).toBeVisible();
        await goBackButton.click();

        console.log('Go Back button clicked');

        await authHelper.logout();
    });

    //6. create a new product while being logged in as an admin
    test('Create a new product as admin', async ({ page }) => {
        await authHelper.loginAsAdmin();
        await page.waitForLoadState('networkidle');

        await page.goto('/products/add-form');
        await page.waitForLoadState('networkidle');

        const productName = `Test Product ${Date.now()}`;
        await page.fill('#name', productName);
        await page.fill('#price', '99.99');
        await page.fill('#quantity', '15');

        await page.selectOption('select[name="category"]', { label: 'Sports' });

        await page.selectOption('select[name="manufacturer"]', { label: 'Nike' });

        await page.click('#submit');
        await page.waitForLoadState('networkidle');

        console.log(`Created product: ${productName}`);

        await expect(page).toHaveURL('/products');

        await authHelper.logout();
    });

    //7. create multiple products while being logged in as admin
    test('Create multiple products as admin', async ({ page }) => {
        await authHelper.loginAsAdmin();
        await page.waitForLoadState('networkidle');

        const products = [
            { name: `Gaming Laptop ${Date.now()}`, price: '1299.99', quantity: '5', category: 'Electronics', manufacturer: 'Nike' },
            { name: `Energy Drink ${Date.now()}`, price: '2.99', quantity: '100', category: 'Food', manufacturer: 'Coca Cola' },
            { name: `Programming Book ${Date.now()}`, price: '45.50', quantity: '20', category: 'Books', manufacturer: 'Literatura' }
        ];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            await page.goto('/products/add-form');
            await page.waitForLoadState('networkidle');

            await page.fill('#name', product.name);
            await page.fill('#price', product.price);
            await page.fill('#quantity', product.quantity);

            await page.selectOption('select[name="category"]', { label: product.category });

            await page.selectOption('select[name="manufacturer"]', { label: product.manufacturer });

            await page.click('#submit');
            await page.waitForLoadState('networkidle');

            console.log(`Created product ${i + 1}: ${product.name}`);
        }

        await expect(page).toHaveURL('/products');

        await authHelper.logout();
    });

    //8. edit an existing product while being logged in as an admin
    test('Edit an existing product as admin', async ({ page }) => {
        await authHelper.loginAsAdmin();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        const editButton = page.locator('a.edit-product').first();
        await expect(editButton).toBeVisible();
        await editButton.click();
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url).toContain('/products/edit-form/');

        const updatedName = `Updated Product ${Date.now()}`;
        await page.fill('#name', updatedName);

        await page.fill('#price', '149.99');

        await page.click('#submit');
        await page.waitForLoadState('networkidle');

        console.log(`Updated product to: ${updatedName}`);

        await expect(page).toHaveURL('/products');

        await authHelper.logout();
    });

    //9. delete a product while being logged in as an admin
    test('Delete a product as admin', async ({ page }) => {
        await authHelper.loginAsAdmin();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('tr.product').count();
        console.log(`Initial product count: ${initialCount}`);

        const deleteButton = page.locator('button.delete-product').first();
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();
        await page.waitForLoadState('networkidle');

        console.log('Product deleted');

        await expect(page).toHaveURL('/products');

        await authHelper.logout();
    });

    //10. add a product as an admin to cart and verify that the product is there
    test('Add product to cart as admin and verify', async ({ page }) => {
        await authHelper.loginAsAdmin();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        const firstProductName = await page.locator('tr.product').first().locator('td').first().textContent();
        console.log(`Adding product to cart: ${firstProductName}`);

        const addToCartButton = page.locator('button.add-to-cart').first();
        await expect(addToCartButton).toBeVisible();
        await addToCartButton.click();
        await page.waitForLoadState('networkidle');

        await page.goto('/shopping-cart');
        await page.waitForLoadState('networkidle');

        const cartProducts = page.locator('tbody tr');
        const cartCount = await cartProducts.count();
        expect(cartCount).toBeGreaterThan(0);

        console.log(`Cart contains ${cartCount} product(s)`);

        await authHelper.logout();
    });

    //11. add a product to cart as a user and verify that it is there
    test('Add product to cart as user and verify', async ({ page }) => {
        await authHelper.loginAsUser();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        const firstProductName = await page.locator('tr.product').first().locator('td').first().textContent();
        console.log(`Adding product to cart: ${firstProductName}`);

        const addToCartButton = page.locator('button.add-to-cart').first();
        await expect(addToCartButton).toBeVisible();
        await addToCartButton.click();
        await page.waitForLoadState('networkidle');

        await page.goto('/shopping-cart');
        await page.waitForLoadState('networkidle');

        const cartProducts = page.locator('tbody tr');
        const cartCount = await cartProducts.count();
        expect(cartCount).toBeGreaterThan(0);

        console.log(`Cart contains ${cartCount} product(s)`);

        await authHelper.logout();
    });

    //12. search for a product by name and write in console does the product exist or not
    test('Search for product by name', async ({ page }) => {
        await authHelper.loginAsUser();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        const searchTerm = 'Product';
        await page.fill('#searchName', searchTerm);

        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url).toContain(`name=${searchTerm}`);

        const productCount = await page.locator('tr.product').count();

        if (productCount > 0) {
            console.log(`Search found ${productCount} product(s) with name containing "${searchTerm}"`);

            const firstProductName = await page.locator('tr.product').first().locator('td').first().textContent();
            console.log(`First result: ${firstProductName}`);
        } else {
            console.log(`No products found with name containing "${searchTerm}"`);
        }

        await authHelper.logout();
    });

    //13. search for a product by category and write in console does the product exist or not
    test('Search for product by category', async ({ page }) => {
        await authHelper.loginAsUser();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        await page.selectOption('#categorySelect', { label: 'Sports' });

        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url).toContain('categoryId=');

        const productCount = await page.locator('tr.product').count();

        if (productCount > 0) {
            console.log(`Search found ${productCount} product(s) in Sports category`);

            const firstProductCategory = await page.locator('tr.product').first().locator('td').nth(3).textContent();
            console.log(`First result category: ${firstProductCategory}`);
        } else {
            console.log('No products found in Sports category');
        }

        await authHelper.logout();
    });

    //14. search for a product by manufacturer and write in console does the product exist or not
    test('Search for product by manufacturer', async ({ page }) => {
        await authHelper.loginAsUser();
        await page.waitForLoadState('networkidle');

        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        await page.selectOption('#manufacturerSelect', { label: 'Nike' });

        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url).toContain('manufacturerId=');

        const productCount = await page.locator('tr.product').count();

        if (productCount > 0) {
            console.log(`Search found ${productCount} product(s) from Nike manufacturer`);

            const firstProductManufacturer = await page.locator('tr.product').first().locator('td').nth(2).textContent();
            console.log(`First result manufacturer: ${firstProductManufacturer}`);
        } else {
            console.log('No products found from Nike manufacturer');
        }

        await authHelper.logout();
    });
});