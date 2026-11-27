import { URL_BACKEND_UPLOAD } from "./config.js";

const BASE_URL = "https://psel-api.vercel.app";
const SQUAD = "MadrugaTech";
export const COLECAO_PRODUTOS = "produtos";
export const COLECAO_PEDIDOS = "pedidos";

function montarUrl(colecao, id) {
  let url = BASE_URL + "/api/" + SQUAD + "/" + colecao;
  if (id) {
    url = url + "/" + encodeURIComponent(id);
  }

  return url;
}

export async function alterarProduto(id, dados) {
  const resposta = await fetch(montarUrl(COLECAO_PRODUTOS, id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    throw new Error("Falha ao alterar o produto: " + resposta.status);
  }
}

export async function excluirProduto(id) {
  const resposta = await fetch(montarUrl(COLECAO_PRODUTOS, id), { method: "DELETE" });
  if (!resposta.ok) {
    throw new Error("Falha ao excluir o produto: " + resposta.status);
  }
}

export async function listarRegistro(colecao) {
  try {
    const resposta = await fetch(montarUrl(colecao), { cache: "no-store" });

    if (!resposta.ok) {
      throw new Error("Falha em listar os registros: " + resposta.status);
    }

    const dados = await resposta.json();
    return dados
  } catch(erro) {
    console.error("Erro ao listar " + colecao + ":", erro);
    throw erro;
  }
}

export async function criarRegistro(colecao, dados) {
  try {
    const opcoes = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(dados)
    };

    const resposta = await fetch(montarUrl(colecao), opcoes);

    if(!resposta.ok) {
      throw new Error("Falha na criação do registro: " + resposta.status);
    }

    const criada = await resposta.json();
    return criada;
  } catch(erro) {
    console.error("Erro ao criar em " + colecao + ":", erro);
    throw erro;
  }
}

export async function criarProdutoComImagens(formData) {
  const endpoint = URL_BACKEND_UPLOAD
    ? new URL("/api/produtos", URL_BACKEND_UPLOAD).href
    : "/api/produtos";
  const resposta = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(resultado.error || "Falha na criação do produto: " + resposta.status);
  }
  return resultado;
}

export async function verificarProdutoCadastrado(requestId) {
  let ultimaFalha;
  for (let tentativa = 0; tentativa < 4; tentativa += 1) {
    try {
      const resposta = await listarRegistro(COLECAO_PRODUTOS);
      ultimaFalha = undefined;
      const produtos = Array.isArray(resposta) ? resposta : resposta?.dados;
      if (!Array.isArray(produtos)) {
        throw new Error("A API retornou uma lista de produtos inválida.");
      }
      if (produtos.some((produto) => produto.requestId === requestId)) {
        return true;
      }
    } catch (falha) {
      if (!(falha instanceof TypeError)) {
        throw falha;
      }
      ultimaFalha = falha;
    }

    if (tentativa < 3) {
      await new Promise((resolver) => setTimeout(resolver, 750));
    }
  }
  if (ultimaFalha) {
    throw ultimaFalha;
  }
  return false;
}
