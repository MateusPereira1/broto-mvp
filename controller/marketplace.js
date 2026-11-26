import { COLECAO_PRODUTOS, listarRegistro } from "./api.js";

import { criarCardProduto, produtoDisponivel } from "./cardProduto.js";

const secaoProdutos = document.querySelector(".products");

const exemploCard = secaoProdutos.querySelector(".product-card");
const modelCard = exemploCard.cloneNode(true);
secaoProdutos.replaceChildren();

async function carregarProduto() {
    try {
        const resposta = await listarRegistro(COLECAO_PRODUTOS);

        let listaProdutos = resposta;
        if (!Array.isArray(resposta)) {
            listaProdutos = resposta.dados || [];
        }
        listaProdutos = listaProdutos.filter(produtoDisponivel);

        secaoProdutos.innerHTML = "";
        for (let i = 0; i < listaProdutos.length; i++) {
            const card = criarCardProduto(modelCard, listaProdutos[i]);
            secaoProdutos.appendChild(card);
        }

        const mensagemVazia = document.querySelector('.marketplace__empty');
        mensagemVazia.hidden = listaProdutos.length > 0;

    } catch(erro) {
        console.error("Produtos não foram carregados:", erro);
        secaoProdutos.replaceChildren();
        const mensagem = document.querySelector("#marketplace-status");
        mensagem.textContent = "Não foi possível carregar os produtos. Recarregue a página para tentar novamente.";
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
