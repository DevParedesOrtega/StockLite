const productosIniciales = [
  { id: 1, codigo: "PRD-001", nombre: "Teclado USB", categoria: "Accesorios", unidad: "pieza", existencia: 12, minimo: 5, maximo: 30, costoPromedio: 150, activo: true },
  { id: 2, codigo: "PRD-002", nombre: "Mouse inalámbrico", categoria: "Accesorios", unidad: "pieza", existencia: 4, minimo: 5, maximo: 25, costoPromedio: 95, activo: true },
  { id: 3, codigo: "PRD-003", nombre: "Cable HDMI", categoria: "Cables", unidad: "pieza", existencia: 0, minimo: 4, maximo: 20, costoPromedio: 0, activo: true },
  { id: 4, codigo: "PRD-004", nombre: "Memoria USB 64 GB", categoria: "Almacenamiento", unidad: "pieza", existencia: 27, minimo: 5, maximo: 30, costoPromedio: 110, activo: true },
  { id: 5, codigo: "PRD-005", nombre: "Adaptador USB-C", categoria: "Accesorios", unidad: "pieza", existencia: 34, minimo: 5, maximo: 30, costoPromedio: 75, activo: true }
];

const claveProductos = "stocklite_productos_v1";
const claveMovimientos = "stocklite_movimientos_v1";

const formularioProducto = document.getElementById("formulario-producto");
const tablaProductos = document.getElementById("tabla-productos");
const mensajeProducto = document.getElementById("mensaje-producto");
const estadoAlmacenamiento = document.getElementById("estado-almacenamiento");
const filtroProductos = document.getElementById("filtro-productos");
const tituloFormulario = document.getElementById("titulo-formulario-producto");
const textoFormulario = document.getElementById("texto-formulario-producto");
const botonGuardar = document.getElementById("boton-guardar-producto");
const botonCancelar = document.getElementById("cancelar-edicion");
const camposExistenciaInicial = document.getElementById("campos-existencia-inicial");

const totalProductos = document.getElementById("total-productos");
const totalUnidades = document.getElementById("total-unidades");
const productosReponer = document.getElementById("productos-reponer");
const productosExcedidos = document.getElementById("productos-excedidos");

const formularioMovimiento = document.getElementById("formulario-movimiento");
const selectorProductoMovimiento = document.getElementById("producto-movimiento");
const fechaMovimiento = document.getElementById("fecha-movimiento");
const tipoMovimiento = document.getElementById("tipo-movimiento");
const motivoMovimiento = document.getElementById("motivo");
const cantidadMovimiento = document.getElementById("cantidad");
const campoCostoEntrada = document.getElementById("campo-costo-entrada");
const costoCompra = document.getElementById("costo-compra");
const campoPrecioVenta = document.getElementById("campo-precio-venta");
const precioVenta = document.getElementById("precio-venta");
const informacionCostoSalida = document.getElementById("informacion-costo-salida");
const mensajeMovimiento = document.getElementById("mensaje-movimiento");

const filtroKardex = document.getElementById("filtro-kardex");
const tablaKardex = document.getElementById("tabla-kardex");
const productoSeleccionadoKardex = document.getElementById("producto-seleccionado");
const saldoKardex = document.getElementById("saldo-kardex");
const costoPromedioKardex = document.getElementById("costo-promedio-kardex");
const valorInventarioKardex = document.getElementById("valor-inventario-kardex");

const reporteDesde = document.getElementById("reporte-desde");
const reporteHasta = document.getElementById("reporte-hasta");
const reporteTipo = document.getElementById("reporte-tipo");
const reporteMotivo = document.getElementById("reporte-motivo");
const reporteProducto = document.getElementById("reporte-producto");
const botonLimpiarReporte = document.getElementById("limpiar-filtros-reporte");
const botonExportarReporte = document.getElementById("exportar-reporte");
const mensajeReporte = document.getElementById("mensaje-reporte");
const cantidadResultadosReporte = document.getElementById("cantidad-resultados-reporte");
const tablaAlertasReporte = document.getElementById("tabla-alertas-reporte");
const tablaMovimientosReporte = document.getElementById("tabla-movimientos-reporte");
const valorInventarioReporte = document.getElementById("reporte-valor-inventario");
const productosActivosReporte = document.getElementById("reporte-productos-activos");
const stockBajoReporte = document.getElementById("reporte-stock-bajo");
const agotadosReporte = document.getElementById("reporte-agotados");
const comprasReporte = document.getElementById("reporte-compras");
const cantidadComprasReporte = document.getElementById("reporte-cantidad-compras");
const costoSalidasReporte = document.getElementById("reporte-costo-salidas");
const cantidadSalidasReporte = document.getElementById("reporte-cantidad-salidas");
const ventasReporte = document.getElementById("reporte-ventas");
const utilidadReporte = document.getElementById("reporte-utilidad");

let productoEditandoId = null;
let necesitaGuardarMigracion = false;
let productos = cargarProductos();
let movimientos = cargarMovimientos();

function obtenerFechaLocal() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

function redondear(numero, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round((numero + Number.EPSILON) * factor) / factor;
}

function formatearCantidad(cantidad) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(cantidad);
}

function formatearMoneda(cantidad) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cantidad);
}

function formatearFecha(fechaTexto) {
  if (!fechaTexto) {
    return "—";
  }

  const partes = fechaTexto.split("-");
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return fecha.toLocaleDateString("es-MX");
}

