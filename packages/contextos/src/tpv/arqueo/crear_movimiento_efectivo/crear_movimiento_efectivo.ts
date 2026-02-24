import { divisaTpv } from "#/tpv/comun/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { MovimientoEfectivo } from "./diseño.ts";

export const movimientoEfectivoVacio: MovimientoEfectivo = {
    fecha: new Date(),
    importe: 0
}


export const metaMovimientoEfectivo: MetaModelo<MovimientoEfectivo> = {
    campos: {
        importe: { tipo: "moneda", divisa: divisaTpv, requerido: true },
        fecha: { requerido: true, tipo: "fecha" },
    }
};