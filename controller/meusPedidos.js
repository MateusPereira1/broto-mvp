import { listarHistorico } from "./historicoPedidos.js";
import { associarVendedores, etapaDoVendedor, etapas, listarPedidos, listarStatus } from "./pedidos.js";

const lista = document.querySelector("#historico-pedidos");
const mensagem = document.querySelector("#historico-mensagem");
const modelo = document.querySelector("#historico-pedido").content.firstElementChild;
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const data = new Intl.DateTimeFormat("pt-BR");

function criarCartao(pedido) {
    const card = modelo.cloneNode(true);
    card.querySelector("h2").textContent = `Pedido nº ${pedido.number}`;
    card.querySelector(".historico-pedido-data").textContent = data.format(new Date(pedido.createdAt));
    card.querySelector(".historico-pedido-total").textContent = moeda.format(pedido.totalCents / 100);
    const link = card.querySelector("a");
    link.href = `./acompanhar-pedido.html?${new URLSearchParams({ id: pedido.id })}`;
    link.setAttribute("aria-label", `Acompanhar pedido nº ${pedido.number}`);
    lista.append(card);
    return card.querySelector(".pedido-recebido-status");
}

async function exibirHistorico() {
    let historico;
    try {
        historico = listarHistorico();
    } catch {
        mensagem.textContent = "Não foi possível acessar os pedidos salvos neste navegador.";
        return;
    }
    if (!historico.length) {
        document.querySelector("#historico-vazio").hidden = false;
        return;
    }

    const rotulos = new Map(historico.map((pedido) => [String(pedido.id), criarCartao(pedido)]));
    const atualizados = new Set();
    try {
        const [pedidos, status] = await Promise.all([listarPedidos(), listarStatus()]);
        const comprados = await associarVendedores(pedidos.filter((pedido) => rotulos.has(String(pedido.id))));
        for (const pedido of comprados) {
            if (!pedido.itens.length || pedido.itens.every((item) => !item.produtorId)) continue;
            const progresso = pedido.itens.map((item) => item.produtorId
                ? etapaDoVendedor(status, pedido.id, item.produtorId)
                : 0);
            const id = String(pedido.id);
            rotulos.get(id).textContent = etapas[Math.min(...progresso)];
            atualizados.add(id);
        }
    } catch {
        mensagem.textContent = "Não foi possível consultar o status. Recarregue a página para tentar novamente.";
    }
    for (const [id, rotulo] of rotulos) {
        if (!atualizados.has(id)) rotulo.textContent = "Status indisponível";
    }
}

exibirHistorico();
