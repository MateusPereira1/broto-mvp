const conversas = [
    {
        nome: "Vendedor local",
        horario: "14:48",
        online: true,
        mensagens: [
            { texto: "Olá! O produto está disponível.\nPosso ajudar com alguma dúvida?" },
            { texto: "Olá! Gostaria de saber mais sobre o produto.\nVocê faz entrega na minha região?", enviada: true },
        ],
    },
    {
        nome: "Suporte MadugaTech",
        horario: "11:20",
        online: true,
        mensagens: [{ texto: "Como podemos ajudar?" }],
    },
    {
        nome: "Produtor da região",
        horario: "Ontem",
        online: false,
        mensagens: [{ texto: "Tenho novidades para você!" }],
    },
];

const busca = document.querySelector("#busca-conversa");
const contatos = document.querySelector("#chat-contatos");
const semResultados = document.querySelector("#chat-sem-resultados");
const nome = document.querySelector("#chat-nome");
const statusContato = document.querySelector("#chat-status");
const mensagens = document.querySelector("#chat-mensagens");
const formulario = document.querySelector("#chat-formulario");
const campoMensagem = document.querySelector("#chat-mensagem");
let conversaAtual = conversas[0];

function normalizar(texto) {
    return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function renderizarContatos() {
    const termo = normalizar(busca.value.trim());
    contatos.replaceChildren();

    for (const conversa of conversas) {
        const primeiraMensagem = conversa.mensagens[0].texto.split("\n")[0];
        const resumo = conversa.mensagens.at(-1).enviada && conversa.horario === "Agora"
            ? conversa.mensagens.at(-1).texto
            : primeiraMensagem;
        const botao = document.createElement("button");
        const avatar = document.createElement("span");
        const dados = document.createElement("span");
        const titulo = document.createElement("strong");
        const previa = document.createElement("small");
        const horario = document.createElement("small");

        botao.type = "button";
        botao.className = "chat__item";
        botao.hidden = !normalizar(conversa.nome + " " + resumo).includes(termo);
        botao.setAttribute("aria-pressed", conversa === conversaAtual);
        avatar.className = "chat__avatar";
        avatar.setAttribute("aria-hidden", "true");
        titulo.textContent = conversa.nome;
        previa.textContent = resumo;
        horario.textContent = conversa.horario;
        horario.className = "chat__horario";
        dados.append(titulo, previa);
        botao.append(avatar, dados, horario);
        botao.addEventListener("click", () => {
            conversaAtual = conversa;
            for (const contato of contatos.children) {
                contato.setAttribute("aria-pressed", contato === botao);
            }
            renderizarConversa();
        });
        contatos.append(botao);
    }

    semResultados.hidden = Array.from(contatos.children).some((botao) => !botao.hidden);
}

function adicionarMensagem(mensagem) {
    const item = document.createElement("li");
    const remetente = document.createElement("span");
    item.className = mensagem.enviada ? "chat__mensagem chat__mensagem--enviada" : "chat__mensagem";
    remetente.className = "sr-only";
    remetente.textContent = mensagem.enviada ? "Você: " : conversaAtual.nome + ": ";
    item.append(remetente, mensagem.texto);
    mensagens.append(item);
    mensagens.scrollTop = mensagens.scrollHeight;
}

function renderizarConversa() {
    nome.textContent = conversaAtual.nome;
    statusContato.textContent = conversaAtual.online ? "Online" : "Offline";
    statusContato.classList.toggle("chat__online", conversaAtual.online);
    mensagens.replaceChildren();
    conversaAtual.mensagens.forEach(adicionarMensagem);
}

busca.addEventListener("input", renderizarContatos);
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const texto = campoMensagem.value.trim();
    if (!texto) {
        campoMensagem.focus();
        return;
    }

    const mensagem = { texto, enviada: true };
    conversaAtual.mensagens.push(mensagem);
    conversaAtual.horario = "Agora";
    adicionarMensagem(mensagem);
    renderizarContatos();
    formulario.reset();
    campoMensagem.focus();
});

renderizarContatos();
renderizarConversa();
