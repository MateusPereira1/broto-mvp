const produtos = [
    { nome: "Banana", categoria: "Fruta", preco: 4.5, estoque: 20, unidade: "kg", excedente: true, ativo: true, ilustracao: "🍌" },
    { nome: "Alface", categoria: "Verdura", preco: 3, estoque: 15, unidade: "un", excedente: false, ativo: true, ilustracao: "🥬" },
    { nome: "Cenoura", categoria: "Legume", preco: 5, estoque: 10, unidade: "kg", excedente: false, ativo: true, ilustracao: "🥕" },
];

const filtros = document.querySelectorAll(".produtos-filtros button");
const rotulos = Array.from(filtros, (botao) => botao.textContent);
const lista = document.querySelector(".produtos-produtor");
const modelo = document.querySelector("#produto-item");
const vazio = document.querySelector("#produtos-vazio");
const dialogo = document.querySelector("#produto-dialogo");
const formulario = document.querySelector("#produto-formulario");
const novo = document.querySelector(".produto-novo");
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 20 });
let categoria = "";
let produtoEditado;

function atualizarStatus(botao, produto) {
    botao.setAttribute("aria-checked", produto.ativo);
    botao.textContent = produto.ativo ? "Ativo" : "Inativo";
}

function abrirEditor(produto) {
    produtoEditado = produto;
    formulario.reset();
    document.querySelector("#produto-dialogo-titulo").textContent = produto ? "Editar produto" : "Cadastrar novo produto";
    if (produto) {
        for (const campo of ["nome", "categoria", "preco", "estoque", "unidade"]) {
            formulario.elements.namedItem(campo).value = produto[campo];
        }
        formulario.elements.excedente.checked = produto.excedente;
    }
    dialogo.showModal();
}

function renderizarProdutos() {
    filtros.forEach((botao, indice) => {
        const filtro = botao.dataset.categoria;
        const total = filtro ? produtos.filter((produto) => produto.categoria === filtro).length : produtos.length;
        botao.textContent = `${rotulos[indice]} (${total})`;
        botao.setAttribute("aria-pressed", filtro === categoria);
    });

    const visiveis = produtos.filter((produto) => !categoria || produto.categoria === categoria);
    vazio.hidden = visiveis.length > 0;
    lista.replaceChildren();

    for (const produto of visiveis) {
        const item = modelo.content.cloneNode(true);
        item.querySelector(".produto-ilustracao").textContent = produto.ilustracao;
        item.querySelector("h2").textContent = produto.nome;
        item.querySelector(".produto-categoria").textContent = produto.categoria;
        item.querySelector(".produto-preco").textContent = `${moeda.format(produto.preco)} / ${produto.unidade}`;
        item.querySelector(".produto-excedente").hidden = !produto.excedente;
        item.querySelector(".produto-estoque").textContent = `Estoque: ${numero.format(produto.estoque)} ${produto.unidade}`;

        const status = item.querySelector(".produto-status");
        status.setAttribute("aria-label", `${produto.nome} ativo`);
        atualizarStatus(status, produto);
        status.addEventListener("click", () => {
            produto.ativo = !produto.ativo;
            atualizarStatus(status, produto);
        });

        const editar = item.querySelector(".produto-editar");
        editar.setAttribute("aria-label", `Editar ${produto.nome}`);
        editar.addEventListener("click", () => abrirEditor(produto));

        const excluir = item.querySelector(".produto-excluir");
        excluir.setAttribute("aria-label", `Excluir ${produto.nome}`);
        excluir.addEventListener("click", () => {
            if (window.confirm(`Excluir ${produto.nome}?`)) {
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

novo.addEventListener("click", () => abrirEditor());
document.querySelector("#produto-cancelar").addEventListener("click", () => dialogo.close());
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const dados = new FormData(formulario);
    const nome = dados.get("nome").trim();
    if (!nome) {
        formulario.elements.nome.focus();
        return;
    }

    const dadosProduto = {
        nome,
        categoria: dados.get("categoria"),
        preco: Number(dados.get("preco")),
        estoque: Number(dados.get("estoque")),
        unidade: dados.get("unidade"),
        excedente: dados.has("excedente"),
    };

    if (produtoEditado) {
        Object.assign(produtoEditado, dadosProduto);
    } else {
        produtos.push({ ...dadosProduto, ativo: true, ilustracao: "🌱" });
    }

    categoria = dadosProduto.categoria;
    dialogo.close();
    renderizarProdutos();
    document.querySelector('.produtos-filtros [aria-pressed="true"]').focus();
});

renderizarProdutos();