function cargarProductos() {
  try {
    const datosGuardados = localStorage.getItem(claveProductos);

    if (datosGuardados === null) {
      estadoAlmacenamiento.textContent = "Datos de ejemplo";
      return productosIniciales.map(function (producto) {
        return { ...producto };
      });
    }

    const productosGuardados = JSON.parse(datosGuardados);
    if (!Array.isArray(productosGuardados)) {
      throw new Error("Los productos guardados no tienen el formato esperado.");
    }

    estadoAlmacenamiento.textContent = "Guardado en este navegador";
    return productosGuardados.map(function (producto) {
      if (typeof producto.activo !== "boolean") {
        necesitaGuardarMigracion = true;
      }

      return {
        ...producto,
        activo: producto.activo !== false,
        existencia: Number(producto.existencia) || 0,
        costoPromedio: Number(producto.costoPromedio) || 0
      };
    });
  } catch (error) {
    console.error("No se pudieron cargar los productos:", error);
    estadoAlmacenamiento.textContent = "Almacenamiento no disponible";
    return productosIniciales.map(function (producto) {
      return { ...producto };
    });
  }
}

function cargarMovimientos() {
  try {
    const datosGuardados = localStorage.getItem(claveMovimientos);

    if (datosGuardados !== null) {
      const movimientosGuardados = JSON.parse(datosGuardados);
      if (!Array.isArray(movimientosGuardados)) {
        throw new Error("Los movimientos guardados no tienen el formato esperado.");
      }
      return movimientosGuardados;
    }

    const saldosIniciales = [];
    productos.forEach(function (producto) {
      if (producto.existencia > 0) {
        saldosIniciales.push(crearSaldoInicial(producto, saldosIniciales.length + 1));
      }
    });

    localStorage.setItem(claveMovimientos, JSON.stringify(saldosIniciales));
    return saldosIniciales;
  } catch (error) {
    console.error("No se pudieron cargar los movimientos:", error);
    estadoAlmacenamiento.textContent = "Almacenamiento no disponible";
    return [];
  }
}

function siguienteIdProducto() {
  if (productos.length === 0) {
    return 1;
  }

  return Math.max(...productos.map(function (producto) { return producto.id; })) + 1;
}

function siguienteIdMovimiento() {
  if (movimientos.length === 0) {
    return 1;
  }

  return Math.max(...movimientos.map(function (movimiento) { return movimiento.id; })) + 1;
}

function crearMovimiento(producto, datos, idForzado) {
  const cantidad = redondear(datos.cantidad, 2);
  const costoUnitario = redondear(datos.costoUnitario, 6);

  return {
    id: idForzado || siguienteIdMovimiento(),
    productoId: producto.id,
    codigoProducto: producto.codigo,
    nombreProducto: producto.nombre,
    fecha: datos.fecha,
    tipo: datos.tipo,
    motivo: datos.motivo,
    cantidad: cantidad,
    costoUnitario: costoUnitario,
    importeCosto: redondear(cantidad * costoUnitario, 2),
    precioVenta: datos.precioVenta === null ? null : redondear(datos.precioVenta, 2),
    saldo: redondear(datos.saldo, 2),
    costoPromedio: redondear(datos.costoPromedio, 6),
    nota: datos.nota || ""
  };
}

function crearSaldoInicial(producto, idForzado, nota) {
  return crearMovimiento(producto, {
    fecha: obtenerFechaLocal(),
    tipo: "entrada",
    motivo: "saldo-inicial",
    cantidad: producto.existencia,
    costoUnitario: producto.costoPromedio,
    precioVenta: null,
    saldo: producto.existencia,
    costoPromedio: producto.costoPromedio,
    nota: nota || "Saldo existente al comenzar el registro de movimientos."
  }, idForzado);
}

function guardarInventario() {
  let productosAnteriores;
  let movimientosAnteriores;

  try {
    productosAnteriores = localStorage.getItem(claveProductos);
    movimientosAnteriores = localStorage.getItem(claveMovimientos);
    localStorage.setItem(claveProductos, JSON.stringify(productos));
    localStorage.setItem(claveMovimientos, JSON.stringify(movimientos));
    estadoAlmacenamiento.textContent = "Guardado en este navegador";
    return true;
  } catch (error) {
    console.error("No se pudo guardar el inventario:", error);

    try {
      if (productosAnteriores === null) {
        localStorage.removeItem(claveProductos);
      } else if (productosAnteriores !== undefined) {
        localStorage.setItem(claveProductos, productosAnteriores);
      }
      if (movimientosAnteriores === null) {
        localStorage.removeItem(claveMovimientos);
      } else if (movimientosAnteriores !== undefined) {
        localStorage.setItem(claveMovimientos, movimientosAnteriores);
      }
    } catch (errorRestauracion) {
      console.error("No fue posible restaurar el almacenamiento anterior:", errorRestauracion);
    }

    estadoAlmacenamiento.textContent = "No se pudo guardar";
    return false;
  }
}

function obtenerEstado(producto) {
  if (producto.existencia === 0) return { texto: "Agotado", clase: "estado-agotado" };
  if (producto.existencia <= producto.minimo) return { texto: "Stock bajo", clase: "estado-bajo" };
  if (producto.existencia > producto.maximo) return { texto: "Sobre máximo", clase: "estado-exceso" };
  return { texto: "Normal", clase: "estado-normal" };
}

function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

function crearBotonAccion(texto, accion, productoId, clase) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-tabla " + clase;
  boton.textContent = texto;
  boton.dataset.accion = accion;
  boton.dataset.id = productoId;
  return boton;
}

