import { COLECAO_PRODUTOS, listarRegistro } from "./api.js";

const secaoProdutos = document.querySelector(".products");

const exemploCard = secaoProdutos.querySelector(".product-card");
const modelCard = exemploCard.cloneNode(true);

function adaptarProduto(item) {
    const produto = {};

    produto.nome = item.nome || " ";
    produto.local = item.local || " ";
    produto.preco = Number(item.preco) || 0;
    produto.imagem = item.imagem;

    return produto;
}

function formatarPreco(valor) {
    const texto = valor.toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
    return texto + "/Kg";
}

function criarCard(item) {
    const produto = adaptarProduto(item);
    const card = modelCard.cloneNode(true);

    card.dataset.search = (produto.nome + " " + produto.local).toLocaleLowerCase("pt-BR");

    card.querySelector(".product-card__name").textContent = produto.nome;
    card.querySelector(".product-card__location").textContent = produto.local;
    card.querySelector(".product-card__price").textContent = formatarPreco(produto.preco);

    const linkImagem = card.querySelector(".product-card__image-link");
    linkImagem.setAttribute("aria-label", "Ver detalhes de " + produto.nome);

    const botaoFavoritar = card.querySelector(".product-card__favorite");
    botaoFavoritar.setAttribute("aria-label", "Adicionar " + produto.nome + " aos favoritos");

    if(produto.imagem) {
    const imagem = card.querySelector(".product-card__image");
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    }

    return card;
}

async function carregarProduto() {
    try {
        const resposta = await listarRegistro(COLECAO_PRODUTOS);
        console.log(resposta);

        let listaProdutos = resposta;
        if (!Array.isArray(resposta)) {
            listaProdutos = resposta.dados || [];
        }
        listaProdutos = listaProdutos.filter((produto) => produto.ativo !== false);

        secaoProdutos.innerHTML = "";
        for (let i = 0; i < listaProdutos.length; i++) {
            const card = criarCard(listaProdutos[i]);
            secaoProdutos.appendChild(card);
        }

        const mensagemVazia = document.querySelector('.marketplace__empty');
        mensagemVazia.hidden = listaProdutos.length > 0;

    } catch(erro) {
        console.error("Produtos não foram carregados:", erro);

    }
}

await carregarProduto();


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
