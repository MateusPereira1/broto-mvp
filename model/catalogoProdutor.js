const chaveCatalogo = "broto-catalogo-produtor";

const exemplos = [
    { nome: "Banana", categoria: "Fruta", preco: 4.5, estoque: 20, unidade: "kg", excedente: true, ativo: true, ilustracao: "🍌" },
    { nome: "Alface", categoria: "Verdura", preco: 3, estoque: 15, unidade: "un", excedente: false, ativo: true, ilustracao: "🥬" },
    { nome: "Cenoura", categoria: "Legume", preco: 5, estoque: 10, unidade: "kg", excedente: false, ativo: true, ilustracao: "🥕" },
];

export function carregarCatalogo() {
    try {
        const dados = JSON.parse(sessionStorage.getItem(chaveCatalogo));
        if (Array.isArray(dados)) {
            return dados;
        }
    } catch {
        // O catálogo de exemplo também pode ser aberto com armazenamento bloqueado.
    }
    return exemplos.map((produto) => ({ ...produto }));
}

export function salvarCatalogo(produtos) {
    sessionStorage.setItem(chaveCatalogo, JSON.stringify(produtos));
}

export function converterNumeroDecimal(valor) {
    const texto = String(valor ?? "").trim();
    if (!texto) {
        return Number.NaN;
    }
    const separador = Math.max(texto.lastIndexOf("."), texto.lastIndexOf(","));
    if (separador < 0) {
        return Number(texto);
    }
    const inteiro = texto.slice(0, separador).replace(/[.,]/g, "");
    const decimal = texto.slice(separador + 1).replace(/[.,]/g, "");
    return Number(`${inteiro || "0"}.${decimal}`);
}

export function converterPreco(valor) {
    return converterNumeroDecimal(String(valor ?? "").trim().replace(/^R\$\s*/i, ""));
}

export function lerProduto(formulario) {
    const dados = new FormData(formulario);
    const nome = dados.get("nome").trim();
    if (!nome) {
        const campo = formulario.elements.nome;
        campo.setCustomValidity("Informe o nome do produto.");
        campo.reportValidity();
        campo.setCustomValidity("");
        return null;
    }

    const campoPreco = formulario.elements.preco;
    const preco = converterPreco(dados.get("preco"));
    if (!Number.isFinite(preco) || preco < 0) {
        campoPreco.setCustomValidity("Informe um preço válido em reais.");
        campoPreco.reportValidity();
        campoPreco.setCustomValidity("");
        return null;
    }

    const campoEstoque = formulario.elements.estoque;
    const estoque = converterNumeroDecimal(dados.get("estoque"));
    if (!Number.isFinite(estoque) || estoque < 0) {
        campoEstoque.setCustomValidity("Informe uma quantidade válida e não negativa.");
        campoEstoque.reportValidity();
        campoEstoque.setCustomValidity("");
        return null;
    }

    return {
        nome,
        categoria: dados.get("categoria"),
        preco,
        estoque,
        unidade: dados.get("unidade"),
        excedente: dados.get("excedente") === "sim" || dados.get("excedente") === "on",
    };
}
