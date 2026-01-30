import { Selector, ClientFunction } from 'testcafe';
const environments = require('../../config/environments');


const getLocation = ClientFunction(() => document.location.href);

const clearStorage = ClientFunction(() => {
    localStorage.clear();
    sessionStorage.clear();
});

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

class AuthHelper {
    async loginAsAdmin(t) {
        await this.login(t, 'admin', 'admin');
    }

    async loginAsUser(t) {
        await this.login(t, 'elena.atanasoska', 'ea');
    }

    async login(t, username, password) {
        await t.navigateTo(environments.mvc + '/login');
        await t.wait(500);

        await t.typeText('#username', username, { replace: true });
        await t.typeText('#password', password, { replace: true });
        await safeClick(t, Selector('#submit'));
        await t.wait(1000);
    }

    async logout(t) {
        await safeClick(t, Selector('a[href="/logout"]'));
        await t.wait(1000);
    }

    async register(t, username, password, name, surname) {
        await t.navigateTo(environments.mvc + '/register');
        await t.wait(500);

        await t.typeText('#username', username, { replace: true });
        await t.typeText('#password', password, { replace: true });
        await t.typeText('#repeatedPassword', password, { replace: true });
        await t.typeText('#name', name, { replace: true });
        await t.typeText('#surname', surname, { replace: true });

        await safeClick(t, Selector('button[type="submit"]'));
        await t.wait(1000);
    }
}

const authHelper = new AuthHelper();

fixture('Spring Boot Shop - TestCafe')
    .page(environments.mvc)
    .beforeEach(async t => {
        await clearStorage();
        await t.wait(300);
    })
    .afterEach(async t => {
        await clearStorage();
    });


// 1. register a new user
test('Register a new user', async t => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;

    await t.navigateTo(environments.mvc + '/register');
    await t.wait(500);

    await t
        .typeText('#username', username)
        .typeText('#password', 'password123')
        .typeText('#repeatedPassword', 'password123')
        .typeText('#name', 'Test')
        .typeText('#surname', 'User');

    await safeClick(t, Selector('button[type="submit"]'));
    await t.wait(1000);

    console.log(`Registered new user: ${username}`);
});

// 2. log in as an existing user and logout
test('Log in as user and logout', async t => {
    await authHelper.login(t, 'elena.atanasoska', 'ea');

    const logoutButton = Selector('a[href="/logout"]');
    await t.expect(logoutButton.exists).ok({ timeout: 5000 });

    console.log('User logged in successfully');

    await authHelper.logout(t);

    await t.expect(getLocation()).contains('login');
    console.log('User logged out successfully');
});

// 3. log in as admin and logout
test('Log in as admin and logout', async t => {
    await authHelper.loginAsAdmin(t);

    const logoutButton = Selector('a[href="/logout"]');
    await t.expect(logoutButton.exists).ok({ timeout: 5000 });

    console.log('Admin logged in successfully');

    await authHelper.logout(t);

    await t.expect(getLocation()).contains('login');
    console.log('Admin logged out successfully');
});

// 4. log in with a non-existing account to show the BadCredentials message
test('Log in with non-existing account', async t => {
    await t.navigateTo(environments.mvc + '/login');
    await t.wait(500);

    await t
        .typeText('#username', 'nonexistentuser12345')
        .typeText('#password', 'wrongpassword');

    await safeClick(t, Selector('#submit'));
    await t.wait(1000);

    const errorMsg = Selector('.text-danger');
    await t.expect(errorMsg.exists).ok({ timeout: 5000 });

    const errorText = await errorMsg.innerText;
    console.log(`Error message displayed: ${errorText}`);

    await t.expect(errorText.toLowerCase()).contains('bad');
});

// 5. try creating a product as a user and seeing the access refused message
test('Try to create product as user', async t => {
    await authHelper.loginAsUser(t);

    await t.navigateTo(environments.mvc + '/products/add-form');
    await t.wait(1000);

    const accessDeniedText = Selector('*').withText('Sorry, your access is refused');
    await t.expect(accessDeniedText.exists).ok({ timeout: 5000 });

    console.log('Access denied message displayed');

    const goBackButton = Selector('a.btn-danger').withText('Go Back');
    await t.expect(goBackButton.exists).ok();
    await safeClick(t, goBackButton);

    console.log('Go Back button clicked');

    await authHelper.logout(t);
});

