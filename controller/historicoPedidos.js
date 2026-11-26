const prefixo = "broto-historico-pedido:";
export const chaveUltimoPedido = "broto-ultimo-pedido";

export function resumoValido(pedido) {
    return Number.isInteger(pedido?.number)
        && Number.isInteger(pedido?.totalCents)
        && pedido.createdAt != null
        && Number.isFinite(new Date(pedido.createdAt).getTime());
}

export function lerUltimoPedido() {
    try {
        const pedido = JSON.parse(sessionStorage.getItem(chaveUltimoPedido)
            ?? sessionStorage.getItem("broto-pedido-simulado"));
        return resumoValido(pedido) ? pedido : null;
    } catch {
        return null;
    }
}

export function guardarPedido(pedido) {
    if (resumoValido(pedido) && pedido.id != null) {
        localStorage.setItem(prefixo + String(pedido.id), JSON.stringify(pedido));
    }
}

export function listarHistorico() {
    const pedidos = new Map();
    const ultimo = lerUltimoPedido();
    if (ultimo?.id != null) {
        pedidos.set(String(ultimo.id), ultimo);
    }

    for (let indice = 0; indice < localStorage.length; indice += 1) {
        const chave = localStorage.key(indice);
        if (!chave?.startsWith(prefixo)) continue;
        try {
            const pedido = JSON.parse(localStorage.getItem(chave));
            if (resumoValido(pedido) && pedido.id != null && chave === prefixo + String(pedido.id)) {
                pedidos.set(String(pedido.id), pedido);
            }
        } catch {
            // Uma entrada antiga ou corrompida não impede a leitura das demais.
        }
    }

    return [...pedidos.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function buscarPedido(id) {
    const ultimo = lerUltimoPedido();
    if (id === null || (ultimo?.id != null && String(ultimo.id) === id)) {
        return ultimo;
    }
    try {
        const pedido = JSON.parse(localStorage.getItem(prefixo + id));
        return resumoValido(pedido) && pedido.id != null && String(pedido.id) === id ? pedido : null;
    } catch {
        return null;
    }
}
