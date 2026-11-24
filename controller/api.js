const BASE_URL = "https://psel-api.vercel.app";
const SQUAD = "MadrugaTech";

function montarUrl(colecao, id) {
  let url = BASE_URL + "/api/" + SQUAD + "/" + colecao;
  if (id) {
    url = url + "/" + id;
  }

  return url;
}

export async function listarRegistro(colecao) {
  try {
    const resposta = await fetch(montarUrl(colecao));

    if (!resposta.ok) {
      throw new Error("Falha em listar os registros: " + resposta.status);
    }

    const dados = await resposta.json;
    return dados
  } catch(erro) {
    console.error("Erro ao listar " + colecao + ":", erro);
    throw erro;
  }
}

export async function criarRegistro(colecao, dados) {
  try {
    const opcoes = {
      method: "Post",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(dados)
    };

    const resposta = await fetch(montarUrl(colecao), opcoes);

    if(!resposta.ok) {
      throw new Error("Falha na criação do registro: " + resposta.status);
    }

    const criada = await resposta.json;
    return criada;
  } catch(erro) {
    console.error("Erro ao criar em " + colecao + ":", erro);
    throw erro;
  }
}