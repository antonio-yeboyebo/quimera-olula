import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { Modelo } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { tAlmacen } from "../../../../i18n/index.ts";

export interface ModeloLecturaOrden extends Modelo {
    cantidad: number;
    sku: string;
    articulo: string;
    idLote: string | null;
    idCajaDestino: string | null;
    idUbicacionDestino: string | null;
    idCajaOrigen: string | null;
    idUbicacionOrigen: string | null;
}

export const getMetaLecturaOrden = (tipo: TipoOrden): MetaModelo<ModeloLecturaOrden> => ({
    campos: {
        sku: {
            validacion: (lectura) => {
                if (!lectura.sku) return tAlmacen("orden.elSkuEsRequerido");
                return true;
            },
        },
        cantidad: {
            tipo: "numero",
            validacion: (lectura) => {
                if (!lectura.cantidad) return tAlmacen("orden.laCantidadEsRequerida");
                return true;
            },
        },
        idUbicacionDestino: {
            requerido: tipo !== "SALIDA",
        },
        idUbicacionOrigen: {
            requerido: tipo !== "ENTRADA",
        },
    },
    onChange: (lectura, campo, _, otros) => {
        if (campo === "idCajaDestino" && otros) {

            const nuevoValor: ModeloLecturaOrden = {
                ...lectura,
                idUbicacionDestino: otros.idUbicacion as string,
                codUbicacionDestino: otros.codUbicacion as string,
            }
            return nuevoValor
        }
        return lectura
    }
});

export const getLecturaOrdenVacia = (orden: OrdenAlmacen): ModeloLecturaOrden => ({
    cantidad: 1,
    sku: "",
    articulo: "",
    idLote: null,
    idUbicacionDestino: orden.idUbicacionDestino,
    idCajaDestino: orden.idCajaDestino,
    // codUbicacionDestino: orden.codUbicacionDestino,
    idCajaOrigen: orden.idCajaOrigen,
    idUbicacionOrigen: orden.idUbicacionOrigen,
    // codUbicacionOrigen: orden.codUbicacionOrigen,
});
