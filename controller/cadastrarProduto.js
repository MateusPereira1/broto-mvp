import { converterPreco, lerProduto } from "../model/catalogoProdutor.js";
import { identificarProdutor } from "../model/produtor.js";
import { criarProdutoComImagens, verificarProdutoCadastrado } from "./api.js";

const formulario = document.querySelector("#cadastro-produto");
const camposImagem = [
    { campo: document.querySelector("#foto-produto"), previa: document.querySelector("#foto-previa") },
];
const erro = document.querySelector("#cadastro-produto-erro");
const status = document.querySelector("#cadastro-produto-status");
const botaoCadastrar = formulario.querySelector('button[type="submit"]');
const campoPreco = formulario.elements.preco;
const campoEstoque = formulario.elements.estoque;
const dialogoSucesso = document.querySelector("#cadastro-produto-sucesso");
const tiposImagemPermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);
const tamanhoMaximoImagem = 32 * 1024 * 1024;
const urlsPrevia = new Map();
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numeroMoeda = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
});

function normalizarEntradaDecimal(valor) {
    const texto = valor.replace(/[^\d.,-]/g, "");
    const sinal = texto.startsWith("-") ? "-" : "";
    const numero = texto.replace(/-/g, "");
    const separador = Math.max(numero.lastIndexOf("."), numero.lastIndexOf(","));
    if (separador < 0) {
        return `${sinal}${numero}`;
    }
    const inteiro = numero.slice(0, separador).replace(/[.,]/g, "") || "0";
    const decimal = numero.slice(separador + 1).replace(/[.,]/g, "");
    return `${sinal}${inteiro}.${decimal}`;
}

function sanitizarCampoNumerico(campo) {
    const valorOriginal = campo.value;
    const posicaoCursor = campo.selectionStart ?? valorOriginal.length;
    const valorNormalizado = normalizarEntradaDecimal(valorOriginal);
    if (valorOriginal === valorNormalizado) {
        return;
    }
    const cursorNormalizado = normalizarEntradaDecimal(valorOriginal.slice(0, posicaoCursor)).length;
    campo.value = valorNormalizado;
    campo.setSelectionRange(cursorNormalizado, cursorNormalizado);
}

function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
}

function mensagemFalhaCadastro(falha) {
    if (falha instanceof TypeError) {
        return "Não foi possível confirmar o cadastro. Confira em Meus produtos antes de tentar novamente.";
    }
    return falha.message || "Não foi possível publicar o produto. Tente novamente.";
}

campoPreco.addEventListener("focus", () => {
    const preco = converterPreco(campoPreco.value);
    if (Number.isFinite(preco)) {
        campoPreco.value = numeroMoeda.format(preco);
    }
    campoPreco.setCustomValidity("");
});
campoPreco.addEventListener("input", () => {
    sanitizarCampoNumerico(campoPreco);
    campoPreco.setCustomValidity("");
});
campoPreco.addEventListener("blur", () => {
    if (!campoPreco.value.trim()) {
        return;
    }
    const preco = converterPreco(campoPreco.value);
    if (!Number.isFinite(preco) || preco < 0) {
        campoPreco.setCustomValidity("Informe um preço válido em reais.");
        return;
    }
    campoPreco.value = moeda.format(preco);
    campoPreco.setCustomValidity("");
});

campoEstoque.addEventListener("input", () => {
    sanitizarCampoNumerico(campoEstoque);
    campoEstoque.setCustomValidity("");
});

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

    cadastro.requestId = crypto.randomUUID();
    mostrarErro("");
    botaoCadastrar.disabled = true;
    camposImagem.forEach(({ campo }) => {
        campo.disabled = true;
    });

    status.textContent = "Enviando imagens e publicando produto…";
    try {
        let cadastroConfirmado = false;
        try {
            cadastro.produtorId = identificarProdutor();
            const dados = new FormData(formulario);
            dados.delete("imagem1");
            camposImagem.forEach(({ campo }) => {
                const arquivo = campo.files[0];
                if (arquivo) {
                    dados.append(campo.name, arquivo);
                }
            });
            for (const [nome, valor] of Object.entries(cadastro)) {
                dados.set(nome, String(valor));
            }

            await criarProdutoComImagens(dados);
            cadastroConfirmado = true;
        } catch (falha) {
            if (!(falha instanceof TypeError)) {
                status.textContent = "";
                mostrarErro(mensagemFalhaCadastro(falha));
                return;
            }

            status.textContent = "Confirmando o cadastro…";
            try {
                cadastroConfirmado = await verificarProdutoCadastrado(cadastro.requestId);
            } catch (falhaVerificacao) {
                status.textContent = "";
                mostrarErro(mensagemFalhaCadastro(falhaVerificacao));
                return;
            }
            if (!cadastroConfirmado) {
                status.textContent = "";
                mostrarErro(mensagemFalhaCadastro(falha));
                return;
            }
        }

        if (cadastroConfirmado) {
            formulario.reset();
            camposImagem.forEach(({ campo, previa }) => {
                const urlAnterior = urlsPrevia.get(campo);
                if (urlAnterior) {
                    URL.revokeObjectURL(urlAnterior);
                    urlsPrevia.delete(campo);
                }
                previa.removeAttribute("src");
                previa.hidden = true;
                previa.parentElement.querySelector(".cadastro-produto__foto-icone").hidden = false;
            });
            status.textContent = "";
            dialogoSucesso.showModal();
        }
    } finally {
        camposImagem.forEach(({ campo }) => campo.disabled = false);
        botaoCadastrar.disabled = false;
    }
});

document.querySelector("#cadastro-produto-continuar").addEventListener("click", () => {
    dialogoSucesso.close();
    formulario.elements.nome.focus();
});

window.addEventListener("pagehide", () => {
    urlsPrevia.forEach((url) => URL.revokeObjectURL(url));
});
