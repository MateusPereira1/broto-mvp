import { lerProduto } from "../model/catalogoProdutor.js";
import { identificarProdutor } from "../model/produtor.js";
import { criarProdutoComImagens } from "./api.js";

const formulario = document.querySelector("#cadastro-produto");
const camposImagem = [
    { campo: document.querySelector("#foto-produto-1"), previa: document.querySelector("#foto-previa-1") },
    { campo: document.querySelector("#foto-produto-2"), previa: document.querySelector("#foto-previa-2") },
];
const erro = document.querySelector("#cadastro-produto-erro");
const status = document.querySelector("#cadastro-produto-status");
const botaoCadastrar = formulario.querySelector('button[type="submit"]');
const linkProdutos = document.querySelector("#link-produtos");
const linkCancelar = document.querySelector("#link-cancelar");
const tiposImagemPermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);
const tamanhoMaximoImagem = 32 * 1024 * 1024;
const urlsPrevia = new Map();

function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
}

for (const { campo, previa } of camposImagem) {
    campo.addEventListener("change", () => {
        const urlAnterior = urlsPrevia.get(campo);
        if (urlAnterior) {
            URL.revokeObjectURL(urlAnterior);
            urlsPrevia.delete(campo);
        }
        previa.removeAttribute("src");
        previa.hidden = true;
        previa.parentElement.querySelector(".cadastro-produto__foto-icone").hidden = false;
        campo.setCustomValidity("");
        mostrarErro("");

        const arquivo = campo.files[0];
        if (!arquivo) {
            return;
        }
        if (!tiposImagemPermitidos.has(arquivo.type) || arquivo.size > tamanhoMaximoImagem) {
            const mensagem = "Escolha uma imagem JPG, PNG ou WEBP de até 32 MB.";
            campo.setCustomValidity(mensagem);
            mostrarErro(mensagem);
            return;
        }
        const url = URL.createObjectURL(arquivo);
        urlsPrevia.set(campo, url);
        previa.src = url;
        previa.hidden = false;
        previa.parentElement.querySelector(".cadastro-produto__foto-icone").hidden = true;
    });
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (botaoCadastrar.disabled) {
        return;
    }

    const produto = lerProduto(formulario);
    if (!produto) {
        return;
    }

    const { produtor, local } = formulario.elements;
    for (const [campo, mensagem] of [
        [produtor, "Informe o nome do produtor."],
        [local, "Informe a localização do produto."],
    ]) {
        if (!campo.value.trim()) {
            campo.setCustomValidity(mensagem);
            campo.reportValidity();
            campo.setCustomValidity("");
            return;
        }
    }

    const cadastro = {
        ...produto,
        produtor: produtor.value.trim(),
        local: local.value.trim(),
        descricao: formulario.elements.descricao.value.trim(),
        ativo: true,
    };

    mostrarErro("");
    botaoCadastrar.disabled = true;
    camposImagem.forEach(({ campo }) => {
        campo.disabled = true;
    });

    status.textContent = "Enviando imagens e publicando produto…";
    try {
        cadastro.produtorId = identificarProdutor();
        const dados = new FormData(formulario);
        dados.delete("imagem1");
        dados.delete("imagem2");
        camposImagem.forEach(({ campo }) => {
            const arquivo = campo.files[0];
            if (arquivo) {
                dados.append(campo.name, arquivo);
            }
        });
        for (const [nome, valor] of Object.entries(cadastro)) {
            dados.set(nome, String(valor));
        }

        const resposta = await criarProdutoComImagens(dados);
        const imagens = Array.isArray(resposta.imagens) ? resposta.imagens : [];
        let indiceImagem = 0;
        camposImagem.forEach(({ campo, previa }) => {
            if (!campo.files[0]) {
                return;
            }
            const url = imagens[indiceImagem++];
            if (!url) return;
            const urlAnterior = urlsPrevia.get(campo);
            if (urlAnterior) {
                URL.revokeObjectURL(urlAnterior);
                urlsPrevia.delete(campo);
            }
            previa.src = url;
            previa.hidden = false;
            previa.parentElement.querySelector(".cadastro-produto__foto-icone").hidden = true;
        });
        status.textContent = "Produto publicado com sucesso.";
        linkProdutos.hidden = false;
        linkCancelar.hidden = true;
    } catch (falha) {
        status.textContent = "";
        mostrarErro(falha.message || "Não foi possível publicar o produto. Tente novamente.");
        camposImagem.forEach(({ campo }) => {
            campo.disabled = false;
        });
        botaoCadastrar.disabled = false;
    }
});

window.addEventListener("pagehide", () => {
    urlsPrevia.forEach((url) => URL.revokeObjectURL(url));
});