function mostrarProductos() {
  tablaProductos.replaceChildren();
  const filtro = filtroProductos.value;
  const productosVisibles = productos.filter(function (producto) {
    if (filtro === "activos") return producto.activo !== false;
    if (filtro === "inactivos") return producto.activo === false;
    return true;
  });

  if (productosVisibles.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay productos en esta vista.");
    celda.colSpan = 9;
    celda.className = "tabla-vacia";
    fila.appendChild(celda);
    tablaProductos.appendChild(fila);
  }

  productosVisibles.forEach(function (producto) {
    const fila = document.createElement("tr");
    const estado = obtenerEstado(producto);
    const etiquetaEstado = document.createElement("span");
    const etiquetaDisponibilidad = document.createElement("span");
    const celdaEstado = document.createElement("td");
    const celdaDisponibilidad = document.createElement("td");
    const celdaAcciones = document.createElement("td");
    const grupoAcciones = document.createElement("div");

    if (producto.activo === false) fila.classList.add("fila-inactiva");

    etiquetaEstado.className = "estado " + estado.clase;
    etiquetaEstado.textContent = estado.texto;
    etiquetaDisponibilidad.className = producto.activo === false
      ? "estado-disponibilidad disponibilidad-inactiva"
      : "estado-disponibilidad disponibilidad-activa";
    etiquetaDisponibilidad.textContent = producto.activo === false ? "Inactivo" : "Activo";

    fila.appendChild(crearCelda(producto.codigo));
    fila.appendChild(crearCelda(producto.nombre));
    fila.appendChild(crearCelda(producto.categoria));
    fila.appendChild(crearCelda(formatearCantidad(producto.existencia) + " " + producto.unidad + (producto.existencia === 1 ? "" : "s")));
    fila.appendChild(crearCelda(formatearCantidad(producto.minimo)));
    fila.appendChild(crearCelda(formatearCantidad(producto.maximo)));
    celdaEstado.appendChild(etiquetaEstado);
    celdaDisponibilidad.appendChild(etiquetaDisponibilidad);
    fila.appendChild(celdaEstado);
    fila.appendChild(celdaDisponibilidad);

    grupoAcciones.className = "grupo-acciones-tabla";
    grupoAcciones.appendChild(crearBotonAccion("Editar", "editar", producto.id, "boton-editar"));
    if (producto.activo === false) {
      grupoAcciones.appendChild(crearBotonAccion("Reactivar", "reactivar", producto.id, "boton-reactivar"));
    } else {
      grupoAcciones.appendChild(crearBotonAccion("Desactivar", "desactivar", producto.id, "boton-desactivar"));
    }
    celdaAcciones.appendChild(grupoAcciones);
    fila.appendChild(celdaAcciones);
    tablaProductos.appendChild(fila);
  });

  actualizarResumen();
  actualizarSelectoresProductos();
}

function actualizarResumen() {
  const activos = productos.filter(function (producto) { return producto.activo !== false; });
  let unidades = 0;
  let porReponer = 0;
  let excedidos = 0;

  activos.forEach(function (producto) {
    unidades += producto.existencia;
    if (producto.existencia <= producto.minimo) porReponer += 1;
    if (producto.existencia > producto.maximo) excedidos += 1;
  });

  totalProductos.textContent = activos.length;
  totalUnidades.textContent = formatearCantidad(unidades);
  productosReponer.textContent = porReponer;
  productosExcedidos.textContent = excedidos;
}

function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = "mensaje-formulario" + (tipo ? " " + tipo : "");
}

function actualizarModoFormulario() {
  const estaEditando = productoEditandoId !== null;
  tituloFormulario.textContent = estaEditando ? "Editar producto" : "Registrar producto";
  textoFormulario.textContent = estaEditando
    ? "Modifica los datos generales y los límites del producto."
    : "Agrega un artículo y define sus niveles de inventario.";
  botonGuardar.textContent = estaEditando ? "Guardar cambios" : "Guardar producto";
  botonCancelar.hidden = !estaEditando;
  camposExistenciaInicial.hidden = estaEditando;
}

function iniciarEdicion(productoId) {
  const producto = productos.find(function (elemento) { return elemento.id === productoId; });
  if (!producto) return;

  productoEditandoId = producto.id;
  document.getElementById("codigo").value = producto.codigo;
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("categoria").value = producto.categoria;
  document.getElementById("unidad").value = producto.unidad;
  document.getElementById("minimo").value = producto.minimo;
  document.getElementById("maximo").value = producto.maximo;
  actualizarModoFormulario();
  mostrarMensaje(mensajeProducto, "Editando " + producto.codigo + ". La existencia y el costo se modifican mediante movimientos.", "exito");
  document.getElementById("registrar-producto").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("nombre").focus({ preventScroll: true });
}

function cancelarEdicion() {
  productoEditandoId = null;
  formularioProducto.reset();
  actualizarModoFormulario();
  mostrarMensaje(mensajeProducto, "", "");
}

function guardarEdicion(datosProducto) {
  const producto = productos.find(function (elemento) { return elemento.id === productoEditandoId; });
  if (!producto) {
    mostrarMensaje(mensajeProducto, "No se encontró el producto que intentas editar.", "error");
    cancelarEdicion();
    return;
  }

  const codigoExiste = productos.some(function (elemento) {
    return elemento.id !== producto.id && elemento.codigo.toUpperCase() === datosProducto.codigo;
  });
  if (codigoExiste) {
    mostrarMensaje(mensajeProducto, "Ese código ya pertenece a otro producto.", "error");
    return;
  }

  const anteriores = {
    codigo: producto.codigo,
    nombre: producto.nombre,
    categoria: producto.categoria,
    unidad: producto.unidad,
    minimo: producto.minimo,
    maximo: producto.maximo
  };
  Object.assign(producto, datosProducto);

  if (!guardarInventario()) {
    Object.assign(producto, anteriores);
    mostrarMensaje(mensajeProducto, "No se pudieron guardar los cambios. Inténtalo de nuevo.", "error");
    return;
  }

  mostrarProductos();
  cancelarEdicion();
  mostrarMensaje(mensajeProducto, "Los datos del producto se actualizaron correctamente.", "exito");
}

