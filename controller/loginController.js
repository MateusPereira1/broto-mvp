
import { Usuario } from "../model/Usuario.js";

const formulario = document.getElementById("form-login");

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (nome === "" || tipo === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const usuario = new Usuario(nome, tipo);

    sessionStorage.setItem("usuario", JSON.stringify(usuario));

    alert("Bem-vindo ao Broto, " + usuario.nome + "!");

    // As páginas de destino serão definidas com o grupo.
    console.log("Usuário identificado:", usuario);
});

