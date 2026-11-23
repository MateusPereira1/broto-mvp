const mainImage = document.querySelector('#product-main-image');
const thumbnails = document.querySelectorAll('.product-gallery__thumbnail');

thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => {
        mainImage.src = thumbnail.dataset.image;
        mainImage.alt = thumbnail.dataset.alt;

        thumbnails.forEach((item) => {
            const isSelected = item === thumbnail;
            item.classList.toggle('is-selected', isSelected);
            item.setAttribute('aria-pressed', String(isSelected));
        });
    });

    document.querySelectorAll('.product-card__favorite').forEach((button) => {
        button.addEventListener('click', () => {
            const isFavorite = button.getAttribute('aria-pressed') === 'true';
            button.setAttribute('aria-pressed', String(!isFavorite));
            button.setAttribute(
                'aria-label',
                `${isFavorite ? 'Adicionar' : 'Remover'} Nome do Produto ${isFavorite ? 'aos' : 'dos'} favoritos`
            );
        });
    });
});
