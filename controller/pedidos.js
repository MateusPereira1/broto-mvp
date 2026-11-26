import { COLECAO_PEDIDOS, COLECAO_PRODUTOS, criarRegistro, listarRegistro } from "./api.js";

const COLECAO_STATUS = "status-pedidos";

export const etapas = [
    "Pedido recebido",
    "Pedido confirmado",
    "Pronto para retirada ou em entrega",
    "Pedido concluído",
];

async function listar(colecao) {
    const resposta = await listarRegistro(colecao);
    const registros = Array.isArray(resposta) ? resposta : resposta?.dados;
    if (!Array.isArray(registros)) {
        throw new Error("Resposta inválida da API");
    }
    return registros;
}

export const listarPedidos = () => listar(COLECAO_PEDIDOS);
export const listarStatus = () => listar(COLECAO_STATUS);

export async function associarVendedores(pedidos) {
    const itens = pedidos.flatMap((pedido) => pedido.itens ?? []);
    const produtos = itens.some((item) => !item.produtorId)
        ? await listar(COLECAO_PRODUTOS)
        : [];
    const catalogo = new Map(produtos.map((produto) => [String(produto.id), produto]));
    return pedidos.map((pedido) => ({
        ...pedido,
        itens: (pedido.itens ?? []).map((item) => {
            const produto = catalogo.get(String(item.produtoId));
            return {
                ...item,
                produtorId: item.produtorId ?? produto?.produtorId,
                produtor: item.produtor ?? produto?.produtor,
            };
        }),
    }));
}

export function etapaDoVendedor(status, pedidoId, produtorId) {
    return status.reduce((etapa, registro) => {
        if (String(registro.pedidoId) === String(pedidoId)
            && registro.produtorId === produtorId && Number.isInteger(registro.etapa)
            && registro.etapa < etapas.length) {
            return Math.max(etapa, registro.etapa);
        }
        return etapa;
    }, 0);
}

export function salvarEtapa(pedidoId, produtorId, etapa) {
    return criarRegistro(COLECAO_STATUS, { pedidoId, produtorId, etapa });
}
