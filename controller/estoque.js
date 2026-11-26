import { COLECAO_PRODUTOS, listarRegistro } from "./api.js";

export function limiteEstoque(produto) {
    const estoque = Number(produto?.estoque);
    return produto?.ativo !== false && Number.isFinite(estoque) && estoque >= 1
        ? Math.floor(estoque)
        : 0;
}

export async function consultarEstoqueEPrecos() {
    const resposta = await listarRegistro(COLECAO_PRODUTOS);
    const produtos = Array.isArray(resposta) ? resposta : resposta?.dados;
    if (!Array.isArray(produtos)) {
        throw new Error("Resposta inválida ao consultar estoque");
    }

    return new Map(produtos.filter((produto) => produto?.id != null)
        .map((produto) => {
            const { preco } = produto;
            const valor = typeof preco === "string" && preco.trim() ? Number(preco) : preco;
            const centavos = Math.round(valor * 100);
            return [String(produto.id), {
                limite: limiteEstoque(produto),
                produtorId: produto.produtorId,
                produtor: produto.produtor,
                precoCentavos: Number.isFinite(valor) && valor >= 0 && Number.isSafeInteger(centavos)
                    ? centavos
                    : null,
            }];
        }));
}
