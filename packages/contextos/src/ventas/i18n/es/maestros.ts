/** Agentes comerciales (`ventas/agente`), tarifas (`ventas/tarifa`) y configuración de ventas (`ventas/config`). */
export const agente = {
    maestro: {
        titulo: "Agentes comerciales",
        nuevo: "Nuevo agente",
        id: "ID",
        nombre: "Nombre",
        idFiscal: "Id Fiscal",
        comision: "% Comisión",
        telefono: "Teléfono",
        email: "Email",
        ciudad: "Ciudad",
    },
    campos: {
        nombrePila: "Nombre de pila",
        nombre: "Nombre",
        apellidos: "Apellidos",
        idFiscal: "Id Fiscal",
        dniCif: "DNI/CIF",
        comision: "% Comisión",
        telefono: "Teléfono",
        email: "Email",
        direccion: "Dirección",
        codPostal: "Código postal",
        ciudad: "Ciudad",
        provincia: "Provincia",
        usuario: "Usuario",
    },
    detalle: {
        general: "General",
        datos: "Datos",
    },
    errores: {
        obtener: "Error al obtener el agente",
        obtenerLista: "Error al obtener los agentes",
        crear: "Error al crear el agente",
        actualizar: "Error al actualizar el agente",
    },
} as const;

export const tarifa = {
    maestro: {
        titulo: "Tarifas",
        nueva: "Nueva Tarifa",
        codigo: "Código",
        nombre: "Nombre",
        divisa: "Divisa",
    },
    crear: "Crear tarifa",
    borrar: {
        titulo: "Borrar tarifa",
        mensaje: "¿Está seguro de que desea borrar la tarifa {{nombre}}?",
        boton: "Borrar",
    },
    detalle: {
        acciones: "Acciones",
        general: "General",
    },
    articulos: {
        titulo: "Artículos de la tarifa",
        anadir: "Añadir artículo",
        cambiarPrecio: "Cambiar precio",
        anadirBoton: "Añadir",
        referencia: "Referencia",
        descripcion: "Descripción",
        precio: "Precio",
        quitarTitulo: "Quitar artículo de la tarifa",
        quitarMensaje: "¿Está seguro de que desea quitar el artículo {{articulo}} de la tarifa?",
    },
    errores: {
        obtener: "Error al obtener la tarifa",
        obtenerLista: "Error al obtener las tarifas",
        crear: "Error al crear la tarifa",
        actualizar: "Error al actualizar la tarifa",
        eliminar: "Error al eliminar la tarifa",
        obtenerArticulos: "Error al obtener los artículos de la tarifa",
        anadirArticulo: "Error al añadir el artículo a la tarifa",
        actualizarArticulo: "Error al actualizar el artículo de la tarifa",
        quitarArticulo: "Error al quitar el artículo de la tarifa",
    },
} as const;

export const config = {
    titulo: "Configuración de ventas",
    subtitulo: "Datos generales de facturación que afectan a las ventas.",
    documentos: "Documentos de facturación",
    mostrarObservaciones: "Mostrar observaciones del cliente en documentos de facturación",
    facturarAlbaranesBorrador: "Facturar albaranes como borrador",
    crearFacturasBorrador: "Crear facturas como borrador",
    correo: "Correo",
    correoCopias: "Dirección para la copia de correos",
    correoNoValido: "No parece una dirección de correo",
    opciones: {
        Si: "Sí",
        No: "No",
        Preguntar: "Preguntar",
    },
    errores: {
        guardar: "Error al guardar la configuración de ventas",
    },
} as const;
