import { identificarProdutor } from "../model/produtor.js";
import { associarVendedores, etapaDoVendedor, etapas, listarPedidos, listarStatus, salvarEtapa } from "./pedidos.js";

const lista = document.querySelector("#pedidos-recebidos");
const mensagem = document.querySelector("#pedidos-mensagem");
const modelo = document.querySelector("#pedido-recebido").content.firstElementChild;
const acoes = ["Confirmar pedido", "Marcar como pronto ou em entrega", "Concluir pedido"];

function criarCard(pedido, itens, produtorId, status) {
    const card = modelo.cloneNode(true);
    const botao = card.querySelector("button");
    const rotulo = card.querySelector(".pedido-recebido-status");
    let etapa = etapaDoVendedor(status, pedido.id, produtorId);

    card.querySelector("h2").textContent = `Pedido nº ${pedido.number}`;
    for (const item of itens) {
        const linha = document.createElement("li");
        linha.textContent = `${item.nome} · ${item.quantidade} ${item.unidade ?? ""}`.trim();
        card.querySelector("ul").append(linha);
    }

    function mostrarEtapa() {
        rotulo.textContent = etapas[etapa];
        botao.hidden = etapa === etapas.length - 1;
        botao.textContent = acoes[etapa] ?? "";
    }

    botao.addEventListener("click", async () => {
        botao.disabled = true;
        try {
            const atualizado = etapaDoVendedor(await listarStatus(), pedido.id, produtorId);
            if (atualizado <= etapa) {
                await salvarEtapa(pedido.id, produtorId, etapa + 1);
                etapa += 1;
            } else {
                etapa = atualizado;
            }
            mostrarEtapa();
        } catch {
            rotulo.textContent = `${etapas[etapa]}. Não foi possível atualizar. Tente novamente.`;
        } finally {
            botao.disabled = false;
        }
    });

    mostrarEtapa();
    return card;
}

async function carregar() {
    try {
        const produtorId = identificarProdutor();
        const [pedidos, status] = await Promise.all([listarPedidos().then(associarVendedores), listarStatus()]);
        for (const pedido of pedidos) {
            const itens = pedido.itens.filter((item) => item.produtorId === produtorId);
            if (pedido.id != null && itens.length) {
                lista.append(criarCard(pedido, itens, produtorId, status));
            }
        }
        mensagem.textContent = lista.childElementCount ? "" : "Você ainda não recebeu pedidos.";
    } catch {
        mensagem.textContent = "Não foi possível carregar os pedidos. Recarregue a página para tentar novamente.";
    }
}

carregar();