function desactivarOReactivar(productoId, accion) {
  const producto = productos.find(function (elemento) { return elemento.id === productoId; });
  if (!producto) return;

  const desactivar = accion === "desactivar";
  const confirmacion = desactivar
    ? "¿Desactivar " + producto.nombre + "? Se conservarán sus datos, existencias y movimientos."
    : "¿Reactivar " + producto.nombre + "? Volverá a incluirse en los indicadores del inventario.";
  if (!window.confirm(confirmacion)) return;

  const estadoAnterior = producto.activo;
  producto.activo = !desactivar;
  if (!guardarInventario()) {
    producto.activo = estadoAnterior;
    mostrarMensaje(mensajeProducto, "No se pudo actualizar el estado del producto.", "error");
    return;
  }

  mostrarProductos();
  mostrarMensaje(mensajeProducto, desactivar
    ? producto.codigo + " fue desactivado. Sus datos se conservaron."
    : producto.codigo + " fue reactivado.", "exito");
}

function opcionesMotivo(tipo) {
  if (tipo === "entrada") {
    return [
      { valor: "compra", texto: "Compra" },
      { valor: "devolucion", texto: "Devolución" },
      { valor: "ajuste", texto: "Ajuste de entrada" }
    ];
  }

  return [
    { valor: "venta", texto: "Venta" },
    { valor: "danio", texto: "Daño" },
    { valor: "uso-interno", texto: "Uso interno" },
    { valor: "ajuste", texto: "Ajuste de salida" }
  ];
}

function obtenerProductoSeleccionadoMovimiento() {
  const id = Number(selectorProductoMovimiento.value);
  return productos.find(function (producto) { return producto.id === id; });
}

function obtenerUltimaFechaProducto(productoId) {
  const fechas = movimientos
    .filter(function (movimiento) { return movimiento.productoId === productoId; })
    .map(function (movimiento) { return movimiento.fecha; })
    .sort();
  return fechas.length ? fechas[fechas.length - 1] : obtenerFechaLocal();
}

function actualizarCamposMovimiento() {
  const entrada = tipoMovimiento.value === "entrada";
  const venta = !entrada && motivoMovimiento.value === "venta";
  const producto = obtenerProductoSeleccionadoMovimiento();

  campoCostoEntrada.hidden = !entrada;
  costoCompra.required = entrada;
  campoPrecioVenta.hidden = !venta;
  precioVenta.required = venta;
  informacionCostoSalida.hidden = entrada;

  informacionCostoSalida.textContent = producto
    ? "Costo promedio actual: " + formatearMoneda(producto.costoPromedio) + " por " + producto.unidad + ". Este será el costo de la salida."
    : "En las salidas se utiliza el costo promedio vigente del producto.";

  const hoy = obtenerFechaLocal();
  const fechaMinima = producto ? obtenerUltimaFechaProducto(producto.id) : hoy;
  fechaMovimiento.min = fechaMinima;
  fechaMovimiento.max = hoy;
  if (!fechaMovimiento.value || fechaMovimiento.value < fechaMinima || fechaMovimiento.value > hoy) {
    fechaMovimiento.value = hoy;
  }
}

function actualizarMotivos() {
  const motivoAnterior = motivoMovimiento.value;
  const opciones = opcionesMotivo(tipoMovimiento.value);
  motivoMovimiento.replaceChildren();

  opciones.forEach(function (opcion) {
    const elemento = document.createElement("option");
    elemento.value = opcion.valor;
    elemento.textContent = opcion.texto;
    motivoMovimiento.appendChild(elemento);
  });

  if (opciones.some(function (opcion) { return opcion.valor === motivoAnterior; })) {
    motivoMovimiento.value = motivoAnterior;
  }
  actualizarCamposMovimiento();
}

function actualizarSelectoresProductos() {
  const anteriorMovimiento = selectorProductoMovimiento.value;
  const anteriorKardex = filtroKardex.value;
  selectorProductoMovimiento.replaceChildren();
  filtroKardex.replaceChildren();

  const opcionInicial = document.createElement("option");
  opcionInicial.value = "";
  opcionInicial.textContent = "Selecciona un producto";
  selectorProductoMovimiento.appendChild(opcionInicial);

  productos.filter(function (producto) { return producto.activo !== false; }).forEach(function (producto) {
    const opcion = document.createElement("option");
    opcion.value = producto.id;
    opcion.textContent = producto.codigo + " · " + producto.nombre;
    selectorProductoMovimiento.appendChild(opcion);
  });

  productos.forEach(function (producto) {
    const opcion = document.createElement("option");
    opcion.value = producto.id;
    opcion.textContent = producto.codigo + " · " + producto.nombre + (producto.activo === false ? " (inactivo)" : "");
    filtroKardex.appendChild(opcion);
  });

  actualizarSelectorReporteProductos();

  const activoAnterior = productos.find(function (producto) {
    return String(producto.id) === anteriorMovimiento && producto.activo !== false;
  });
  const primerActivo = productos.find(function (producto) { return producto.activo !== false; });
  selectorProductoMovimiento.value = activoAnterior ? anteriorMovimiento : (primerActivo ? String(primerActivo.id) : "");

  const productoKardexAnterior = productos.find(function (producto) { return String(producto.id) === anteriorKardex; });
  const primerKardex = primerActivo || productos[0];
  filtroKardex.value = productoKardexAnterior ? anteriorKardex : (primerKardex ? String(primerKardex.id) : "");

  actualizarCamposMovimiento();
  mostrarKardex();
  renderizarReportes();
}

