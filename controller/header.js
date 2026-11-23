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
                    <a class="site-header__link" href="./carrinho.html" aria-label="Carrinho" title="Carrinho">
                        <img src="../images/cart.svg" alt="">
                    </a>
                </nav>
            </header>
        `;
    }
}

if (!customElements.get('broto-header')) {
    customElements.define('broto-header', BrotoHeader);
}
