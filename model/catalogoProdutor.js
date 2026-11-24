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

    return {
        nome,
        categoria: dados.get("categoria"),
        preco: Number(dados.get("preco")),
        estoque: Number(dados.get("estoque")),
        unidade: dados.get("unidade"),
        excedente: dados.get("excedente") === "sim" || dados.get("excedente") === "on",
    };
}
