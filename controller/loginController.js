
const formulario = document.getElementById("form-login");

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const perfil = new FormData(formulario).get("perfil");
    const proximaPagina = perfil === "produtor"
        ? "../view/meus-produtos.html"
        : "../view/marketplace.html";

    window.location.href = new URL(proximaPagina, import.meta.url);
});

