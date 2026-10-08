import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import {
    cargarContexto,
    Lineas,
    onCajaCreada,
    onLineaBorrada,
    onLineaCambiada,
    onLineaCreada,
    onOrdenTerminada,
    refrescarOrden,
} from "./detalle.ts";

export type EstadoOrdenAlmacen =
    | 'INICIAL'
    | 'ABIERTA'
    | 'BORRANDO'
    | 'TERMINANDO'
    | 'CREANDO_LINEA'
    | 'CAMBIANDO_LINEA'
    | 'BORRANDO_LINEA'
    | 'LEYENDO_LINEA'
    | 'LEYENDO_CAJA'
    | 'LEYENDO_UBICACION'
    | 'LEYENDO_GUION_LINEA'
    | 'CREANDO_CAJA'
    | 'LEYENDO_CAJAS_ENTRADA'
    | 'LEYENDO_CAJAS_COLOCACION'
    | 'LEYENDO_PALET_ENTRADA'
    | 'COLOCANDO';

export type ContextoOrdenAlmacen = {
    estado: EstadoOrdenAlmacen;
    orden: OrdenAlmacen;
    lineas: ListaEntidades<LineaOrdenAlmacen>;
};

export const getMaquina: () => Maquina<EstadoOrdenAlmacen, ContextoOrdenAlmacen> = () => {
    return {
        INICIAL: {
            orden_id_cambiada: [cargarContexto],
        },

        ABIERTA: {
            orden_guardada: [refrescarOrden],
            lectura_registrada: [refrescarOrden],
            borrado_solicitado: "BORRANDO",
            terminado_solicitado: "TERMINANDO",
            orden_id_cambiada: [cargarContexto],
            alta_linea_solicitada: "CREANDO_LINEA",
            cambio_linea_solicitado: "CAMBIANDO_LINEA",
            baja_linea_solicitada: "BORRANDO_LINEA",
            linea_seleccionada: [Lineas.activar],
            lectura_solicitada: "LEYENDO_LINEA",
            lectura_caja_solicitada: "LEYENDO_CAJA",
            lectura_ubicacion_solicitada: "LEYENDO_UBICACION",
            lectura_guion_solicitada: "LEYENDO_GUION_LINEA",
            lectura_guion_linea_solicitada: [Lineas.activar, "LEYENDO_GUION_LINEA"],
            creacion_de_caja_solicitada: "CREANDO_CAJA",
            lectura_cajas_entrada_solicitada: "LEYENDO_CAJAS_ENTRADA",
            lectura_cajas_colocacion_solicitada: "LEYENDO_CAJAS_COLOCACION",
            lectura_palet_entrada_solicitada: "LEYENDO_PALET_ENTRADA",
            colocacion_solicitada: "COLOCANDO",
        },

        BORRANDO: {
            orden_borrada: [
                publicar('orden_borrada', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTA",
        },

        TERMINANDO: {
            orden_terminada: [onOrdenTerminada, "ABIERTA"],
            terminado_cancelado: "ABIERTA",
        },

        CREANDO_LINEA: {
            linea_creada: [onLineaCreada, "ABIERTA"],
            alta_de_linea_cancelada: "ABIERTA",
        },

        CAMBIANDO_LINEA: {
            linea_cambiada: [onLineaCambiada, "ABIERTA"],
            cambio_de_linea_cancelado: "ABIERTA",
        },

        BORRANDO_LINEA: {
            linea_borrada: [onLineaBorrada, "ABIERTA"],
            borrado_de_linea_cancelado: "ABIERTA",
        },

        LEYENDO_LINEA: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_cancelada: "ABIERTA",
        },

        LEYENDO_CAJA: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_caja_cancelada: "ABIERTA",
        },

        LEYENDO_UBICACION: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_ubicacion_cancelada: "ABIERTA",
        },

        LEYENDO_GUION_LINEA: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_guion_cancelada: "ABIERTA",
        },

        CREANDO_CAJA: {
            caja_creada: [onCajaCreada, "ABIERTA"],
            alta_de_caja_cancelada: "ABIERTA",
        },

        LEYENDO_CAJAS_ENTRADA: {
            lectura_registrada: [refrescarOrden],
            lectura_cajas_entrada_cancelada: [refrescarOrden, "ABIERTA"],
        },

        LEYENDO_CAJAS_COLOCACION: {
            lectura_registrada: [refrescarOrden],
            lectura_cajas_colocacion_cancelada: [refrescarOrden, "ABIERTA"],
        },

        LEYENDO_PALET_ENTRADA: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_palet_entrada_cancelada: "ABIERTA",
        },

        COLOCANDO: {
            colocacion_creada: [refrescarOrden, "ABIERTA"],
            colocacion_cancelada: "ABIERTA",
        },
    };
};
