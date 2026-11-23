const searchInput = document.querySelector('#busca-produtos');
const productCards = [...document.querySelectorAll('.product-card')];
const emptyMessage = document.querySelector('.marketplace__empty');

document.querySelector('.marketplace__search').addEventListener('submit', (event) => {
    event.preventDefault();
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    let visibleProducts = 0;

    productCards.forEach((card) => {
        const matches = card.dataset.search.includes(searchTerm);
        card.hidden = !matches;
        visibleProducts += Number(matches);
    });

    emptyMessage.hidden = visibleProducts > 0;
});

document.querySelectorAll('.product-card__favorite').forEach((button) => {
    button.addEventListener('click', () => {
        const isFavorite = button.getAttribute('aria-pressed') === 'true';
        const productName = button.closest('.product-card')
            .querySelector('.product-card__name')
            .textContent.trim();

        button.setAttribute('aria-pressed', String(!isFavorite));
        button.setAttribute(
            'aria-label',
            `${isFavorite ? 'Adicionar' : 'Remover'} ${productName} ${isFavorite ? 'aos' : 'dos'} favoritos`
        );
    });
});