function nombreMotivo(movimiento) {
  const nombres = {
    "saldo-inicial": "Saldo inicial",
    compra: "Compra",
    devolucion: "Devolución",
    venta: "Venta",
    danio: "Daño",
    "uso-interno": "Uso interno",
    ajuste: movimiento.tipo === "entrada" ? "Ajuste de entrada" : "Ajuste de salida"
  };
  return nombres[movimiento.motivo] || "Movimiento";
}

function mostrarKardex() {
  tablaKardex.replaceChildren();
  const productoId = Number(filtroKardex.value);
  const producto = productos.find(function (elemento) { return elemento.id === productoId; });

  if (!producto) {
    productoSeleccionadoKardex.textContent = "Selecciona un producto";
    saldoKardex.textContent = "—";
    costoPromedioKardex.textContent = "—";
    valorInventarioKardex.textContent = "—";
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay productos para consultar.");
    celda.colSpan = 9;
    celda.className = "tabla-vacia";
    fila.appendChild(celda);
    tablaKardex.appendChild(fila);
    return;
  }

  productoSeleccionadoKardex.textContent = producto.codigo + " · " + producto.nombre;
  saldoKardex.textContent = formatearCantidad(producto.existencia) + " " + producto.unidad;
  costoPromedioKardex.textContent = formatearMoneda(producto.costoPromedio);
  valorInventarioKardex.textContent = formatearMoneda(producto.existencia * producto.costoPromedio);

  const movimientosProducto = movimientos
    .filter(function (movimiento) { return movimiento.productoId === producto.id; })
    .sort(function (a, b) {
      if (a.fecha === b.fecha) return a.id - b.id;
      return a.fecha.localeCompare(b.fecha);
    });

  if (movimientosProducto.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("Este producto todavía no tiene movimientos.");
    celda.colSpan = 9;
    celda.className = "tabla-vacia";
    fila.appendChild(celda);
    tablaKardex.appendChild(fila);
    return;
  }

  movimientosProducto.forEach(function (movimiento) {
    const fila = document.createElement("tr");
    const entrada = movimiento.tipo === "entrada" ? formatearCantidad(movimiento.cantidad) : "—";
    const salida = movimiento.tipo === "salida" ? formatearCantidad(movimiento.cantidad) : "—";
    const precio = movimiento.precioVenta === null ? "—" : formatearMoneda(movimiento.precioVenta);

    fila.appendChild(crearCelda(formatearFecha(movimiento.fecha)));
    fila.appendChild(crearCelda(nombreMotivo(movimiento)));
    fila.appendChild(crearCelda(entrada));
    fila.appendChild(crearCelda(salida));
    fila.appendChild(crearCelda(formatearMoneda(movimiento.costoUnitario)));
    fila.appendChild(crearCelda(formatearMoneda(movimiento.importeCosto)));
    fila.appendChild(crearCelda(precio));
    fila.appendChild(crearCelda(formatearCantidad(movimiento.saldo)));
    fila.appendChild(crearCelda(formatearMoneda(movimiento.costoPromedio)));
    tablaKardex.appendChild(fila);
  });
}

function actualizarSelectorReporteProductos() {
  const anterior = reporteProducto.value;
  reporteProducto.replaceChildren();

  const todos = document.createElement("option");
  todos.value = "todos";
  todos.textContent = "Todos los productos";
  reporteProducto.appendChild(todos);

  productos.forEach(function (producto) {
    const opcion = document.createElement("option");
    opcion.value = String(producto.id);
    opcion.textContent = producto.codigo + " · " + producto.nombre + (producto.activo === false ? " (inactivo)" : "");
    reporteProducto.appendChild(opcion);
  });

  const existeAnterior = productos.some(function (producto) { return String(producto.id) === anterior; });
  reporteProducto.value = existeAnterior ? anterior : "todos";
}

function obtenerMovimientosFiltradosReporte() {
  const desde = reporteDesde.value;
  const hasta = reporteHasta.value;

  if (desde && hasta && desde > hasta) {
    mostrarMensaje(mensajeReporte, "La fecha inicial no puede ser posterior a la fecha final.", "error");
    cantidadResultadosReporte.textContent = "Revisa el período seleccionado.";
    return null;
  }

  mostrarMensaje(mensajeReporte, "", "");

  return movimientos.filter(function (movimiento) {
    if (desde && movimiento.fecha < desde) return false;
    if (hasta && movimiento.fecha > hasta) return false;
    if (reporteTipo.value !== "todos" && movimiento.tipo !== reporteTipo.value) return false;
    if (reporteMotivo.value !== "todos" && movimiento.motivo !== reporteMotivo.value) return false;
    if (reporteProducto.value !== "todos" && String(movimiento.productoId) !== reporteProducto.value) return false;
    return true;
  }).sort(function (a, b) {
    if (a.fecha === b.fecha) return b.id - a.id;
    return b.fecha.localeCompare(a.fecha);
  });
}

function agregarFilaVacia(tabla, columnas, texto) {
  const fila = document.createElement("tr");
  const celda = crearCelda(texto);
  celda.colSpan = columnas;
  celda.className = "tabla-vacia";
  fila.appendChild(celda);
  tabla.appendChild(fila);
}