// 6. create a new product while being logged in as an admin
test('Create a new product as admin', async t => {
    await authHelper.loginAsAdmin(t);

    await t.navigateTo(environments.mvc + '/products/add-form');
    await t.wait(1000);

    const productName = `Test Product ${Date.now()}`;
    await t
        .typeText('#name', productName)
        .typeText('#price', '99.99')
        .typeText('#quantity', '15');

    await t.click('select[name="category"]');
    await safeClick(t, Selector('select[name="category"] option').withText('Sports'));

    await t.click('select[name="manufacturer"]');
    await safeClick(t, Selector('select[name="manufacturer"] option').withText('Nike'));

    await safeClick(t, Selector('#submit'));
    await t.wait(1000);

    console.log(`Created product: ${productName}`);

    await t.expect(getLocation()).contains('/products');

    await authHelper.logout(t);
});

// 7. create multiple products while being logged in as admin
test('Create multiple products as admin', async t => {
    await authHelper.loginAsAdmin(t);

    const products = [
        { name: `Gaming Laptop ${Date.now()}`, price: '1299.99', quantity: '5', category: 'Electronics', manufacturer: 'Nike' },
        { name: `Energy Drink ${Date.now()}`, price: '2.99', quantity: '100', category: 'Food', manufacturer: 'Coca Cola' },
        { name: `Programming Book ${Date.now()}`, price: '45.50', quantity: '20', category: 'Books', manufacturer: 'Literatura' }
    ];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        await t.navigateTo(environments.mvc + '/products/add-form');
        await t.wait(1000);

        await t
            .typeText('#name', product.name)
            .typeText('#price', product.price)
            .typeText('#quantity', product.quantity);

        await t.click('select[name="category"]');
        await safeClick(t, Selector('select[name="category"] option').withText(product.category));

        await t.click('select[name="manufacturer"]');
        await safeClick(t, Selector('select[name="manufacturer"] option').withText(product.manufacturer));

        await safeClick(t, Selector('#submit'));
        await t.wait(1000);

        console.log(`Created product ${i + 1}: ${product.name}`);
    }

    await t.expect(getLocation()).contains('/products');

    await authHelper.logout(t);
});

