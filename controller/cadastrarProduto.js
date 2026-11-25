import { carregarCatalogo, lerProduto, salvarCatalogo } from "../model/catalogoProdutor.js";
import { COLECAO_PRODUTOS, criarRegistro } from "./api.js";

const formulario = document.querySelector("#cadastro-produto");
const foto = document.querySelector("#foto-produto");
const previa = document.querySelector("#foto-previa");
const icone = document.querySelector(".cadastro-produto__foto-icone");
const erro = document.querySelector("#cadastro-produto-erro");
const status = document.querySelector("#cadastro-produto-status");
const botaoCadastrar = formulario.querySelector('button[type="submit"]');
let urlFoto;

function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
}

async function prepararImagem() {
    await previa.decode();
    const largura = previa.naturalWidth;
    const altura = previa.naturalHeight;
    const escala = Math.min(1, 800 / Math.max(largura, altura));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(largura * escala));
    canvas.height = Math.max(1, Math.round(altura * escala));

    const contexto = canvas.getContext("2d");
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(previa, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
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
    foto.setCustomValidity("");

    const arquivo = foto.files[0];
    if (!arquivo) {
        return;
    }
    if (!["image/jpeg", "image/png"].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
        const mensagem = "Escolha uma foto JPG ou PNG de até 5 MB.";
        foto.setCustomValidity(mensagem);
        mostrarErro(mensagem);
        return;
    }
    urlFoto = URL.createObjectURL(arquivo);
    previa.src = urlFoto;
    previa.hidden = false;
    icone.hidden = true;
});

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (botaoCadastrar.disabled) {
        return;
    }

    const produto = lerProduto(formulario);
    if (!produto) {
        return;
    }

    const campoLocal = formulario.elements.local;
    const local = campoLocal.value.trim();
    if (!local) {
        campoLocal.setCustomValidity("Informe a localização do produto.");
        campoLocal.reportValidity();
        campoLocal.setCustomValidity("");
        return;
    }

    const cadastro = {
        ...produto,
        local,
        descricao: formulario.elements.descricao.value.trim(),
        ativo: true,
    };

    mostrarErro("");
    botaoCadastrar.disabled = true;
    foto.disabled = true;
    if (urlFoto) {
        status.textContent = "Preparando foto…";
        try {
            cadastro.imagem = await prepararImagem();
        } catch {
            status.textContent = "";
            mostrarErro("Não foi possível ler a foto. Escolha outro arquivo.");
            foto.disabled = false;
            botaoCadastrar.disabled = false;
            return;
        }
    }

    status.textContent = "Publicando produto…";
    try {
        await criarRegistro(COLECAO_PRODUTOS, cadastro);
    } catch {
        status.textContent = "";
        mostrarErro("Não foi possível publicar o produto. Tente novamente.");
        foto.disabled = false;
        botaoCadastrar.disabled = false;
        return;
    }

    try {
        const produtos = carregarCatalogo();
        produtos.push({ ...cadastro, ilustracao: "🌱" });
        salvarCatalogo(produtos);
    } catch {
        status.textContent = "Produto publicado. Não foi possível atualizar a lista Meus produtos nesta aba.";
        return;
    }
    window.location.assign("./meus-produtos.html");
});