function mostrarAlertasInventario() {
  tablaAlertasReporte.replaceChildren();

  const activos = productos.filter(function (producto) { return producto.activo !== false; });
  const requierenAtencion = activos.filter(function (producto) {
    return producto.existencia <= producto.minimo || producto.existencia > producto.maximo;
  }).sort(function (a, b) {
    const prioridad = function (producto) {
      if (producto.existencia === 0) return 0;
      if (producto.existencia <= producto.minimo) return 1;
      return 2;
    };
    return prioridad(a) - prioridad(b) || a.nombre.localeCompare(b.nombre);
  });

  if (requierenAtencion.length === 0) {
    agregarFilaVacia(tablaAlertasReporte, 7, "No hay productos que requieran atención.");
    return;
  }

  requierenAtencion.forEach(function (producto) {
    const fila = document.createElement("tr");
    const estado = obtenerEstado(producto);
    const celdaEstado = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = "estado " + estado.clase;
    etiqueta.textContent = estado.texto;
    celdaEstado.appendChild(etiqueta);

    fila.appendChild(crearCelda(producto.codigo));
    fila.appendChild(crearCelda(producto.nombre));
    fila.appendChild(crearCelda(formatearCantidad(producto.existencia) + " " + producto.unidad));
    fila.appendChild(crearCelda(formatearCantidad(producto.minimo)));
    fila.appendChild(crearCelda(formatearCantidad(producto.maximo)));
    fila.appendChild(crearCelda(formatearMoneda(producto.existencia * producto.costoPromedio)));
    fila.appendChild(celdaEstado);
    tablaAlertasReporte.appendChild(fila);
  });
}

function mostrarTablaMovimientosReporte(lista) {
  tablaMovimientosReporte.replaceChildren();

  if (lista.length === 0) {
    agregarFilaVacia(tablaMovimientosReporte, 8, "No hay movimientos que coincidan con los filtros.");
    return;
  }

  lista.forEach(function (movimiento) {
    const fila = document.createElement("tr");
    const importeVenta = movimiento.motivo === "venta" && movimiento.precioVenta !== null
      ? formatearMoneda(movimiento.cantidad * movimiento.precioVenta)
      : "—";

    fila.appendChild(crearCelda(formatearFecha(movimiento.fecha)));
    fila.appendChild(crearCelda(movimiento.codigoProducto || "—"));
    fila.appendChild(crearCelda(movimiento.nombreProducto || "—"));
    fila.appendChild(crearCelda((movimiento.tipo === "entrada" ? "Entrada · " : "Salida · ") + nombreMotivo(movimiento)));
    fila.appendChild(crearCelda(formatearCantidad(movimiento.cantidad)));
    fila.appendChild(crearCelda(formatearMoneda(movimiento.costoUnitario)));
    fila.appendChild(crearCelda(formatearMoneda(movimiento.importeCosto)));
    fila.appendChild(crearCelda(importeVenta));
    tablaMovimientosReporte.appendChild(fila);
  });
}

function renderizarReportes() {
  const activos = productos.filter(function (producto) { return producto.activo !== false; });
  const valorActual = productos.reduce(function (total, producto) {
    return total + producto.existencia * producto.costoPromedio;
  }, 0);
  const paraReponer = activos.filter(function (producto) { return producto.existencia <= producto.minimo; });
  const agotados = activos.filter(function (producto) { return producto.existencia === 0; });

  valorInventarioReporte.textContent = formatearMoneda(valorActual);
  productosActivosReporte.textContent = String(activos.length);
  stockBajoReporte.textContent = String(paraReponer.length);
  agotadosReporte.textContent = String(agotados.length);
  mostrarAlertasInventario();

  const lista = obtenerMovimientosFiltradosReporte();
  if (lista === null) {
    mostrarTablaMovimientosReporte([]);
    comprasReporte.textContent = formatearMoneda(0);
    cantidadComprasReporte.textContent = "0 unidades";
    costoSalidasReporte.textContent = formatearMoneda(0);
    cantidadSalidasReporte.textContent = "0 unidades";
    ventasReporte.textContent = formatearMoneda(0);
    utilidadReporte.textContent = formatearMoneda(0);
    utilidadReporte.classList.remove("resultado-negativo");
    return;
  }

  const compras = lista.filter(function (movimiento) {
    return movimiento.tipo === "entrada" && movimiento.motivo === "compra";
  });
  const salidas = lista.filter(function (movimiento) { return movimiento.tipo === "salida"; });
  const ventas = salidas.filter(function (movimiento) {
    return movimiento.motivo === "venta" && movimiento.precioVenta !== null;
  });

  const importeCompras = compras.reduce(function (total, movimiento) { return total + movimiento.importeCosto; }, 0);
  const unidadesCompradas = compras.reduce(function (total, movimiento) { return total + movimiento.cantidad; }, 0);
  const costoSalidas = salidas.reduce(function (total, movimiento) { return total + movimiento.importeCosto; }, 0);
  const unidadesSalidas = salidas.reduce(function (total, movimiento) { return total + movimiento.cantidad; }, 0);
  const importeVentas = ventas.reduce(function (total, movimiento) {
    return total + movimiento.cantidad * movimiento.precioVenta;
  }, 0);
  const costoVentas = ventas.reduce(function (total, movimiento) { return total + movimiento.importeCosto; }, 0);
  const utilidadBruta = importeVentas - costoVentas;

  comprasReporte.textContent = formatearMoneda(importeCompras);
  cantidadComprasReporte.textContent = formatearCantidad(unidadesCompradas) + " unidades";
  costoSalidasReporte.textContent = formatearMoneda(costoSalidas);
  cantidadSalidasReporte.textContent = formatearCantidad(unidadesSalidas) + " unidades";
  ventasReporte.textContent = formatearMoneda(importeVentas);
  utilidadReporte.textContent = formatearMoneda(utilidadBruta);
  utilidadReporte.classList.toggle("resultado-negativo", utilidadBruta < 0);

  cantidadResultadosReporte.textContent = "Se encontraron " + lista.length + (lista.length === 1 ? " movimiento" : " movimientos") + " con los filtros seleccionados.";
  mostrarTablaMovimientosReporte(lista);
}

