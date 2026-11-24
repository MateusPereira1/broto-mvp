document.addEventListener('DOMContentLoaded', () => {
    const fallbackCoords = [-8.0522, -34.9286];

    if (typeof L === 'undefined') {
        console.error('Não foi possível carregar o Leaflet.');
        return;
    }

    const map = L.map('map', {
        center: fallbackCoords,
        zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-pulse"></div><div class="user-dot"></div>',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });

    const producerIcon = L.divIcon({
        className: 'producer-pin',
        html: `
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" aria-hidden="true">
                <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="#0ACF83"/>
                <circle cx="14" cy="14" r="5" fill="white"/>
            </svg>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36]
    });

    const produtores = [
        {
            nome: 'Nome do Produtor',
            cidade: 'Cidade do Produtor',
            coords: [-8.0480, -34.9180],
            imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80'
        },
        {
            nome: 'Sítio Verde Orgânicos',
            cidade: 'Recife - PE',
            coords: [-8.0410, -34.9150],
            imagem: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=500&q=80'
        },
        {
            nome: 'Fazenda Boa Colheita',
            cidade: 'Olinda - PE',
            coords: [-8.0330, -34.9020],
            imagem: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80'
        },
        {
            nome: 'Horta da Serra',
            cidade: 'Jaboatão - PE',
            coords: [-8.0550, -34.9330],
            imagem: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&w=500&q=80'
        },
        {
            nome: 'Chácara Sol Nascente',
            cidade: 'Camaragibe - PE',
            coords: [-8.0620, -34.9180],
            imagem: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=500&q=80'
        },
        {
            nome: 'Agroecologia Vale',
            cidade: 'Recife - PE',
            coords: [-8.0710, -34.9320],
            imagem: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=500&q=80'
        }
    ];

    const cardName = document.getElementById('producer-name');
    const cardCity = document.getElementById('producer-city');
    const cardImg = document.getElementById('producer-img');
    const favButton = document.getElementById('fav-btn');
    const productsButton = document.getElementById('btn-products');

    produtores.forEach((produtor) => {
        const marker = L.marker(produtor.coords, {
            icon: producerIcon,
            alt: produtor.nome
        }).addTo(map);

        marker.on('click', () => {
            cardName.textContent = produtor.nome;
            cardCity.textContent = produtor.cidade;
            cardImg.src = produtor.imagem;
            cardImg.alt = `Propriedade de ${produtor.nome}`;
            favButton.setAttribute('aria-pressed', 'false');
            favButton.setAttribute('aria-label', `Adicionar ${produtor.nome} aos favoritos`);
            map.panTo(produtor.coords);
        });
    });

    favButton.addEventListener('click', () => {
        const isFavorite = favButton.getAttribute('aria-pressed') === 'true';
        favButton.setAttribute('aria-pressed', String(!isFavorite));
        favButton.setAttribute(
            'aria-label',
            `${isFavorite ? 'Adicionar' : 'Remover'} ${cardName.textContent} ${isFavorite ? 'aos' : 'dos'} favoritos`
        );
    });

    productsButton.addEventListener('click', () => {
        window.location.href = './marketplace.html';
    });

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentCoords = [position.coords.latitude, position.coords.longitude];
                L.marker(currentCoords, { icon: userIcon })
                    .bindTooltip('Sua localização', { direction: 'top' })
                    .addTo(map);
                map.panTo(currentCoords);
            },
            () => {
                L.marker(fallbackCoords, { icon: userIcon }).addTo(map);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
        );
    } else {
        L.marker(fallbackCoords, { icon: userIcon }).addTo(map);
    }
});
