import { COLECAO_PRODUTOS, listarRegistro } from "./api.js";
import {
    criarCardProduto,
    formatarPrecoProduto,
    IMAGEM_PRODUTO_PADRAO,
    produtoDisponivel,
} from "./cardProduto.js";

const detalhe = document.querySelector(".product-detail");
const mensagem = document.querySelector("#product-message");
const voltar = document.querySelector("#product-back");
const id = new URLSearchParams(window.location.search).get("id");

function mostrarErro(texto) {
    mensagem.textContent = texto;
    voltar.hidden = false;
}

function preencherDetalhes(produto) {
    const nome = produto.nome || "Produto";
    const unidade = produto.unidade || "";
    const preco = formatarPrecoProduto(produto);
    const imagem = detalhe.querySelector("#product-main-image");

    document.title = "Broto - " + nome;
    detalhe.querySelector("#product-name").textContent = nome;
    detalhe.querySelector(".product-detail__location").textContent = produto.local || "";
    detalhe.querySelector(".product-detail__price").textContent = preco;
    detalhe.querySelector(".product-detail__unit-price").textContent = unidade ? preco + "/" + unidade : "";
    detalhe.querySelector(".product-detail__stock").textContent = produto.estoque != null
        ? `Disponível: ${produto.estoque} ${unidade}`.trim()
        : "Estoque não informado";
    detalhe.querySelector(".product-detail__description p").textContent = produto.descricao || "Sem descrição.";

    imagem.src = produto.imagem || IMAGEM_PRODUTO_PADRAO;
    imagem.alt = produto.imagem ? nome : "";
    detalhe.querySelectorAll(".product-detail__actions button").forEach((botao) => {
        botao.dataset.addToCart = String(produto.id);
    });
    mensagem.hidden = true;
    detalhe.hidden = false;
}

function preencherMaisProdutos(produtos) {
    const secao = document.querySelector(".related-products");
    const lista = secao.querySelector(".products");
    const modelo = document.querySelector("#related-product-card").content.firstElementChild;
    for (const produto of produtos.slice(0, 6)) {
        lista.appendChild(criarCardProduto(modelo, produto));
    }
    secao.hidden = !lista.childElementCount;
}

async function carregarDetalhes() {
    if (!id?.trim()) {
        mostrarErro("Selecione um produto no marketplace.");
        return;
    }

    try {
        const resposta = await listarRegistro(COLECAO_PRODUTOS);
        const registros = Array.isArray(resposta) ? resposta : resposta?.dados;
        const produtos = registros.filter(produtoDisponivel);
        const produto = produtos.find((item) => String(item.id) === id);
        if (!produto) {
            mostrarErro("Este produto está indisponível.");
            return;
        }

        preencherDetalhes(produto);
        preencherMaisProdutos(produtos.filter((item) => item !== produto));
    } catch (erro) {
        console.error("Erro ao carregar o produto:", erro);
        mostrarErro("Não foi possível carregar o produto. Recarregue a página para tentar novamente.");
    }
}

carregarDetalhes();
