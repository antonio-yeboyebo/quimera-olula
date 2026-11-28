import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { factura as es } from "../es/factura.ts";

export const factura: Traduccion<typeof es> = {
    maestro: {
        titulo: "Invoices",
        nueva: "New Invoice",
    },
    estado: {
        sinExpedir: "Not issued",
        BORRADOR: "Draft",
        EMITIDA: "Issued",
        FIRMADA: "Signed",
        ERROR_FIRMA: "Signature error",
        PRE_VERIFACTU: "Pre Verifactu",
    },
    widgets: {
        plural: "Invoices",
        total: "Total invoiced",
        medio: "Average ticket",
    },
    detalle: {
        emitir: "Issue",
        enlacePago: "Card payment link",
        recibos: "Receipts",
        contabilidad: "Accounting",
        automatica: "Automatic",
        servicios: "Services",
        rectificativa: "Corrective",
    },
    recibos: {
        codigo: "Code",
        vencimiento: "Due date",
        importe: "Amount",
        estado: "Status",
    },
    emitir: {
        titulo: "Issue invoice",
        tituloReintento: "Retry issue",
        mensaje: "Issue invoice {{codigo}}? It will no longer be a draft.",
        mensajeReintento: "The signature of invoice {{codigo}} failed. Retry the issue?",
    },
    borrar: {
        mensaje: "Are you sure you want to delete this invoice?",
    },
    errores: {
        emitir: "Error issuing the invoice",
        report: "Error getting the invoice report",
        crear: "Error creating the invoice",
        cambiarCliente: "Error changing the invoice's customer",
        crearLinea: "Error creating the invoice line",
        obtenerLinea: "Error getting the new invoice line",
        cambiarArticuloLinea: "Error updating the item of the invoice line",
        cambiarLinea: "Error updating the invoice line",
        cambiarCantidadLinea: "Error updating the quantity of the invoice line",
        borrarLinea: "Error deleting the invoice line",
        guardar: "Error saving the invoice",
        borrar: "Error deleting the invoice",
        cambiarDescuento: "Error changing the invoice's discount",
        cambiarDivisa: "Error changing the invoice's currency",
        cambiarAgente: "Error changing the invoice's sales agent",
    },
};
