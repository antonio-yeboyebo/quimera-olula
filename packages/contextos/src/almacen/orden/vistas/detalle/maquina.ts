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
    refrescarOrdenConCierre,
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
    | 'LEYENDO_GUION_PICK_LINEA'
    | 'LEYENDO_GUION_DROP_LINEA'
    | 'DEVOLVIENDO_SOBRANTE'
    | 'CREANDO_CAJA'
    | 'LEYENDO_PICK'
    | 'LEYENDO_DROP'
    | 'COLOCANDO'
    | 'ALBARANANDO'
    | 'GENERANDO_ENVIO';

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
            lectura_guion_pick_linea_solicitada: [Lineas.activar, "LEYENDO_GUION_PICK_LINEA"],
            lectura_guion_drop_linea_solicitada: [Lineas.activar, "LEYENDO_GUION_DROP_LINEA"],
            creacion_de_caja_solicitada: "CREANDO_CAJA",
            lectura_pick_solicitada: "LEYENDO_PICK",
            lectura_drop_solicitada: "LEYENDO_DROP",
            colocacion_solicitada: "COLOCANDO",
            albaranado_solicitado: "ALBARANANDO",
            envio_solicitado: "GENERANDO_ENVIO",
            devolucion_sobrante_solicitada: [Lineas.activar, "DEVOLVIENDO_SOBRANTE"],
        },

        DEVOLVIENDO_SOBRANTE: {
            sobrante_devuelto: [refrescarOrden, "ABIERTA"],
            devolucion_sobrante_cancelada: "ABIERTA",
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

        LEYENDO_GUION_PICK_LINEA: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_guion_cancelada: "ABIERTA",
        },

        LEYENDO_GUION_DROP_LINEA: {
            lectura_registrada: [refrescarOrden, "ABIERTA"],
            lectura_guion_cancelada: "ABIERTA",
        },

        CREANDO_CAJA: {
            caja_creada: [onCajaCreada, "ABIERTA"],
            alta_de_caja_cancelada: "ABIERTA",
        },

        LEYENDO_PICK: {
            lectura_registrada: [refrescarOrdenConCierre],
            lectura_pick_cancelada: [refrescarOrden, "ABIERTA"],
        },

        LEYENDO_DROP: {
            lectura_registrada: [refrescarOrden],
            lectura_drop_cancelada: [refrescarOrden, "ABIERTA"],
        },

        COLOCANDO: {
            colocacion_creada: [refrescarOrden, "ABIERTA"],
            colocacion_cancelada: "ABIERTA",
        },

        ALBARANANDO: {
            orden_albaranada: [refrescarOrden, "ABIERTA"],
            albaranado_cancelado: "ABIERTA",
        },

        GENERANDO_ENVIO: {
            envio_generado: [refrescarOrden, "ABIERTA"],
            envio_cancelado: "ABIERTA",
        },
    };
};
