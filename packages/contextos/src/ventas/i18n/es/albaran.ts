/** Albaranes de venta (`ventas/albaran`). */
export const albaran = {
    maestro: {
        titulo: "Albaranes",
        nuevo: "Nuevo Albarán",
        abono: "Abono",
    },
    tituloAbono: "{{titulo}} · Abono",
    si: "Sí",
    estado: {
        pendiente: "Pendiente",
        facturado: "Facturado",
    },
    widgets: {
        plural: "Albaranes",
        total: "Importe total",
        medio: "Albarán medio",
    },
    detalle: {
        facturar: "Facturar",
    },
    borrar: {
        mensaje: "¿Está seguro de que desea borrar este albarán?",
    },
    facturar: {
        titulo: "Facturar albarán",
        mensaje: "¿Seguro que desea facturar el albarán {{codigo}}?",
        facturaGenerada: "Factura generada",
        facturaGeneradaOk: "La factura se ha generado correctamente.",
        seguirEnAlbaran: "Seguir en el albarán",
        irALaFactura: "Ir a la factura {{codigo}}",
    },
    errores: {
        report: "Error al obtener el report del albarán",
        guardar: "Error al guardar albarán",
        crearLinea: "Error al crear línea de albarán",
        obtenerLinea: "Error al obtener la nueva línea de albarán",
        cambiarLinea: "Error al actualizar la línea del albarán",
        borrarLinea: "Error al borrar la línea del albarán",
        cambiarCliente: "Error al cambiar cliente del albarán",
        borrar: "Error al borrar albarán",
        cambiarDescuento: "Error al cambiar descuento del albarán",
        cambiarDivisa: "Error al cambiar divisa del albarán",
        facturar: "Error al facturar el albarán",
        cambiarAgente: "Error al cambiar agente del albarán",
    },
} as const;
