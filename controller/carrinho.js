import { consultarEstoque } from "./estoque.js";

const cartStorageKey = 'broto-cart';
const orderStorageKey = 'broto-pedido-simulado';
const cartDrawer = document.querySelector('.cart-drawer');
const drawerItems = cartDrawer.querySelector('.cart-drawer__items');
const drawerEmpty = cartDrawer.querySelector('.cart-drawer__empty');
const drawerCheckout = cartDrawer.querySelector('.cart-drawer__checkout');
const drawerMessage = cartDrawer.querySelector('.cart-drawer__message');
const checkoutItems = document.querySelector('.cart-items');
const checkoutForm = document.querySelector('.checkout__form');
const checkoutMessage = document.querySelector('.checkout__message');
const checkoutSubmit = checkoutForm?.querySelector('button[type="submit"]');
const productMessage = document.querySelector('#product-cart-message');
const checkoutEmpty = document.querySelector('.checkout__empty');
const orderSummary = document.querySelector('.order-summary');
const subtotalElement = document.querySelector('#checkout-subtotal');
const totalElement = document.querySelector('#checkout-total');
const shippingCost = 2000;
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});
let checkingStock = false;

function readCart() {
    const storedCart = localStorage.getItem(cartStorageKey);
    if (!storedCart) {
        return [];
    }

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
        return [];
    }

    return parsedCart.filter((item) =>
        item
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.location === 'string'
        && typeof item.image === 'string'
        && typeof item.imageAlt === 'string'
        && typeof item.unit === 'string'
        && Number.isInteger(item.priceCents)
        && Number.isInteger(item.quantity)
        && item.quantity > 0
    );
}

function createQuantityControls(item, index, className) {
    const controls = document.createElement('div');
    controls.className = className;

    const decrement = document.createElement('button');
    decrement.type = 'button';
    decrement.dataset.cartChange = '-1';
    decrement.dataset.cartIndex = String(index);
    decrement.setAttribute('aria-label', `Diminuir quantidade de ${item.name}`);
    decrement.textContent = '−';

    const quantity = document.createElement('output');
    quantity.setAttribute('aria-live', 'polite');
    quantity.textContent = String(item.quantity);

    const increment = document.createElement('button');
    increment.type = 'button';
    increment.dataset.cartChange = '1';
    increment.dataset.cartIndex = String(index);
    increment.setAttribute('aria-label', `Aumentar quantidade de ${item.name}`);
    increment.textContent = '+';

    controls.append(decrement, quantity, increment);
    return controls;
}

function createCartItem(item, index, drawer = false) {
    const article = document.createElement('article');
    article.className = drawer ? 'cart-drawer__item' : 'cart-item';

    const image = document.createElement('img');
    image.className = drawer ? 'cart-drawer__item-image' : 'cart-item__image';
    image.src = item.image;
    image.alt = item.imageAlt;

    const details = document.createElement('div');
    details.className = drawer ? 'cart-drawer__item-details' : 'cart-item__details';

    const name = document.createElement(drawer ? 'strong' : 'h2');
    name.textContent = item.name;
    const location = document.createElement('span');
    location.textContent = item.location;
    const price = document.createElement(drawer ? 'b' : 'strong');
    price.textContent = `${currencyFormatter.format(item.priceCents / 100)} /${item.unit}`;
    details.append(name, location, price);

    article.append(image, details, createQuantityControls(
        item,
        index,
        drawer ? 'cart-drawer__quantity' : 'quantity'
    ));

    const remove = document.createElement('button');
    remove.className = 'cart-drawer__remove';
    remove.type = 'button';
    remove.dataset.cartRemove = String(index);
    remove.setAttribute('aria-label', `Remover ${item.name} do carrinho`);
    remove.textContent = '⌫';
    article.append(remove);

    return article;
}

function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

function renderCart() {
    const cart = readCart();
    const hasItems = cart.length > 0;
    drawerItems.replaceChildren(...cart.map((item, index) => createCartItem(item, index, true)));
    drawerEmpty.hidden = hasItems;
    drawerCheckout.hidden = !hasItems;

    if (checkoutItems) {
        checkoutItems.replaceChildren(...cart.map((item, index) => createCartItem(item, index)));
        checkoutItems.hidden = !hasItems;
        checkoutEmpty.hidden = hasItems;
        checkoutForm.hidden = !hasItems;
        orderSummary.hidden = !hasItems;

        const subtotal = calculateSubtotal(cart);
        subtotalElement.textContent = currencyFormatter.format(subtotal / 100);
        totalElement.textContent = currencyFormatter.format((subtotal + (hasItems ? shippingCost : 0)) / 100);
    }
}

function saveCart(cart) {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    renderCart();
}

function showMessage(element, message = '') {
    element.textContent = message;
    element.hidden = !message;
}

function stockMessage(item, limit) {
    return limit > 0
        ? `Você pode comprar até ${limit} ${item.unit || 'un.'} de ${item.name}.`
        : `${item.name} não está mais disponível. Retire o item do carrinho para continuar.`;
}

