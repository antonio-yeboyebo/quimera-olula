import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { Modelo } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { tAlmacen } from "../../../../i18n/index.ts";

export interface ModeloLecturaUbicacionOrden extends Modelo {
    idUbicacion: string;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
}

export const getMetaLecturaUbicacionOrden = (tipo: TipoOrden): MetaModelo<ModeloLecturaUbicacionOrden> => ({
    campos: {
        idUbicacion: {
            validacion: (lectura) => {
                if (!lectura.idUbicacion) return tAlmacen("orden.laUbicacionEsRequerida");
                return true;
            },
        },
        idUbicacionDestino: {
            requerido: tipo === "TRASPASO",
        },
        idCajaDestino: {
        },
    },
});

export const getLecturaUbicacionOrdenVacia = (orden: OrdenAlmacen): ModeloLecturaUbicacionOrden => ({
    idUbicacion: "",
    idUbicacionDestino: orden.idUbicacionDestino,
    idCajaDestino: orden.idCajaDestino,
});
