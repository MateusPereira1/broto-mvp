class BrotoHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
                <a class="site-header__brand" href="./marketplace.html" aria-label="Broto - início">
                    <img class="site-header__logo" src="../images/Logo broto.svg" alt="">
                    <span class="site-header__wordmark">broto</span>
                </a>
                <nav class="site-header__navigation" aria-label="Navegação rápida">
                    <a class="site-header__text-link" href="./marketplace.html">Marketplace</a>
                    <a class="site-header__text-link" href="./mapa-produtores.html">Produtores</a>
                    <a class="site-header__text-link" href="./acompanhar-pedido.html">Pedidos</a>
                    <a class="site-header__link" href="./chat.html" aria-label="Conversas" title="Conversas">
                        <img src="../images/chat.svg" alt="">
                    </a>
                    <button class="site-header__link site-header__cart-trigger" type="button" aria-label="Abrir carrinho" title="Carrinho" aria-expanded="false" aria-controls="cart-drawer">
                        <img src="../images/cart.svg" alt="">
                    </button>
                    <button class="site-header__menu-trigger" type="button" aria-label="Abrir menu de navegação" title="Abrir menu" aria-expanded="false" aria-controls="navigation-drawer">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </nav>
            </header>
            <div class="navigation-overlay" hidden>
                <button class="navigation-overlay__backdrop" type="button" aria-label="Fechar menu"></button>
                <aside class="navigation-drawer" id="navigation-drawer" role="dialog" aria-modal="true" aria-labelledby="navigation-drawer-title">
                    <header class="navigation-drawer__header">
                        <div>
                            <span class="navigation-drawer__eyebrow">Navegação</span>
                            <h2 id="navigation-drawer-title">Para onde vamos?</h2>
                        </div>
                        <button class="navigation-drawer__close" type="button" aria-label="Fechar menu">×</button>
                    </header>
                    <nav class="navigation-drawer__links" aria-label="Todas as páginas">
                        <section class="navigation-drawer__group" aria-labelledby="navigation-explore-title">
                            <h3 id="navigation-explore-title">Explorar</h3>
                            <a href="./marketplace.html">Marketplace</a>
                            <a href="./mapa-produtores.html">Mapa de produtores</a>
                            <a href="./produto.html">Detalhes do produto</a>
                        </section>
                        <section class="navigation-drawer__group" aria-labelledby="navigation-orders-title">
                            <h3 id="navigation-orders-title">Compras e pedidos</h3>
                            <a href="./finalizar-compra.html">Finalizar compra</a>
                            <a href="./confirmacao-pedido.html">Confirmação do pedido</a>
                            <a href="./acompanhar-pedido.html">Acompanhar pedido</a>
                            <a href="./chat.html">Conversas</a>
                        </section>
                        <section class="navigation-drawer__group" aria-labelledby="navigation-producer-title">
                            <h3 id="navigation-producer-title">Área do produtor</h3>
                            <a href="./dashboard-produtor.html">Painel do produtor</a>
                            <a href="./meus-produtos.html">Meus produtos</a>
                            <a href="./cadastrar-produto.html">Cadastrar produto</a>
                        </section>
                        <section class="navigation-drawer__group" aria-labelledby="navigation-account-title">
                            <h3 id="navigation-account-title">Conta e cadastro</h3>
                            <a href="../index.html">Entrar</a>
                            <a href="./registro.html">Criar conta</a>
                            <a href="./cadastro-localizacao.html">Cadastrar localização</a>
                            <a href="./cadastro-localizacao-manual.html">Informar endereço manualmente</a>
                            <button class="navigation-drawer__logout" type="button">Sair da conta</button>
                        </section>
                    </nav>
                </aside>
            </div>
            <div class="cart-overlay" hidden>
                <button class="cart-overlay__backdrop" type="button" aria-label="Fechar carrinho"></button>
                <section class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
                    <header class="cart-drawer__header">
                        <button class="cart-drawer__close" type="button" aria-label="Fechar carrinho">×</button>
                        <h2 id="cart-drawer-title">Seu carrinho</h2>
                    </header>
                    <div class="cart-drawer__content">
                        <p class="cart-drawer__empty">Seu carrinho está vazio.</p>
                        <p class="cart-drawer__message" role="status" hidden></p>
                        <div class="cart-drawer__items" aria-label="Produtos no carrinho"></div>
                        <a class="cart-drawer__checkout" href="./finalizar-compra.html">Finalizar compra</a>
                    </div>
                </section>
            </div>
        `;

        this.menuTrigger = this.querySelector('.site-header__menu-trigger');
        this.navigationOverlay = this.querySelector('.navigation-overlay');
        this.navigationCloseButton = this.querySelector('.navigation-drawer__close');
        this.cartTrigger = this.querySelector('.site-header__cart-trigger');
        this.cartOverlay = this.querySelector('.cart-overlay');
        this.closeButton = this.querySelector('.cart-drawer__close');
        this.menuTrigger.addEventListener('click', () => this.openNavigation());
        this.navigationCloseButton.addEventListener('click', () => this.closeNavigation());
        this.querySelector('.navigation-overlay__backdrop').addEventListener('click', () => this.closeNavigation());
        this.querySelector('.navigation-drawer__logout').addEventListener('click', () => {
            window.location.assign('../index.html');
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
        this.navigationOverlay.addEventListener('animationend', (event) => {
            if (
                event.target === this.navigationOverlay
                && event.animationName === 'navigation-overlay-fade-out'
                && this.navigationOverlay.classList.contains('is-closing')
            ) {
                this.finishClosingNavigation();
            }
        });
        this.querySelectorAll('.site-header__navigation a, .navigation-drawer__links a').forEach((link) => {
            if (new URL(link.href).pathname === window.location.pathname) {
                link.setAttribute('aria-current', 'page');
            }
        });
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (!this.navigationOverlay.hidden) {
                    this.closeNavigation();
                } else if (!this.cartOverlay.hidden) {
                    this.closeCart();
                }
            }

            if (event.key === 'Tab' && !this.navigationOverlay.hidden) {
                const focusableElements = this.navigationOverlay.querySelectorAll(
                    'button:not([disabled]), a[href]'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    openNavigation() {
        if (!this.cartOverlay.hidden) {
            this.closeCart();
        }
        this.navigationOverlay.hidden = false;
        this.navigationOverlay.classList.remove('is-closing');
        this.menuTrigger.setAttribute('aria-expanded', 'true');
        this.menuTrigger.setAttribute('aria-label', 'Fechar menu de navegação');
        this.menuTrigger.setAttribute('title', 'Fechar menu');
        document.body.classList.add('navigation-overlay-open');
        this.navigationCloseButton.focus();
    }

    closeNavigation() {
        if (this.navigationOverlay.hidden || this.navigationOverlay.classList.contains('is-closing')) {
            return;
        }

        this.menuTrigger.setAttribute('aria-expanded', 'false');
        this.menuTrigger.setAttribute('aria-label', 'Abrir menu de navegação');
        this.menuTrigger.setAttribute('title', 'Abrir menu');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.finishClosingNavigation();
            return;
        }

        this.navigationOverlay.classList.add('is-closing');
    }

    finishClosingNavigation() {
        this.navigationOverlay.hidden = true;
        this.navigationOverlay.classList.remove('is-closing');
        document.body.classList.remove('navigation-overlay-open');
        this.menuTrigger.focus();
    }

    openCart() {
        if (!this.navigationOverlay.hidden) {
            this.closeNavigation();
        }
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
