document.addEventListener("DOMContentLoaded", function () {
    const tipoReporte = document.getElementById("tipoReporte");
    const fechaDesde = document.getElementById("fechaDesde");
    const fechaHasta = document.getElementById("fechaHasta");
    const tipoUsuario = document.getElementById("tipoUsuario");
    let filasActuales = [], columnasActuales = [];

    function leer(clave) { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } }
    function escapar(valor) { return String(valor ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
    function tipoExterno(tipo) { return tipo === "visitante" ? "Visitante autorizado" : "Personal administrativo"; }
    function prestamos() {
        const normales = leer("bibliotecaPrestamos").map(item => ({...item, documento:item.documento||"", nombre:item.usuario, titulo:item.libro, codigoLibro:item.codigoLibro||""}));
        const externos = leer("bibliotecaPrestamosExternos").map((item,i) => ({...item,codigo:"PE-"+String(i+1).padStart(3,"0"),documento:item.documento,nombre:item.nombres+" "+item.apellidos,tipo:tipoExterno(item.tipo),titulo:item.tituloLibro,codigoLibro:item.codigoLibro||""}));
        return normales.concat(externos).map(item => ({...item,estado:item.estado==="Activo"&&item.fechaDevolucion&&new Date(item.fechaDevolucion+"T23:59:59")<new Date()?"Vencido":item.estado||"Activo"}));
    }
    function aplicarFiltros(datos) { return datos.filter(item => (!fechaDesde.value || item.fechaPrestamo >= fechaDesde.value) && (!fechaHasta.value || item.fechaPrestamo <= fechaHasta.value) && (!tipoUsuario.value || item.tipo === tipoUsuario.value)); }
    function estadoHtml(valor) { const clase = valor === "Vencido" ? "vencido" : valor === "Devuelto" ? "devuelto" : "activo"; return `<span class="estado ${clase}">${escapar(valor)}</span>`; }
    function formatoFecha(valor) { if (!valor) return "-"; const partes=valor.split("-"); return partes.length===3?`${partes[2]}/${partes[1]}/${partes[0]}`:valor; }

    const configuraciones = {
        prestamos: { titulo:"Reporte de préstamos realizados", columnas:[["Código","codigo"],["Documento","documento"],["Usuario","nombre"],["Tipo","tipo"],["Libro","titulo"],["Fecha préstamo","fechaPrestamo"],["Fecha devolución","fechaDevolucion"],["Estado","estado"]], datos:()=>aplicarFiltros(prestamos()) },
        pendientes: { titulo:"Reporte de préstamos pendientes y vencidos", columnas:[["Código","codigo"],["Documento","documento"],["Usuario","nombre"],["Tipo","tipo"],["Libro","titulo"],["Fecha límite","fechaDevolucion"],["Estado","estado"]], datos:()=>aplicarFiltros(prestamos()).filter(i=>i.estado!=="Devuelto") },
        usuarios: { titulo:"Usuarios con libros pendientes de devolución", columnas:[["Documento","documento"],["Usuario","nombre"],["Tipo","tipo"],["Libros pendientes","cantidad"],["Préstamos vencidos","vencidos"]], datos:()=>{const mapa={}; aplicarFiltros(prestamos()).filter(i=>i.estado!=="Devuelto").forEach(i=>{const k=i.documento||i.nombre.toLowerCase(); if(!mapa[k])mapa[k]={documento:i.documento,nombre:i.nombre,tipo:i.tipo,cantidad:0,vencidos:0}; mapa[k].cantidad++; if(i.estado==="Vencido")mapa[k].vencidos++;}); return Object.values(mapa);} },
        solicitados: { titulo:"Libros más solicitados", columnas:[["Posición","posicion"],["Libro","titulo"],["Código","codigoLibro"],["Cantidad de préstamos","cantidad"]], datos:()=>{const mapa={}; aplicarFiltros(prestamos()).forEach(i=>{const k=(i.codigoLibro||i.titulo).toLowerCase(); if(!mapa[k])mapa[k]={titulo:i.titulo,codigoLibro:i.codigoLibro||"-",cantidad:0}; mapa[k].cantidad++;}); return Object.values(mapa).sort((a,b)=>b.cantidad-a.cantidad).map((i,n)=>({...i,posicion:n+1}));} },
        inventario: { titulo:"Inventario general de libros", columnas:[["Código","codigo"],["Título","titulo"],["Autor","autor"],["Categoría","categoria"],["Ejemplares","ejemplares"],["Disponibilidad","disponibilidad"],["Adquisición","adquisicion"]], datos:()=>{const libros=leer("bibliotecaLibros"); if(libros.length)return libros; const mapa={}; prestamos().forEach(i=>{const k=(i.codigoLibro||i.titulo).toLowerCase(); if(!mapa[k])mapa[k]={codigo:i.codigoLibro||"-",titulo:i.titulo,autor:"-",categoria:"-",ejemplares:"Sin registrar",disponibilidad:"Según préstamos",adquisicion:"-"};}); return Object.values(mapa);} },
        devoluciones: { titulo:"Reporte de devoluciones realizadas", columnas:[["Código","codigo"],["Usuario","nombre"],["Tipo","tipo"],["Libro","titulo"],["Fecha devolución","fechaDevolucionReal"],["Estado físico","estadoFisico"],["Cumplimiento","cumplimiento"],["Observaciones","observacionesDevolucion"]], datos:()=>aplicarFiltros(prestamos()).filter(i=>i.estado==="Devuelto") }
    };

    function generar() {
        const todos=prestamos(); document.getElementById("totalPrestamos").textContent=todos.length; document.getElementById("totalActivos").textContent=todos.filter(i=>i.estado==="Activo").length; document.getElementById("totalVencidos").textContent=todos.filter(i=>i.estado==="Vencido").length; document.getElementById("totalDevueltos").textContent=todos.filter(i=>i.estado==="Devuelto").length;
        const config=configuraciones[tipoReporte.value]; filasActuales=config.datos(); columnasActuales=config.columnas; document.getElementById("tituloReporte").textContent=config.titulo; document.getElementById("fechaGeneracion").textContent=new Date().toLocaleString("es-PE");
        const periodo=fechaDesde.value||fechaHasta.value?`Periodo: ${fechaDesde.value?formatoFecha(fechaDesde.value):"inicio"} al ${fechaHasta.value?formatoFecha(fechaHasta.value):"actual"}`:"Todos los registros disponibles"; document.getElementById("periodoReporte").textContent=periodo+(tipoUsuario.value?` · ${tipoUsuario.value}`:"");
        document.getElementById("cabeceraTabla").innerHTML="<tr>"+columnasActuales.map(c=>`<th>${escapar(c[0])}</th>`).join("")+"</tr>";
        document.getElementById("cuerpoTabla").innerHTML=filasActuales.length?filasActuales.map(f=>"<tr>"+columnasActuales.map(c=>`<td>${c[1]==="estado"?estadoHtml(f[c[1]]):c[1].toLowerCase().includes("fecha")?escapar(formatoFecha(f[c[1]])):escapar(f[c[1]]||"-")}</td>`).join("")+"</tr>").join(""):`<tr><td class="vacio" colspan="${columnasActuales.length}">No existen datos para este reporte.</td></tr>`;
        document.getElementById("cantidadResultados").textContent=`${filasActuales.length} ${filasActuales.length===1?"registro":"registros"}`;
        const nota=document.getElementById("notaReporte"); nota.style.display=tipoReporte.value==="inventario"&&!leer("bibliotecaLibros").length?"block":"none"; nota.textContent="El inventario muestra los libros identificados en los préstamos porque aún no existen libros registrados en el módulo de inventario.";
    }

    document.getElementById("btnGenerar").addEventListener("click",generar); document.getElementById("btnPdf").addEventListener("click",()=>window.print()); generar();
});


