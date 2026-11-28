import { MetaModelo } from "@olula/lib/dominio.ts";
import { tAlmacen } from "../../../i18n/index.ts";

export type NuevaLineaOrden = {
    sku: string;
    cantidadPrevista: number;
    idUbicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
    pasosPick: string | null;
    pasosDrop: string | null;
};


const onNuevaLineaCambiada = (linea: NuevaLineaOrden, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "idCajaDestino" && otros) {

        const nuevoValor: NuevaLineaOrden = {
            ...linea,
            idUbicacionDestino: otros.idUbicacion as string,
            // codUbicacionDestino: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    else if (campo === "idCajaOrigen" && otros) {

        const nuevoValor: NuevaLineaOrden = {
            ...linea,
            idUbicacionOrigen: otros.idUbicacion as string,
            // codUbicacionOrigen: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    return linea
}


export const getMetaNuevaLineaOrden = (): MetaModelo<NuevaLineaOrden> => ({
    campos: {
        sku: {
            validacion: (linea) => {
                if (!linea.sku) return tAlmacen("orden.elSkuEsRequerido");
                return true;
            },
        },
        cantidadPrevista: {
            tipo: "numero",
            validacion: (linea) => {
                if (linea.cantidadPrevista === null || linea.cantidadPrevista === undefined) {
                    return tAlmacen("orden.laCantidadPrevistaEsRequerida");
                }
                return true;
            },
        },
        // Las ubicaciones y cajas obligatorias dependen del flujo elegido (pasos/flujos.ts).
        idUbicacionOrigen: {},
        idCajaOrigen: {},
        idUbicacionDestino: {},
        idCajaDestino: {},
        pasosPick: {},
        pasosDrop: {},
    },
    onChange: onNuevaLineaCambiada
});
