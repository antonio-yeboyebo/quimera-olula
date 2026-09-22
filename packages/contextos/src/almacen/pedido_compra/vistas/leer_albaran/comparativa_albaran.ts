import { Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { LineaNuevaEntradaDesdePedido } from "../../diseño.ts";

// ---------------------------------------------------------------------------
// Tipo editable de línea en la comparativa
// ---------------------------------------------------------------------------

export interface LineaEditableEntrada extends Modelo {
    rowId: string;           // identificador local, no se envía a la API
    linea_pedido_id: string;
    cantidad: number;
    lote_id: string;
}

// ---------------------------------------------------------------------------
// MetaModelo
// ---------------------------------------------------------------------------

export const metaLineaEditableEntrada: MetaModelo<LineaEditableEntrada> = {
    campos: {
        cantidad: {
            tipo: "numero",
            requerido: true,
            positivo: true,
            validacion: (m) => (m.cantidad > 0 ? true : "La cantidad debe ser mayor que 0"),
        },
        lote_id: {},
    },
};

// ---------------------------------------------------------------------------
// Conversión desde/hacia LineaNuevaEntradaDesdePedido
// ---------------------------------------------------------------------------

export const lineaEditableDesdeDetectada = (
    l: LineaNuevaEntradaDesdePedido
): LineaEditableEntrada => ({
    rowId: crypto.randomUUID(),
    linea_pedido_id: l.linea_pedido_id,
    cantidad: l.cantidad,
    lote_id: l.lote_id ?? "",
});

export const crearLineaEditableVacia = (linea_pedido_id: string): LineaEditableEntrada => ({
    rowId: crypto.randomUUID(),
    linea_pedido_id,
    cantidad: 0,
    lote_id: "",
});

export const lineaEditableADetectada = (
    l: LineaEditableEntrada
): LineaNuevaEntradaDesdePedido => ({
    linea_pedido_id: l.linea_pedido_id,
    cantidad: l.cantidad,
    lote_id: l.lote_id !== "" ? l.lote_id : null,
    tipo_caja_id: null,
    num_cajas: null,
});
