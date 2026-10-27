document.addEventListener("DOMContentLoaded", function () {
    const tipo = document.body.dataset.tipo;
    const cuerpo = document.getElementById("cuerpoLista");
    const buscar = document.getElementById("buscarLista");
    const contador = document.getElementById("contadorLista");

    function obtenerUsuarios() {
        try { return JSON.parse(localStorage.getItem("bibliotecaUsuarios")) || []; }
        catch (error) { return []; }
    }

    function escapar(valor) {
        return String(valor || "").replace(/[&<>'"]/g, caracter => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
        })[caracter]);
    }

    function mostrarUsuarios() {
        const texto = buscar.value.trim().toLowerCase();
        const usuarios = obtenerUsuarios().filter(usuario =>
            usuario.tipo === tipo &&
            [usuario.nombres, usuario.apellidos, usuario.dni, usuario.codigo, usuario.programa]
                .some(valor => String(valor || "").toLowerCase().includes(texto))
        );

        contador.textContent = usuarios.length + (usuarios.length === 1 ? " registro" : " registros");

        cuerpo.innerHTML = usuarios.length ? usuarios.map(usuario => `
            <tr>
                <td>${escapar(usuario.codigo)}</td>
                <td>${escapar(usuario.nombres)} ${escapar(usuario.apellidos)}</td>
                <td>${escapar(usuario.dni)}</td>
                <td>${escapar(usuario.correo)}</td>
                <td>${escapar(usuario.telefono) || "-"}</td>
                <td>${escapar(usuario.programa)}</td>
                <td><span class="tipo ${tipo === "Docente" ? "docente" : ""}">${tipo}</span></td>
                <td><span class="estado">${escapar(usuario.estado || "Activo")}</span></td>
            </tr>`).join("") : `
            <tr><td colspan="8"><div class="vacio"><span>👥</span>No hay ${tipo.toLowerCase()}s registrados.</div></td></tr>`;
    }

    buscar.addEventListener("input", mostrarUsuarios);
    window.addEventListener("storage", mostrarUsuarios);
    mostrarUsuarios();
});