function escaparValorCSV(valor) {
  const texto = String(valor === null || valor === undefined ? "" : valor);
  return '"' + texto.replace(/"/g, '""') + '"';
}

function exportarMovimientosCSV() {
  const lista = obtenerMovimientosFiltradosReporte();
  if (lista === null) return;
  if (lista.length === 0) {
    mostrarMensaje(mensajeReporte, "No hay movimientos para exportar con los filtros seleccionados.", "error");
    return;
  }

  const encabezados = [
    "Fecha", "Código", "Producto", "Tipo", "Motivo", "Cantidad", "Costo unitario",
    "Importe costo", "Precio de venta", "Importe de venta", "Saldo", "Costo promedio", "Nota"
  ];
  const filas = lista.map(function (movimiento) {
    return [
      movimiento.fecha,
      movimiento.codigoProducto,
      movimiento.nombreProducto,
      movimiento.tipo,
      nombreMotivo(movimiento),
      movimiento.cantidad,
      movimiento.costoUnitario,
      movimiento.importeCosto,
      movimiento.precioVenta === null ? "" : movimiento.precioVenta,
      movimiento.motivo === "venta" && movimiento.precioVenta !== null
        ? redondear(movimiento.cantidad * movimiento.precioVenta, 2)
        : "",
      movimiento.saldo,
      movimiento.costoPromedio,
      movimiento.nota
    ];
  });
  const contenido = "\uFEFF" + [encabezados, ...filas]
    .map(function (fila) { return fila.map(escaparValorCSV).join(","); })
    .join("\r\n");
  const archivo = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "stocklite-movimientos-" + obtenerFechaLocal() + ".csv";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  mostrarMensaje(mensajeReporte, "Se exportaron " + lista.length + " movimientos.", "exito");
}

function limpiarFiltrosReporte() {
  reporteDesde.value = "";
  reporteHasta.value = "";
  reporteTipo.value = "todos";
  reporteMotivo.value = "todos";
  reporteProducto.value = "todos";
  renderizarReportes();
}

function registrarMovimiento(evento) {
  evento.preventDefault();
  if (!formularioMovimiento.reportValidity()) return;

  const producto = obtenerProductoSeleccionadoMovimiento();
  const tipo = tipoMovimiento.value;
  const motivo = motivoMovimiento.value;
  const fecha = fechaMovimiento.value;
  const cantidad = Number(cantidadMovimiento.value);

  if (!producto || producto.activo === false) {
    mostrarMensaje(mensajeMovimiento, "Selecciona un producto activo.", "error");
    return;
  }
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    mostrarMensaje(mensajeMovimiento, "La cantidad debe ser mayor que cero.", "error");
    return;
  }

  const ultimaFecha = obtenerUltimaFechaProducto(producto.id);
  const hoy = obtenerFechaLocal();
  if (!fecha || fecha < ultimaFecha || fecha > hoy) {
    mostrarMensaje(mensajeMovimiento, "La fecha debe estar entre el último movimiento y el día de hoy.", "error");
    return;
  }

  const existenciaAnterior = producto.existencia;
  const costoPromedioAnterior = producto.costoPromedio;
  let nuevaExistencia;
  let nuevoCostoPromedio;
  let costoUnitario;
  let precioCapturado = null;

  if (tipo === "entrada") {
    if (costoCompra.value.trim() === "") {
      mostrarMensaje(mensajeMovimiento, "Indica el costo unitario de la entrada.", "error");
      costoCompra.focus();
      return;
    }

    costoUnitario = Number(costoCompra.value);
    if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
      mostrarMensaje(mensajeMovimiento, "El costo unitario debe ser igual o mayor que cero.", "error");
      return;
    }

    nuevaExistencia = redondear(existenciaAnterior + cantidad, 2);
    const valorAnterior = existenciaAnterior * costoPromedioAnterior;
    const valorEntrada = cantidad * costoUnitario;
    nuevoCostoPromedio = nuevaExistencia > 0
      ? redondear((valorAnterior + valorEntrada) / nuevaExistencia, 6)
      : 0;
  } else {
    if (cantidad > existenciaAnterior) {
      mostrarMensaje(mensajeMovimiento, "No hay existencias suficientes. Disponible: " + formatearCantidad(existenciaAnterior) + ".", "error");
      cantidadMovimiento.focus();
      return;
    }

    costoUnitario = costoPromedioAnterior;
    nuevaExistencia = redondear(existenciaAnterior - cantidad, 2);
    nuevoCostoPromedio = nuevaExistencia > 0 ? costoPromedioAnterior : 0;

    if (motivo === "venta") {
      if (precioVenta.value.trim() === "") {
        mostrarMensaje(mensajeMovimiento, "Indica el precio unitario de venta.", "error");
        precioVenta.focus();
        return;
      }
      precioCapturado = Number(precioVenta.value);
      if (!Number.isFinite(precioCapturado) || precioCapturado <= 0) {
        mostrarMensaje(mensajeMovimiento, "El precio de venta debe ser mayor que cero.", "error");
        return;
      }
    }
  }

  const movimiento = crearMovimiento(producto, {
    fecha: fecha,
    tipo: tipo,
    motivo: motivo,
    cantidad: cantidad,
    costoUnitario: costoUnitario,
    precioVenta: precioCapturado,
    saldo: nuevaExistencia,
    costoPromedio: nuevoCostoPromedio,
    nota: document.getElementById("nota-movimiento").value.trim()
  });

  producto.existencia = nuevaExistencia;
  producto.costoPromedio = nuevoCostoPromedio;
  movimientos.push(movimiento);

  if (!guardarInventario()) {
    producto.existencia = existenciaAnterior;
    producto.costoPromedio = costoPromedioAnterior;
    movimientos.pop();
    mostrarMensaje(mensajeMovimiento, "No se pudo guardar el movimiento. No se modificó el inventario.", "error");
    return;
  }

  formularioMovimiento.reset();
  fechaMovimiento.value = obtenerFechaLocal();
  actualizarMotivos();
  mostrarProductos();
  mostrarMensaje(mensajeMovimiento,
    nombreMotivo(movimiento) + " registrada. Nuevo saldo: " + formatearCantidad(nuevaExistencia) + " " + producto.unidad + ".",
    "exito"
  );
}

