import { Orden } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { LineaAprobarPresupuesto, LineaPedidoPatch } from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

/** Orden con el que el servidor devuelve las líneas de esta pantalla. */
export const ordenLineas: Orden = ["referencia", "ASC", "id", "ASC"];

export const pendienteDeLinea = (linea: LineaAprobarPresupuesto): number => {
    if (linea.cerrada) return 0;
    return Math.max(0, linea.cantidad - linea.aprobada);
};

export const metaLinea: MetaModelo<LineaAprobarPresupuesto> = {
    campos: {
        a_aprobar: {
            tipo: "numero",
            positivo: true,
            validacion: (linea) =>
                Number(linea.a_aprobar) > pendienteDeLinea(linea)
                    ? tVentas("presupuesto.aprobarParcial.masDeLoPendiente")
                    : true,
        },
    },
    editable: (linea: LineaAprobarPresupuesto, campo?: string) => {
        if (campo === "a_aprobar") return !linea.cerrada;
        return true;
    },
};

export const lineaCompleta = (linea: LineaAprobarPresupuesto): boolean => {
    return linea.cantidad > 0 && linea.a_aprobar + linea.aprobada >= linea.cantidad;
};

export const transformarLineasPedido = (lineas: LineaAprobarPresupuesto[]): LineaPedidoPatch[] => {
    return lineas
        .map<LineaPedidoPatch>(linea => ({
            id: linea.id,
            cantidad: linea.a_aprobar,
        }))
        .filter(linea => linea.cantidad > 0);
};
