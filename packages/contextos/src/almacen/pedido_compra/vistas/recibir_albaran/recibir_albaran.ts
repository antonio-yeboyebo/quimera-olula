import { Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { LineaNuevaEntradaDesdePedido } from "../../diseño.ts";

// ---------------------------------------------------------------------------
// Paso 1 — cantidades y lotes detectados
// ---------------------------------------------------------------------------

export interface LineaEditableEntrada extends Modelo {
    rowId: string;           // identificador local, no se envía a la API
    linea_pedido_id: string;
    cantidad: number;
    lote_id: string;
}

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

// ---------------------------------------------------------------------------
// Paso 2 — cajas destino
// ---------------------------------------------------------------------------

export interface LineaCajaEntrada extends Modelo {
    rowId: string;           // mismo rowId que LineaEditableEntrada
    tipo_caja_id: string;    // "" → null en API (Sin Caja)
    cantidad_caja: number | null;
    num_cajas: number | null;
}

export const metaLineaCajaEntrada: MetaModelo<LineaCajaEntrada> = {
    campos: {
        tipo_caja_id: {},
        cantidad_caja: {
            tipo: "numero",
            validacion: (m) =>
                m.tipo_caja_id === "" || (m.cantidad_caja != null && m.cantidad_caja > 0)
                    ? true
                    : "La cantidad por caja debe ser mayor que 0",
        },
        num_cajas: {
            tipo: "numero",
            validacion: (m) =>
                m.tipo_caja_id === "" || (m.num_cajas != null && m.num_cajas > 0)
                    ? true
                    : "El número de cajas debe ser mayor que 0",
        },
    },
};

export const inicializarLineaCaja = (linea: LineaEditableEntrada): LineaCajaEntrada => ({
    rowId: linea.rowId,
    tipo_caja_id: "",
    cantidad_caja: null,
    num_cajas: null,
});

/**
 * Convierte una LineaEditableEntrada y su configuración de caja en una única
 * LineaNuevaEntradaDesdePedido con la cantidad total y num_cajas agregado.
 */
export const expandirLineaEnCajas = (
    linea: LineaEditableEntrada,
    caja: LineaCajaEntrada
): LineaNuevaEntradaDesdePedido[] => {
    const lote_id = linea.lote_id !== "" ? linea.lote_id : null;
    const tipo_caja_id = caja.tipo_caja_id !== "" ? caja.tipo_caja_id : null;

    return [{
        linea_pedido_id: linea.linea_pedido_id,
        cantidad: linea.cantidad,
        lote_id,
        tipo_caja_id,
        num_cajas: caja.num_cajas,
    }];
};
