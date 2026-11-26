export const IMAGEM_PRODUTO_PADRAO = "../images/Logo%20broto.svg";

export function formatarPrecoProduto(produto) {
    return Number(produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function produtoDisponivel(produto) {
    return produto?.ativo !== false && produto?.id != null && String(produto.id).trim() !== "";
}

export function criarCardProduto(modelo, produto) {
    const card = modelo.cloneNode(true);
    const nome = produto.nome || "Produto";
    const local = produto.local || "";
    const link = "./produto.html?" + new URLSearchParams({ id: produto.id });

    card.dataset.search = (nome + " " + local).toLocaleLowerCase("pt-BR");
    card.querySelector(".product-card__name").textContent = nome;
    card.querySelector(".product-excess-badge").hidden = produto.excedente !== true;
    card.querySelector(".product-card__location").textContent = local;
    const unidade = produto.unidade ? "/" + produto.unidade : "";
    card.querySelector(".product-card__price").textContent = formatarPrecoProduto(produto) + unidade;

    const linkImagem = card.querySelector(".product-card__image-link");
    linkImagem.href = link;
    linkImagem.setAttribute("aria-label", "Ver detalhes de " + nome);
    card.querySelector(".product-card__buy").href = link;

    const imagem = card.querySelector(".product-card__image");
    imagem.src = produto.imagem || IMAGEM_PRODUTO_PADRAO;
    imagem.alt = produto.imagem ? nome : "";

    const favorito = card.querySelector(".product-card__favorite");
    favorito.setAttribute("aria-label", `Adicionar ${nome} aos favoritos`);
    favorito.addEventListener("click", () => {
        const favoritoAtual = favorito.getAttribute("aria-pressed") === "true";
        favorito.setAttribute("aria-pressed", String(!favoritoAtual));
        favorito.setAttribute("aria-label", favoritoAtual
            ? `Adicionar ${nome} aos favoritos`
            : `Remover ${nome} dos favoritos`);
    });
    return card;
}
