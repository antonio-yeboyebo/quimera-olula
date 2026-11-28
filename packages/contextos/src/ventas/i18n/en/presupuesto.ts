import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { presupuesto as es } from "../es/presupuesto.ts";

export const presupuesto: Traduccion<typeof es> = {
    maestro: {
        titulo: "Quotes",
        nuevo: "New Quote",
    },
    estado: {
        pendiente: "Pending",
        aprobado: "Approved",
    },
    widgets: {
        plural: "Quotes",
        total: "Quoted amount",
        medio: "Average quote",
    },
    verPresupuesto: "View quote",
    detalle: {
        aprobar: "Approve",
        fechaSalida: "Departure date",
    },
    borrar: {
        mensaje: "Are you sure you want to delete this quote?",
    },
    aprobar: {
        titulo: "Confirm approval",
        mensaje: "Are you sure you want to approve this quote?",
        pedidoGenerado: "Order created",
        pedidoGeneradoOk: "The order has been created successfully.",
        seguirEnPresupuesto: "Stay on the quote",
        irAlPedido: "Go to order {{codigo}}",
    },
    aprobarParcial: {
        titulo: "Approve Quote: {{cliente}} - {{codigo}}",
        aprobarTodo: "Approve all",
        generarPedido: "Create order",
        pedidoGeneradoCodigo: "Order {{codigo}} created successfully.",
        volverAlPresupuesto: "Back to the quote",
        abrirLinea: "Open line",
        cerrarLinea: "Close line",
        articulo: "Item",
        aprobada: "Approved",
        aAprobar: "To approve",
        confirmar: "Confirm",
        confirmarMensaje: "Are you sure you want to create the order?",
        aceptar: "OK",
        masDeLoPendiente: "You cannot approve more than the pending quantity",
    },
    errores: {
        report: "Error getting the quote report",
        crear: "Error creating the quote",
        borrar: "Error deleting the quote",
        cambiarAgente: "Error changing the quote's sales agent",
        cambiarDivisa: "Error changing the quote's currency",
        cambiarCliente: "Error changing the quote's customer",
        crearLinea: "Error creating the quote line",
        obtenerLinea: "Error getting the new quote line",
        cambiarArticuloLinea: "Error updating the item of the quote line",
        cambiarLinea: "Error updating the quote line",
        cambiarCantidadLinea: "Error updating the quantity of the quote line",
        borrarLinea: "Error deleting the quote line",
        actualizar: "Error updating the quote",
        aprobar: "Error approving the quote",
        cambiarDescuento: "Error changing the quote's discount",
        aprobarParcial: "Error approving the quote",
        cambiarEstadoLinea: "Error changing the line status",
    },
};
