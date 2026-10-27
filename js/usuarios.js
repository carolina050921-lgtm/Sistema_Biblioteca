const form = document.getElementById('formUsuario');
    const mensaje = document.getElementById('mensaje');
    const foto = document.getElementById('foto');
    const fotoPrevia = document.getElementById('fotoPrevia');
    const clave = 'bibliotecaUsuarios';
    let fotoSeleccionada = '';

    function obtenerUsuarios() {
        try { return JSON.parse(localStorage.getItem(clave)) || []; }
        catch (error) { return []; }
    }

    function guardarUsuarios(usuarios) { localStorage.setItem(clave, JSON.stringify(usuarios)); }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = 'mensaje ' + tipo;
        mensaje.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function renderizarUsuarios() {
        const usuarios = obtenerUsuarios().slice(-6).reverse();
        document.getElementById('tablaUsuarios').innerHTML = usuarios.length ? usuarios.map(usuario => `
            <tr><td>${usuario.codigo}</td><td>${usuario.nombres} ${usuario.apellidos}</td><td><span class="tipo ${usuario.tipo === 'Docente' ? 'docente' : ''}">${usuario.tipo}</span></td><td>${usuario.programa}</td><td>${usuario.dni}</td><td>${usuario.fechaRegistro}</td><td><span class="estado">Activo</span></td></tr>`).join('') : '<tr><td colspan="7">Aún no hay usuarios registrados.</td></tr>';
    }

    document.querySelectorAll('input[name="tipo"]').forEach(opcion => opcion.addEventListener('change', () => {
        document.querySelector('label[for="programa"]').innerHTML = (opcion.value === 'Docente' ? 'Área laboral' : 'Programa de estudios') + ' <span class="obligatorio">*</span>';
    }));

    foto.addEventListener('change', () => {
        const archivo = foto.files[0];
        if (!archivo) return;
        if (archivo.size > 2 * 1024 * 1024) { foto.value = ''; mostrarMensaje('La foto no puede superar los 2 MB.', 'error'); return; }
        const lector = new FileReader();
        lector.onload = evento => { fotoSeleccionada = evento.target.result; fotoPrevia.innerHTML = `<img src="${fotoSeleccionada}" alt="Foto seleccionada" class="foto-usuario-previa">`; };
        lector.readAsDataURL(archivo);
    });

    form.addEventListener('reset', evento => {
        setTimeout(() => { fotoSeleccionada = ''; foto.value = ''; fotoPrevia.textContent = '👤'; if (evento.isTrusted) mensaje.className = 'mensaje'; }, 0);
    });

    form.addEventListener('submit', async evento => {
        evento.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const usuarios = obtenerUsuarios();
        const dni = document.getElementById('dni').value.trim();
        const codigo = document.getElementById('codigo').value.trim();
        if (usuarios.some(usuario => usuario.dni === dni)) { mostrarMensaje('Ya existe un usuario registrado con ese DNI.', 'error'); return; }
        if (usuarios.some(usuario => usuario.codigo.toLowerCase() === codigo.toLowerCase())) { mostrarMensaje('Ya existe un usuario registrado con ese código.', 'error'); return; }
        const usuario = {
            tipo: document.querySelector('input[name="tipo"]:checked').value,
            nombres: document.getElementById('nombres').value.trim(), apellidos: document.getElementById('apellidos').value.trim(), dni, codigo,
            correo: document.getElementById('correo').value.trim(), telefono: document.getElementById('telefono').value.trim(), nacimiento: document.getElementById('nacimiento').value,
            genero: document.getElementById('genero').value, programa: document.getElementById('programa').value, ciclo: document.getElementById('ciclo').value,
            direccion: document.getElementById('direccion').value.trim(), foto: fotoSeleccionada, estado: 'Activo', fechaRegistro: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
        };
        try { await BibliotecaAPI.guardar('usuarios', usuario); usuarios.push(usuario); guardarUsuarios(usuarios); renderizarUsuarios(); form.reset(); mostrarMensaje('Usuario registrado correctamente.', 'exito'); }
        catch (error) { mostrarMensaje(error.message + ' Verifique que Apache y MySQL estén activos.', 'error'); }
    });

    renderizarUsuarios();
