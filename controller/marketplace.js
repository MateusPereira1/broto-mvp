import { COLECAO_PRODUTOS, listarRegistro } from "./api.js";
import { criarCardProduto, produtoDisponivel } from "./cardProduto.js";

const secaoProdutos = document.querySelector(".products");
const modeloCard = secaoProdutos.querySelector(".product-card").cloneNode(true);
const busca = document.querySelector("#busca-produtos");
const filtroExcedentes = document.querySelector("#filtro-excedentes");
const mensagemVazia = document.querySelector(".marketplace__empty");
let cards;

secaoProdutos.replaceChildren();

function aplicarFiltros() {
    if (!cards) {
        return;
    }

    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
    let temResultados = false;
    for (const { card, excedente } of cards) {
        const corresponde = card.dataset.search.includes(termo)
            && (!filtroExcedentes.checked || excedente);
        card.hidden = !corresponde;
        temResultados ||= corresponde;
    }

    mensagemVazia.hidden = temResultados;
}

async function carregarProdutos() {
    try {
        const resposta = await listarRegistro(COLECAO_PRODUTOS);
        const registros = Array.isArray(resposta) ? resposta : resposta.dados || [];
        cards = registros.filter(produtoDisponivel).map((produto) => ({
            card: criarCardProduto(modeloCard, produto),
            excedente: produto.excedente === true,
        }));
        secaoProdutos.replaceChildren(...cards.map(({ card }) => card));
        aplicarFiltros();
    } catch (erro) {
        console.error("Produtos não foram carregados:", erro);
        document.querySelector("#marketplace-status").textContent =
            "Não foi possível carregar os produtos. Recarregue a página para tentar novamente.";
    }
}

document.querySelector(".marketplace__search").addEventListener("submit", (evento) => {
    evento.preventDefault();
});
busca.addEventListener("input", aplicarFiltros);
filtroExcedentes.addEventListener("change", aplicarFiltros);
window.addEventListener("pageshow", aplicarFiltros);

carregarProdutos();
