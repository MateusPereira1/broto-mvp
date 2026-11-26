const vendasSemana = [
    { dia: "Qui", valor: 420 },
    { dia: "Sex", valor: 520 },
    { dia: "Sáb", valor: 560 },
    { dia: "Dom", valor: 500 },
    { dia: "Seg", valor: 610 },
    { dia: "Ter", valor: 580 },
    { dia: "Qua", valor: 690 },
];

const grafico = document.querySelector("#grafico-vendas");
const legenda = document.querySelector("#grafico-legenda");

if (grafico && legenda) {
    const largura = 700;
    const altura = 240;
    const margemX = 24;
    const topo = 20;
    const base = 190;
    const valores = vendasSemana.map((item) => item.valor);
    const minimo = Math.min(...valores) - 80;
    const maximo = Math.max(...valores) + 40;
    const passoX = (largura - margemX * 2) / (vendasSemana.length - 1);

    const pontos = vendasSemana.map((item, indice) => {
        const x = margemX + passoX * indice;
        const proporcao = (item.valor - minimo) / (maximo - minimo);
        const y = base - proporcao * (base - topo);
        return { ...item, x, y };
    });

    const linha = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");
    const area = `${pontos[0].x},${base} ${linha} ${pontos[pontos.length - 1].x},${base}`;
    const grades = [0, 1, 2, 3].map((indice) => {
        const y = topo + ((base - topo) / 3) * indice;
        return `<line class="grafico-vendas__grade" x1="${margemX}" y1="${y}" x2="${largura - margemX}" y2="${y}"></line>`;
    }).join("");

    grafico.innerHTML = `
        <svg viewBox="0 0 ${largura} ${altura}" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="vendas-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0ACF83" stop-opacity="0.25"></stop>
                    <stop offset="100%" stop-color="#0ACF83" stop-opacity="0.02"></stop>
                </linearGradient>
            </defs>
            ${grades}
            <polygon class="grafico-vendas__area" points="${area}"></polygon>
            <polyline class="grafico-vendas__linha" points="${linha}"></polyline>
            ${pontos.map((ponto) => `<circle class="grafico-vendas__ponto" cx="${ponto.x}" cy="${ponto.y}" r="5"><title>${ponto.dia}: R$ ${ponto.valor},00</title></circle>`).join("")}
        </svg>
    `;

    legenda.innerHTML = vendasSemana.map((item) => `<li>${item.dia}</li>`).join("");
}
