# Проект по Софтверски квалитет и тестирање

## Опис на проектот

Овој проект содржи автоматизирани UI тестови развиени како дел од предметот **Софтверски квалитет и тестирање**. Тестовите се имплементирани користејќи два популарни testing framework-а: **Playwright** и **TestCafe**.

## Тестирани апликации

Проектот вклучува тестови за три различни веб апликации:

### 1. AutomationExercise
- **URL**: https://automationexercise.com/
- **Опис**: E-commerce платформа за практикување автоматизирано тестирање
- **Тестирани функционалности**:
  - Регистрација и креирање на корисничка сметка
  - Прегледување производи по категорија и бренд
  - Пребарување, преглед и рецензии на производи
  - Додавање производи во кошничка
  - Checkout процес
  - Контакт форма
  - Претплата на newsletter
  - Logout функционалност

### 2. SauceDemo
- **URL**: https://www.saucedemo.com/
- **Опис**: Demo апликација за тестирање на e-commerce функционалности
- **Тестирани функционалности**:
  - Најава со различни типови на корисници
  - Валидација на пристап без најава
  - Додавање и отстранување производи од кошничка
  - Сортирање на производи по цена
  - Комплетен checkout процес
  - Преглед на детали за производи
  - Ресетирање на апликацијата

### 3. Spring Boot MVC Shop (Локална апликација)
- **Опис**: Локална Spring Boot апликација за управување со продавница
- **Тестирани функционалности**:
  - Регистрација на нови корисници
  - Најава како администратор и обичен корисник
  - Креирање, уредување и бришење на производи (Admin)
  - Контрола на пристап (Authorization)
  - Додавање производи во кошничка
  - Пребарување на производи по име, категорија и производител

## Testing Frameworks

### Playwright
- Модерен, брз и сигурен testing framework
- Поддршка за повеќе browser-и
- Автоматско чекање на елементи

### TestCafe
- Не бара WebDriver
- Едноставна конфигурација
- Вградена поддршка за retry логика

## Структура на проектот

```
├── playwright/
│   ├── automationexercise-tests.js
│   ├── saucedemo-tests.js
│   └── spring-boot-shop-tests.js
├── testcafe/
│   ├── automationexercise-tests.js
│   ├── saucedemo-tests.js
│   └── spring-boot-shop-tests.js
├── config/
│   └── environments.js
├── results/
│   ├── playwright/
│   │   ├── automationexercise-results/
│   │   ├── saucedemo-results/
│   │   └── spring-boot-results/
│   └── testcafe/
│       ├── automationexercise-results/
│       ├── saucedemo-results/
│       └── spring-boot-results/
└── README.md
```

## Резултати од тестирањето

Сите резултати од извршените тестови се достапни во папката **`results/`**. Резултатите се организирани по testing framework и по апликација.

### Содржина на резултатите:
- Screenshotи од успешни и неуспешни тестови
- Видео снимки од извршување на тестовите (каде е применливо)
- Логови и извештаи
- Детални резултати за секој тест случај

## Предуслови за извршување

### За Playwright:
```bash
npm install @playwright/test
npx playwright install
```

### За TestCafe:
```bash
npm install -g testcafe
```

### За Spring Boot апликацијата:
- Java 11 или повисока верзија
- Maven
- Апликацијата треба да работи на `http://localhost:8080`

## Извршување на тестовите

### Playwright тестови:

```bash
# AutomationExercise
npx playwright test automationexercise-tests.js

# SauceDemo
npx playwright test saucedemo-tests.js

# Spring Boot Shop
npx playwright test spring-boot-shop-tests.js
```

### TestCafe тестови:

```bash
# AutomationExercise
testcafe chrome automationexercise-tests.js

# SauceDemo
testcafe chrome saucedemo-tests.js

# Spring Boot Shop
testcafe chrome spring-boot-shop-tests.js
```

## Конфигурација

Конфигурацијата за URL адресите се наоѓа во `config/environments.js`. Пред извршување на тестовите за Spring Boot апликацијата, проверете дали URL адресата е правилно поставена.

```javascript
module.exports = {
    automationexercise: 'https://automationexercise.com',
    saucedemo: 'https://www.saucedemo.com',
    mvc: 'http://localhost:8080'  // Ажурирајте ја оваа адреса според вашата конфигурација
};
```

## Забелешки

- Тестовите за AutomationExercise содржат логика за справување со реклами и overlay елементи
- SauceDemo тестовите користат различни test корисници со специфични поведувања
- Spring Boot тестовите бараат активна локална инстанца на апликацијата

## Автор

Овој проект е развиен како дел од предметот **Софтверски квалитет и тестирање**.

## Датум

Јануари 2026