formularioProducto.addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!formularioProducto.reportValidity()) return;

  const codigo = document.getElementById("codigo").value.trim().toUpperCase();
  const nombre = document.getElementById("nombre").value.trim();
  const categoriaIngresada = document.getElementById("categoria").value.trim();
  const unidad = document.getElementById("unidad").value;
  const minimo = Number(document.getElementById("minimo").value);
  const maximo = Number(document.getElementById("maximo").value);

  if (minimo > maximo) {
    mostrarMensaje(mensajeProducto, "La existencia mínima no puede ser mayor que la máxima.", "error");
    return;
  }

  const datosProducto = {
    codigo: codigo,
    nombre: nombre,
    categoria: categoriaIngresada || "Sin categoría",
    unidad: unidad,
    minimo: minimo,
    maximo: maximo
  };

  if (productoEditandoId !== null) {
    guardarEdicion(datosProducto);
    return;
  }

  const codigoExiste = productos.some(function (producto) { return producto.codigo.toUpperCase() === codigo; });
  if (codigoExiste) {
    mostrarMensaje(mensajeProducto, "Ese código ya está registrado. Utiliza uno diferente.", "error");
    return;
  }

  const existenciaTexto = document.getElementById("existencia-inicial").value.trim();
  const existencia = existenciaTexto === "" ? 0 : Number(existenciaTexto);
  const costoTexto = document.getElementById("costo-inicial").value.trim();
  if (existencia > 0 && costoTexto === "") {
    mostrarMensaje(mensajeProducto, "Indica el costo unitario para registrar la existencia inicial.", "error");
    document.getElementById("costo-inicial").focus();
    return;
  }

  const costoInicial = costoTexto === "" ? 0 : Number(costoTexto);
  const nuevoProducto = {
    id: siguienteIdProducto(),
    ...datosProducto,
    existencia: existencia,
    costoPromedio: costoInicial,
    activo: true
  };

  productos.push(nuevoProducto);
  let movimientoInicial = null;
  if (existencia > 0) {
    movimientoInicial = crearSaldoInicial(nuevoProducto, null, "Existencia inicial registrada al dar de alta el producto.");
    movimientos.push(movimientoInicial);
  }

  if (!guardarInventario()) {
    productos.pop();
    if (movimientoInicial) movimientos.pop();
    mostrarMensaje(mensajeProducto, "No fue posible guardar el producto. Comprueba el almacenamiento del navegador.", "error");
    return;
  }

  mostrarProductos();
  formularioProducto.reset();
  actualizarModoFormulario();
  mostrarMensaje(mensajeProducto, "Producto " + nuevoProducto.codigo + " registrado correctamente.", "exito");
});

tablaProductos.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const productoId = Number(boton.dataset.id);
  const accion = boton.dataset.accion;
  if (accion === "editar") {
    iniciarEdicion(productoId);
    return;
  }
  if (accion === "desactivar" || accion === "reactivar") {
    desactivarOReactivar(productoId, accion);
  }
});

formularioMovimiento.addEventListener("submit", registrarMovimiento);
filtroProductos.addEventListener("change", mostrarProductos);
botonCancelar.addEventListener("click", cancelarEdicion);
tipoMovimiento.addEventListener("change", actualizarMotivos);
motivoMovimiento.addEventListener("change", actualizarCamposMovimiento);
selectorProductoMovimiento.addEventListener("change", actualizarCamposMovimiento);
filtroKardex.addEventListener("change", mostrarKardex);
reporteDesde.addEventListener("change", renderizarReportes);
reporteHasta.addEventListener("change", renderizarReportes);
reporteTipo.addEventListener("change", renderizarReportes);
reporteMotivo.addEventListener("change", renderizarReportes);
reporteProducto.addEventListener("change", renderizarReportes);
botonLimpiarReporte.addEventListener("click", limpiarFiltrosReporte);
botonExportarReporte.addEventListener("click", exportarMovimientosCSV);

if (necesitaGuardarMigracion) {
  guardarInventario();
}

fechaMovimiento.value = obtenerFechaLocal();
actualizarModoFormulario();
actualizarMotivos();
mostrarProductos();
renderizarReportes();
