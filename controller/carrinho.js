import { COLECAO_PEDIDOS, criarRegistro } from "./api.js";
import { consultarEstoqueEPrecos } from "./estoque.js";
import { chaveUltimoPedido, guardarPedido } from "./historicoPedidos.js";

const cartStorageKey = 'broto-cart';
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
let cartOperationPending = false;

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
        cartOperationPending = true;
        button.disabled = true;
        try {
            const ofertas = await consultarEstoqueEPrecos();
            cart = readCart();
            item = cart.find((product) => product.id === id);
            const limit = ofertas.get(id)?.limite ?? 0;
            if (!item || item.quantity + 1 > limit) {
                showMessage(message, item ? stockMessage(item, limit) : '');
                return;
            }
        } catch {
            showMessage(message, 'Não foi possível conferir o estoque. Tente novamente.');
            return;
        } finally {
            cartOperationPending = false;
            button.disabled = false;
        }
    }

    item.quantity = Math.max(1, item.quantity + amount);
    saveCart(cart);
    showMessage(message);
}

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || cartOperationPending) {
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
        if (cartOperationPending) {
            return;
        }
        const cart = readCart();
        if (!cart.length) {
            renderCart();
            return;
        }

        const cartSnapshot = JSON.stringify(cart);
        const checkoutData = new FormData(checkoutForm);
        const deliveryAddress = ['endereco', 'complemento', 'cidade', 'cep']
            .map((field) => String(checkoutData.get(field) ?? '').trim())
            .filter(Boolean)
            .join(', ');
        cartOperationPending = true;
        checkoutSubmit.disabled = true;
        showMessage(checkoutMessage);
        try {
            let ofertas;
            try {
                ofertas = await consultarEstoqueEPrecos();
            } catch {
                showMessage(checkoutMessage, 'Não foi possível conferir o estoque e os preços. Seu carrinho foi preservado.');
                return;
            }
            if (cartSnapshot !== JSON.stringify(readCart())) {
                renderCart();
                showMessage(checkoutMessage, 'O carrinho mudou. Confira os itens e tente novamente.');
                return;
            }
            const unavailable = cart.filter((item) => item.quantity > (ofertas.get(item.id)?.limite ?? 0));
            if (unavailable.length) {
                showMessage(checkoutMessage, unavailable.map((item) => stockMessage(item, ofertas.get(item.id)?.limite ?? 0)).join(' '));
                return;
            }

            const invalidPrice = cart.find((item) => ofertas.get(item.id).precoCentavos === null);
            if (invalidPrice) {
                showMessage(checkoutMessage, `O preço de ${invalidPrice.name} está indisponível. Tente novamente mais tarde ou retire o item do carrinho.`);
                return;
            }

            const changedPrices = cart.filter((item) => item.priceCents !== ofertas.get(item.id).precoCentavos);
            if (changedPrices.length) {
                for (const item of changedPrices) {
                    item.priceCents = ofertas.get(item.id).precoCentavos;
                }
                saveCart(cart);
                showMessage(checkoutMessage, 'O preço de um ou mais produtos mudou. Confira o novo total antes de finalizar.');
                return;
            }

            const subtotalCents = calculateSubtotal(cart);
            const order = {
                number: Math.floor(10000 + Math.random() * 90000),
                itens: cart.map((item) => ({
                    produtoId: item.id,
                    produtorId: ofertas.get(item.id).produtorId,
                    produtor: ofertas.get(item.id).produtor,
                    nome: item.name,
                    unidade: item.unit,
                    quantidade: item.quantity,
                    precoUnitarioCentavos: item.priceCents,
                })),
                subtotalCents,
                shippingCents: shippingCost,
                totalCents: subtotalCents + shippingCost,
            };

            let savedOrder;
            try {
                savedOrder = await criarRegistro(COLECAO_PEDIDOS, order);
            } catch {
                showMessage(checkoutMessage, 'Não foi possível registrar o pedido. Seu carrinho foi preservado.');
                return;
            }

            const summary = {
                id: (savedOrder?.dados ?? savedOrder)?.id,
                number: order.number,
                createdAt: (savedOrder?.dados ?? savedOrder)?.createdAt ?? new Date().toISOString(),
                totalCents: order.totalCents,
                deliveryAddress,
            };
            try {
                guardarPedido(summary);
            } catch (erro) {
                console.error('Não foi possível salvar o pedido no histórico local:', erro);
            }
            try {
                if (cartSnapshot === JSON.stringify(readCart())) {
                    localStorage.removeItem(cartStorageKey);
                }
                sessionStorage.setItem(chaveUltimoPedido, JSON.stringify(summary));
            } catch {
                renderCart();
                showMessage(checkoutMessage, `Pedido nº ${order.number} registrado. O resumo não pôde ser aberto nesta aba.`);
                return;
            }
            window.location.href = './confirmacao-pedido.html';
        } finally {
            cartOperationPending = false;
            checkoutSubmit.disabled = false;
        }
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
        order = JSON.parse(sessionStorage.getItem(chaveUltimoPedido) ?? sessionStorage.getItem('broto-pedido-simulado'));
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
