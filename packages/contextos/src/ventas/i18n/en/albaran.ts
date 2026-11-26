import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { albaran as es } from "../es/albaran.ts";

export const albaran: Traduccion<typeof es> = {
    maestro: {
        titulo: "Delivery notes",
        nuevo: "New Delivery Note",
        abono: "Credit",
    },
    tituloAbono: "{{titulo}} · Credit",
    si: "Yes",
    estado: {
        pendiente: "Pending",
        facturado: "Invoiced",
    },
    widgets: {
        plural: "Delivery notes",
        total: "Total amount",
        medio: "Average delivery note",
    },
    detalle: {
        facturar: "Invoice",
    },
    borrar: {
        mensaje: "Are you sure you want to delete this delivery note?",
    },
    facturar: {
        titulo: "Invoice delivery note",
        mensaje: "Are you sure you want to invoice delivery note {{codigo}}?",
        facturaGenerada: "Invoice created",
        facturaGeneradaOk: "The invoice has been created successfully.",
        seguirEnAlbaran: "Stay on the delivery note",
        irALaFactura: "Go to invoice {{codigo}}",
    },
    errores: {
        report: "Error getting the delivery note report",
        guardar: "Error saving the delivery note",
        crearLinea: "Error creating the delivery note line",
        obtenerLinea: "Error getting the new delivery note line",
        cambiarLinea: "Error updating the delivery note line",
        borrarLinea: "Error deleting the delivery note line",
        cambiarCliente: "Error changing the delivery note's customer",
        borrar: "Error deleting the delivery note",
        cambiarDescuento: "Error changing the delivery note's discount",
        cambiarDivisa: "Error changing the delivery note's currency",
        facturar: "Error invoicing the delivery note",
        cambiarAgente: "Error changing the delivery note's sales agent",
    },
};