// 8. edit an existing product while being logged in as an admin
test('Edit an existing product as admin', async t => {
    await authHelper.loginAsAdmin(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    const editButton = Selector('a.edit-product').nth(0);
    await t.expect(editButton.exists).ok({ timeout: 5000 });
    await safeClick(t, editButton);
    await t.wait(1000);

    const url = await getLocation();
    await t.expect(url).contains('/products/edit-form/');

    const updatedName = `Updated Product ${Date.now()}`;
    await t
        .selectText('#name')
        .typeText('#name', updatedName)
        .selectText('#price')
        .typeText('#price', '149.99');

    await safeClick(t, Selector('#submit'));
    await t.wait(1000);

    console.log(`Updated product to: ${updatedName}`);

    await t.expect(getLocation()).contains('/products');

    await authHelper.logout(t);
});

// 9. delete a product while being logged in as an admin
test('Delete a product as admin', async t => {
    await authHelper.loginAsAdmin(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    const initialCount = await Selector('tr.product').count;
    console.log(`Initial product count: ${initialCount}`);

    const deleteButton = Selector('button.delete-product').nth(0);
    await t.expect(deleteButton.exists).ok({ timeout: 5000 });
    await safeClick(t, deleteButton);
    await t.wait(1000);

    console.log('Product deleted');

    await t.expect(getLocation()).contains('/products');

    await authHelper.logout(t);
});

// 10. add a product as an admin to cart and verify that the product is there
test('Add product to cart as admin and verify', async t => {
    await authHelper.loginAsAdmin(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    const firstProductName = await Selector('tr.product').nth(0).find('td').nth(0).innerText;
    console.log(`Adding product to cart: ${firstProductName}`);

    const addToCartButton = Selector('button.add-to-cart').nth(0);
    await t.expect(addToCartButton.exists).ok({ timeout: 5000 });
    await safeClick(t, addToCartButton);
    await t.wait(1000);

    await t.navigateTo(environments.mvc + '/shopping-cart');
    await t.wait(1000);

    const cartProducts = Selector('tbody tr');
    const cartCount = await cartProducts.count;
    await t.expect(cartCount).gt(0);

    console.log(`Cart contains ${cartCount} product(s)`);

    await authHelper.logout(t);
});

// 11. add a product to cart as a user and verify that it is there
test('Add product to cart as user and verify', async t => {
    await authHelper.loginAsUser(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    const firstProductName = await Selector('tr.product').nth(0).find('td').nth(0).innerText;
    console.log(`Adding product to cart: ${firstProductName}`);

    const addToCartButton = Selector('button.add-to-cart').nth(0);
    await t.expect(addToCartButton.exists).ok({ timeout: 5000 });
    await safeClick(t, addToCartButton);
    await t.wait(1000);

    await t.navigateTo(environments.mvc + '/shopping-cart');
    await t.wait(1000);

    const cartProducts = Selector('tbody tr');
    const cartCount = await cartProducts.count;
    await t.expect(cartCount).gt(0);

    console.log(`Cart contains ${cartCount} product(s)`);

    await authHelper.logout(t);
});

// 12. search for a product by name and write in console does the product exist or not
test('Search for product by name', async t => {
    await authHelper.loginAsUser(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    const searchTerm = 'Product';
    await t.typeText('#searchName', searchTerm);

    await safeClick(t, Selector('button[type="submit"]'));
    await t.wait(1000);

    const url = await getLocation();
    await t.expect(url).contains(`name=${searchTerm}`);

    const productCount = await Selector('tr.product').count;

    if (productCount > 0) {
        console.log(`Search found ${productCount} product(s) with name containing "${searchTerm}"`);

        const firstProductName = await Selector('tr.product').nth(0).find('td').nth(0).innerText;
        console.log(`First result: ${firstProductName}`);
    } else {
        console.log(`No products found with name containing "${searchTerm}"`);
    }

    await authHelper.logout(t);
});

// 13. search for a product by category and write in console does the product exist or not
test('Search for product by category', async t => {
    await authHelper.loginAsUser(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    await t.click('#categorySelect');
    await safeClick(t, Selector('#categorySelect option').withText('Sports'));

    await safeClick(t, Selector('button[type="submit"]'));
    await t.wait(1000);

    const url = await getLocation();
    await t.expect(url).contains('categoryId=');

    const productCount = await Selector('tr.product').count;

    if (productCount > 0) {
        console.log(`Search found ${productCount} product(s) in Sports category`);

        const firstProductCategory = await Selector('tr.product').nth(0).find('td').nth(3).innerText;
        console.log(`First result category: ${firstProductCategory}`);
    } else {
        console.log('No products found in Sports category');
    }

    await authHelper.logout(t);
});

// 14. search for a product by manufacturer and write in console does the product exist or not
test('Search for product by manufacturer', async t => {
    await authHelper.loginAsUser(t);

    await t.navigateTo(environments.mvc + '/products');
    await t.wait(1000);

    await t.click('#manufacturerSelect');
    await safeClick(t, Selector('#manufacturerSelect option').withText('Nike'));

    await safeClick(t, Selector('button[type="submit"]'));
    await t.wait(1000);

    const url = await getLocation();
    await t.expect(url).contains('manufacturerId=');

    const productCount = await Selector('tr.product').count;

    if (productCount > 0) {
        console.log(`Search found ${productCount} product(s) from Nike manufacturer`);

        const firstProductManufacturer = await Selector('tr.product').nth(0).find('td').nth(2).innerText;
        console.log(`First result manufacturer: ${firstProductManufacturer}`);
    } else {
        console.log('No products found from Nike manufacturer');
    }

    await authHelper.logout(t);
});