async function adjustQuantity(button) {
    let cart = readCart();
    let item = cart[Number(button.dataset.cartIndex)];
    if (!item) {
        return;
    }
    const amount = Number(button.dataset.cartChange);
    const message = button.closest('.cart-drawer') ? drawerMessage : checkoutMessage;
    showMessage(message);

    if (amount > 0) {
        const id = item.id;
        checkingStock = true;
        button.disabled = true;
        try {
            const stock = await consultarEstoque();
            cart = readCart();
            item = cart.find((product) => product.id === id);
            const limit = stock.get(id) ?? 0;
            if (!item || item.quantity + 1 > limit) {
                showMessage(message, item ? stockMessage(item, limit) : '');
                return;
            }
        } catch {
            showMessage(message, 'Não foi possível conferir o estoque. Tente novamente.');
            return;
        } finally {
            checkingStock = false;
            button.disabled = false;
        }
    }

    item.quantity = Math.max(1, item.quantity + amount);
    saveCart(cart);
    showMessage(message);
}

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || checkingStock) {
        return;
    }

    const quantityButton = target.closest('[data-cart-change]');
    if (quantityButton) {
        adjustQuantity(quantityButton);
        return;
    }

    const removeButton = target.closest('[data-cart-remove]');
    if (removeButton) {
        const cart = readCart();
        cart.splice(Number(removeButton.dataset.cartRemove), 1);
        saveCart(cart);
        showMessage(drawerMessage);
        if (checkoutMessage) {
            showMessage(checkoutMessage);
        }
        return;
    }

    const addButton = target.closest('[data-add-to-cart]');
    if (!addButton || addButton.disabled) {
        return;
    }

    const productInfo = addButton.closest('.product-detail__info');
    const productImage = document.querySelector('#product-main-image');
    const productName = productInfo.querySelector('#product-name').textContent.trim();
    const productPriceText = productInfo.querySelector('.product-detail__price').textContent;
    const priceMatch = productPriceText.match(/[\d.]+,\d{2}/);
    if (!priceMatch) {
        console.error('Não foi possível identificar o preço do produto para adicioná-lo ao carrinho.');
        return;
    }
    const productPrice = Number(
        priceMatch[0].replaceAll('.', '').replace(',', '.')
    );
    const product = {
        id: addButton.dataset.addToCart,
        name: productName,
        location: productInfo.querySelector('.product-detail__location').textContent.trim(),
        image: productImage.src,
        imageAlt: productImage.alt,
        unit: productInfo.querySelector('.product-detail__unit-price').textContent.trim().split('/').pop(),
        priceCents: Math.round(productPrice * 100),
        quantity: 1
    };
    const cart = readCart();
    const existingItem = cart.find((item) => item.id === product.id);
    const limit = Number(addButton.dataset.stockLimit);
    if ((existingItem?.quantity ?? 0) + 1 > limit) {
        showMessage(productMessage, stockMessage(product, limit));
        return;
    }
    showMessage(productMessage);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(product);
    }
    saveCart(cart);

    if (addButton.dataset.goToCheckout === 'true') {
        window.location.href = './finalizar-compra.html';
    } else {
        document.querySelector('broto-header').openCart();
    }
});

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (checkingStock) {
            return;
        }
        const cart = readCart();
        if (!cart.length) {
            renderCart();
            return;
        }

        checkingStock = true;
        checkoutSubmit.disabled = true;
        showMessage(checkoutMessage);
        try {
            const stock = await consultarEstoque();
            if (JSON.stringify(cart) !== JSON.stringify(readCart())) {
                renderCart();
                showMessage(checkoutMessage, 'O carrinho mudou. Confira os itens e tente novamente.');
                return;
            }
            const unavailable = cart.filter((item) => item.quantity > (stock.get(item.id) ?? 0));
            if (unavailable.length) {
                showMessage(checkoutMessage, unavailable.map((item) => stockMessage(item, stock.get(item.id) ?? 0)).join(' '));
                return;
            }
        } catch {
            showMessage(checkoutMessage, 'Não foi possível conferir o estoque. Seu carrinho foi preservado.');
            return;
        } finally {
            checkingStock = false;
            checkoutSubmit.disabled = false;
        }

        const order = {
            number: Math.floor(10000 + Math.random() * 90000),
            createdAt: new Date().toISOString(),
            totalCents: calculateSubtotal(cart) + shippingCost
        };
        try {
            sessionStorage.setItem(orderStorageKey, JSON.stringify(order));
            localStorage.removeItem(cartStorageKey);
        } catch {
            showMessage(checkoutMessage, 'Não foi possível concluir o pedido simulado nesta aba.');
            return;
        }
        window.location.href = './confirmacao-pedido.html';
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            renderCart();
        }
    });
}

window.addEventListener('storage', (event) => {
    if (event.key === cartStorageKey || event.key === null) {
        renderCart();
    }
});

const orderConfirmation = document.querySelector('.pedido-confirmado');
if (orderConfirmation) {
    let order;
    try {
        order = JSON.parse(sessionStorage.getItem(orderStorageKey));
    } catch {
        // Exibe a opção de voltar ao marketplace quando o resumo está indisponível.
    }

    const date = new Date(order?.createdAt);
    if (Number.isInteger(order?.number) && Number.isInteger(order.totalCents) && Number.isFinite(date.getTime())) {
        document.querySelector('#pedido-numero').textContent = `Pedido nº ${order.number}`;
        document.querySelector('#pedido-data').textContent = `Realizado em ${date.toLocaleDateString('pt-BR')}`;
        document.querySelector('#pedido-total').textContent = currencyFormatter.format(order.totalCents / 100);
        orderConfirmation.hidden = false;
    } else {
        document.querySelector('.pedido-ausente').hidden = false;
    }
}

renderCart();
