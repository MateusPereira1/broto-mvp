const produtores = [
    {
        nome: "Sítio Verde Vale",
        cidade: "Sorocaba - SP",
        tipo: "Fazenda",
        imagem: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
        top: 28,
        left: 36,
    },
    {
        nome: "Horta da Dona Lúcia",
        cidade: "Votorantim - SP",
        tipo: "Loja",
        imagem: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",
        top: 46,
        left: 24,
    },
    {
        nome: "Fazenda Boa Terra",
        cidade: "Araçoiaba da Serra - SP",
        tipo: "Fazenda",
        imagem: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
        top: 38,
        left: 58,
    },
    {
        nome: "Quintal Orgânico",
        cidade: "Salto de Pirapora - SP",
        tipo: "Loja",
        imagem: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
        top: 63,
        left: 44,
    },
    {
        nome: "Recanto das Frutas",
        cidade: "Itu - SP",
        tipo: "Fazenda",
        imagem: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80",
        top: 56,
        left: 72,
    },
];

const marcadores = document.querySelector("#mapa-marcadores");
const instrucao = document.querySelector("#mapa-instrucao");
const card = document.querySelector("#produtor-card");
const imagem = document.querySelector("#produtor-imagem");
const nome = document.querySelector("#produtor-nome");
const cidade = document.querySelector("#produtor-cidade");
const tipo = document.querySelector("#produtor-tipo");
const link = document.querySelector("#produtor-link");

const icone = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
        <circle cx="12" cy="9" r="2.2" fill="#fff"/>
    </svg>
`;

function selecionar(produtor, botao) {
    marcadores.querySelectorAll(".mapa-marcador").forEach((item) => {
        item.setAttribute("aria-pressed", item === botao ? "true" : "false");
    });

    instrucao.hidden = true;
    card.hidden = false;
    imagem.src = produtor.imagem;
    imagem.alt = `${produtor.tipo} ${produtor.nome}`;
    nome.textContent = produtor.nome;
    cidade.textContent = produtor.cidade;
    tipo.textContent = produtor.tipo;
    link.href = `./marketplace.html?produtor=${encodeURIComponent(produtor.nome)}`;
    link.setAttribute("aria-label", `Ver produtos de ${produtor.nome}`);
}

produtores.forEach((produtor, indice) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "mapa-marcador";
    botao.style.top = `${produtor.top}%`;
    botao.style.left = `${produtor.left}%`;
    botao.setAttribute("aria-pressed", "false");
    botao.setAttribute("aria-label", `Ver ${produtor.tipo.toLowerCase()} ${produtor.nome} em ${produtor.cidade}`);
    botao.innerHTML = `${icone}<span class="mapa-marcador__rotulo">${produtor.nome}</span>`;
    botao.addEventListener("click", () => selecionar(produtor, botao));

    marcadores.append(botao);

    if (indice === 0) {
        selecionar(produtor, botao);
    }
});
