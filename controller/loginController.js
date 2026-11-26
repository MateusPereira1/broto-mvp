
const formulario = document.getElementById("form-login");

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    window.location.href = new URL("../view/marketplace.html", import.meta.url);
});

