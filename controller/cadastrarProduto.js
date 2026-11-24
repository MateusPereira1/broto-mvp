import { carregarCatalogo, lerProduto, salvarCatalogo } from "../model/catalogoProdutor.js";

const formulario = document.querySelector("#cadastro-produto");
const foto = document.querySelector("#foto-produto");
const previa = document.querySelector("#foto-previa");
const icone = document.querySelector(".cadastro-produto__foto-icone");
const erro = document.querySelector("#cadastro-produto-erro");
let urlFoto;

function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
}

foto.addEventListener("change", () => {
    if (urlFoto) {
        URL.revokeObjectURL(urlFoto);
        urlFoto = undefined;
    }
    previa.removeAttribute("src");
    previa.hidden = true;
    icone.hidden = false;
    mostrarErro("");

    const arquivo = foto.files[0];
    if (!arquivo) {
        return;
    }
    if (!["image/jpeg", "image/png"].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
        foto.value = "";
        mostrarErro("Escolha uma foto JPG ou PNG de até 5 MB.");
        return;
    }
    urlFoto = URL.createObjectURL(arquivo);
    previa.src = urlFoto;
    previa.hidden = false;
    icone.hidden = true;
});

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const produto = lerProduto(formulario);
    if (!produto) {
        return;
    }

    const produtos = carregarCatalogo();
    produtos.push({
        ...produto,
        descricao: formulario.elements.descricao.value.trim(),
        ativo: true,
        ilustracao: "🌱",
    });
    try {
        salvarCatalogo(produtos);
    } catch {
        mostrarErro("Não foi possível salvar o produto nesta aba. Verifique o armazenamento do navegador.");
        return;
    }
    window.location.assign("./meus-produtos.html");
});
