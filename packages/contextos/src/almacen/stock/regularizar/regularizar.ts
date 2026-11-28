import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaRegularizacionStock } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

const cantidadNoNegativa = (m: NuevaRegularizacionStock): boolean | string =>
    m.cantidad === null || m.cantidad === undefined || m.cantidad < 0
        ? tAlmacen("stock.laCantidadDebeSerMayorO")
        : true;

export const metaNuevaRegularizacionStock: MetaModelo<NuevaRegularizacionStock> = {
    campos: {
        cantidad: { tipo: "decimal", requerido: true, validacion: cantidadNoNegativa },
        fecha: { tipo: "fecha", requerido: true },
        hora: { tipo: "hora", requerido: true },
        motivo: { tipo: "texto", requerido: false },
    },
};

const horaActual = (): string => {
    const ahora = new Date();
    const hh = String(ahora.getHours()).padStart(2, "0");
    const mm = String(ahora.getMinutes()).padStart(2, "0");
    const ss = String(ahora.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
};

/** Como en Eneboo, la cantidad nueva parte de la cantidad actual del stock. */
export const nuevaRegularizacionInicial = (cantidadActual: number): NuevaRegularizacionStock => ({
    cantidad: cantidadActual,
    fecha: new Date(),
    hora: horaActual(),
    motivo: "",
});
