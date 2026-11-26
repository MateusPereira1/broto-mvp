const formularioRegistro = document.getElementById("form-registro");
const formularioEndereco = document.getElementById("form-endereco");
const botaoLocal = document.getElementById("compartilhar-local");
const mensagemLocal = document.getElementById("mensagem-local");
const campoFoto = document.getElementById("foto-residencia");
const nomeFoto = document.getElementById("nome-foto");
const botaoFinalizar = document.getElementById("finalizar-localizacao");
const paginaProdutor = new URL("../view/meus-produtos.html", import.meta.url);

formularioRegistro?.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const tipo = new FormData(formularioRegistro).get("tipo");
    const proximaPagina = tipo === "vendedor"
        ? "../view/cadastro-localizacao.html"
        : "../view/marketplace.html";

    window.location.href = new URL(proximaPagina, import.meta.url);
});

formularioEndereco?.addEventListener("submit", function (evento) {
    evento.preventDefault();
    window.location.href = paginaProdutor;
});

botaoLocal?.addEventListener("click", function () {
    if (!navigator.geolocation) {
        mensagemLocal.textContent = "Localização indisponível. Você pode preencher o endereço manualmente.";
        return;
    }

    mensagemLocal.textContent = "Aguardando permissão para acessar sua localização...";
    navigator.geolocation.getCurrentPosition(
        function () {
            mensagemLocal.textContent = "Localização identificada. O envio para a API será adicionado futuramente.";
        },
        function () {
            mensagemLocal.textContent = "Não foi possível acessar a localização. Você pode preencher manualmente.";
        }
    );
});

campoFoto?.addEventListener("change", function () {
    nomeFoto.textContent = campoFoto.files?.[0]?.name || "Adicionar foto";
});

botaoFinalizar?.addEventListener("click", function () {
    window.location.href = paginaProdutor;
});
