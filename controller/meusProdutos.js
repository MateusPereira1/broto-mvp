import { lerProduto } from "../model/catalogoProdutor.js";
import { identificarProdutor } from "../model/produtor.js";
import { alterarProduto, COLECAO_PRODUTOS, excluirProduto, listarRegistro } from "./api.js";

let produtos = [];
let carregados = false;
let operacaoEmAndamento = false;

const filtros = document.querySelectorAll(".produtos-filtros button");
const rotulos = Array.from(filtros, (botao) => botao.textContent);
const lista = document.querySelector(".produtos-produtor");
const modelo = document.querySelector("#produto-item");
const vazio = document.querySelector("#produtos-vazio");
const mensagem = document.querySelector("#produtos-mensagem");
const dialogo = document.querySelector("#produto-dialogo");
const formulario = document.querySelector("#produto-formulario");
const mensagemEdicao = document.querySelector("#produto-edicao-mensagem");
const botaoSalvar = formulario.querySelector('button[type="submit"]');
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 20 });
let categoria = "";
let produtoEditado;

function atualizarStatus(botao, produto) {
    const ativo = produto.ativo !== false;
    botao.setAttribute("aria-checked", ativo);
    botao.textContent = ativo ? "Ativo" : "Inativo";
}

function abrirEditor(produto) {
    produtoEditado = produto;
    mensagemEdicao.textContent = "";
    formulario.reset();
    for (const campo of ["nome", "categoria", "preco", "estoque", "unidade"]) {
        formulario.elements.namedItem(campo).value = produto[campo];
    }
    formulario.elements.excedente.checked = produto.excedente;
    dialogo.showModal();
}

async function executarAlteracao(acao, erro, aviso = mensagem) {
    if (operacaoEmAndamento) {
        return false;
    }
    operacaoEmAndamento = true;
    aviso.textContent = "Salvando alteração…";
    try {
        await acao();
        aviso.textContent = "";
        return true;
    } catch {
        aviso.textContent = erro;
        return false;
    } finally {
        operacaoEmAndamento = false;
    }
}

async function carregarProdutos() {
    mensagem.textContent = "Carregando produtos…";
    try {
        const produtorId = identificarProdutor();
        const resposta = await listarRegistro(COLECAO_PRODUTOS);
        const registros = Array.isArray(resposta) ? resposta : resposta.dados;
        produtos = registros.filter((produto) => produto.produtorId === produtorId);
        carregados = true;
        mensagem.textContent = "";
    } catch {
        mensagem.textContent = "Não foi possível carregar seus produtos. Recarregue a página para tentar novamente.";
    }
    renderizarProdutos();
}

function renderizarProdutos() {
    filtros.forEach((botao, indice) => {
        const filtro = botao.dataset.categoria;
        const total = filtro ? produtos.filter((produto) => produto.categoria === filtro).length : produtos.length;
        botao.textContent = `${rotulos[indice]} (${total})`;
        botao.setAttribute("aria-pressed", filtro === categoria);
    });

    const visiveis = produtos.filter((produto) => !categoria || produto.categoria === categoria);
    vazio.hidden = !carregados || visiveis.length > 0;
    lista.replaceChildren();

    for (const produto of visiveis) {
        const item = modelo.content.cloneNode(true);
        const ilustracao = item.querySelector(".produto-ilustracao");
        ilustracao.textContent = "🌱";
        const urlImagem = produto.imagens?.[0] || produto.imagem;
        if (urlImagem) {
            const imagem = document.createElement("img");
            imagem.src = urlImagem;
            imagem.alt = "";
            ilustracao.replaceChildren(imagem);
        }
        item.querySelector("h2").textContent = produto.nome;
        item.querySelector(".produto-categoria").textContent = produto.categoria;
        item.querySelector(".produto-preco").textContent = `${moeda.format(produto.preco)} / ${produto.unidade}`;
        item.querySelector(".produto-excedente").hidden = !produto.excedente;
        item.querySelector(".produto-estoque").textContent = `Estoque: ${numero.format(produto.estoque)} ${produto.unidade}`;

        const descricao = item.querySelector(".produto-descricao");
        descricao.textContent = produto.descricao || "";
        descricao.hidden = !produto.descricao;

        const status = item.querySelector(".produto-status");
        status.setAttribute("aria-label", `${produto.nome} ativo`);
        atualizarStatus(status, produto);
        status.addEventListener("click", async () => {
            const ativo = produto.ativo === false;
            if (await executarAlteracao(
                () => alterarProduto(produto.id, { ativo }),
                "Não foi possível alterar a disponibilidade do produto."
            )) {
                produto.ativo = ativo;
                renderizarProdutos();
            }
        });

        const editar = item.querySelector(".produto-editar");
        editar.setAttribute("aria-label", `Editar ${produto.nome}`);
        editar.addEventListener("click", () => {
            if (!operacaoEmAndamento) {
                abrirEditor(produto);
            }
        });

        const excluir = item.querySelector(".produto-excluir");
        excluir.setAttribute("aria-label", `Excluir ${produto.nome}`);
        excluir.addEventListener("click", async () => {
            if (operacaoEmAndamento || !window.confirm(`Excluir ${produto.nome}?`)) {
                return;
            }
            if (await executarAlteracao(
                () => excluirProduto(produto.id),
                "Não foi possível excluir o produto."
            )) {
                produtos.splice(produtos.indexOf(produto), 1);
                renderizarProdutos();
                document.querySelector('.produtos-filtros [aria-pressed="true"]').focus();
            }
        });

        lista.append(item);
    }
}

filtros.forEach((botao) => {
    botao.addEventListener("click", () => {
        categoria = botao.dataset.categoria;
        renderizarProdutos();
    });
});

document.querySelector("#produto-cancelar").addEventListener("click", () => dialogo.close());
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dadosProduto = lerProduto(formulario);
    if (!dadosProduto || operacaoEmAndamento) {
        return;
    }
    const produto = produtoEditado;
    botaoSalvar.disabled = true;
    const salvo = await executarAlteracao(
        () => alterarProduto(produto.id, dadosProduto),
        "Não foi possível salvar. Tente novamente.",
        mensagemEdicao
    );
    botaoSalvar.disabled = false;
    if (!salvo) {
        return;
    }

    Object.assign(produto, dadosProduto);
    categoria = dadosProduto.categoria;
    dialogo.close();
    renderizarProdutos();
    document.querySelector('.produtos-filtros [aria-pressed="true"]').focus();
});

carregarProdutos();

window.addEventListener("pageshow", (evento) => {
    if (evento.persisted) {
        carregarProdutos();
    }
});
