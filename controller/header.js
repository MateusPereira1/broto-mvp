class BrotoHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
                <a class="site-header__brand" href="./marketplace.html" aria-label="Broto - início">
                    <img class="site-header__logo" src="../images/Logo broto.svg" alt="">
                    <span class="site-header__wordmark">broto</span>
                </a>
                <nav class="site-header__navigation" aria-label="Navegação principal">
                    <a class="site-header__link" href="./marketplace.html" aria-label="Início" title="Início">
                        <img src="../images/homepage.svg" alt="">
                    </a>
                    <a class="site-header__link" href="./mapa-produtores.html" aria-label="Mapa de produtores" title="Mapa de produtores">
                        <img src="../images/map.svg" alt="">
                    </a>
                    <a class="site-header__link" href="./chat.html" aria-label="Conversas" title="Conversas">
                        <img src="../images/chat.svg" alt="">
                    </a>
                    <button class="site-header__link site-header__cart-trigger" type="button" aria-label="Abrir carrinho" title="Carrinho" aria-expanded="false" aria-controls="cart-drawer">
                        <img src="../images/cart.svg" alt="">
                    </button>
                </nav>
            </header>
            <div class="cart-overlay" hidden>
                <button class="cart-overlay__backdrop" type="button" aria-label="Fechar carrinho"></button>
                <section class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
                    <header class="cart-drawer__header">
                        <button class="cart-drawer__close" type="button" aria-label="Fechar carrinho">×</button>
                        <h2 id="cart-drawer-title">Seu carrinho</h2>
                    </header>
                    <div class="cart-drawer__content">
                        <p class="cart-drawer__empty">Seu carrinho está vazio.</p>
                        <div class="cart-drawer__items" aria-label="Produtos no carrinho"></div>
                        <a class="cart-drawer__checkout" href="./finalizar-compra.html">Finalizar compra</a>
                    </div>
                </section>
            </div>
        `;

        this.cartTrigger = this.querySelector('.site-header__cart-trigger');
        this.cartOverlay = this.querySelector('.cart-overlay');
        this.closeButton = this.querySelector('.cart-drawer__close');
        const currentPage = window.location.pathname.split('/').pop();
        this.querySelectorAll('.site-header__link[href]').forEach((link) => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.setAttribute('aria-current', 'page');
            }
        });
        this.cartTrigger.addEventListener('click', () => this.openCart());
        this.closeButton.addEventListener('click', () => this.closeCart());
        this.querySelector('.cart-overlay__backdrop').addEventListener('click', () => this.closeCart());
        this.cartOverlay.addEventListener('animationend', (event) => {
            if (
                event.target === this.cartOverlay
                && event.animationName === 'cart-overlay-fade-out'
                && this.cartOverlay.classList.contains('is-closing')
            ) {
                this.finishClosingCart();
            }
        });
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !this.cartOverlay.hidden) {
                this.closeCart();
            }
        });
    }

    openCart() {
        this.cartOverlay.hidden = false;
        this.cartOverlay.classList.remove('is-closing');
        this.cartTrigger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('cart-overlay-open');
        this.closeButton.focus();
    }

    closeCart() {
        if (this.cartOverlay.hidden || this.cartOverlay.classList.contains('is-closing')) {
            return;
        }

        this.cartTrigger.setAttribute('aria-expanded', 'false');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.finishClosingCart();
            return;
        }

        this.cartOverlay.classList.add('is-closing');
    }

    finishClosingCart() {
        this.cartOverlay.hidden = true;
        this.cartOverlay.classList.remove('is-closing');
        document.body.classList.remove('cart-overlay-open');
        this.cartTrigger.focus();
    }
}

if (!customElements.get('broto-header')) {
    customElements.define('broto-header', BrotoHeader);
}
