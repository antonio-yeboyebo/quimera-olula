import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoFactura, EstadoFactura } from "./diseño.ts";
import {
    abrirFactura,
    activarLinea,
    borrarFactura,
    borrarLinea,
    cambiarAgente,
    cambiarCantidadLinea,
    cambiarCliente,
    cambiarDescuento,
    cambiarDivisa,
    cambiarFactura,
    cambiarLinea,
    cancelarCambioFactura,
    cargarContexto,
    crearLinea,
    emitirFactura,
    getContextoVacio,
    refrescarFactura,
    refrescarLineas
} from "./dominio.ts";


export const getMaquina: () => Maquina<EstadoFactura, ContextoFactura> = () => {

    return {

        INICIAL: {

            factura_id_cambiado: [cargarContexto],

            factura_deseleccionada: [
                getContextoVacio,
                publicar('factura_deseleccionada', null)
            ]
        },

        ABIERTO: {

            linea_creada: [refrescarFactura, refrescarLineas],

            alta_linea_solicitada: "CREANDO_LINEA",

            baja_linea_solicitada: "BORRANDO_LINEA",

            cambio_linea_solicitado: "CAMBIANDO_LINEA",

            borrar_solicitado: "BORRANDO_FACTURA",

            emitir_solicitado: "EMITIENDO_FACTURA",

            cambio_cliente_solicitado: "CAMBIANDO_CLIENTE",

            cambio_divisa_solicitado: "CAMBIANDO_DIVISA",

            cambio_agente_solicitado: "CAMBIANDO_AGENTE",

            descuento_solicitado: "CAMBIANDO_DESCUENTO",

            factura_cargada: [abrirFactura],

            factura_cambiada: [refrescarFactura, "ABIERTO"],

            edicion_de_factura_lista: [cambiarFactura],

            edicion_de_factura_cancelada: [cancelarCambioFactura],

            linea_seleccionada: [activarLinea],

            cambio_cantidad_linea_solicitado: cambiarCantidadLinea,

            factura_deseleccionada: [
                getContextoVacio,
                publicar('factura_deseleccionada', null)
            ]
        },

        EMITIENDO_FACTURA: {

            emision_lista: [emitirFactura],

            emitir_cancelado: "ABIERTO",
        },

        BORRANDO_FACTURA: {

            borrado_de_factura_listo: [borrarFactura, "INICIAL"],

            borrar_cancelado: "ABIERTO",
        },

        CAMBIANDO_CLIENTE: {

            cambio_cliente_listo: [cambiarCliente],

            cambio_cliente_cancelado: "ABIERTO",
        },

        CAMBIANDO_DIVISA: {

            cambio_divisa_listo: [cambiarDivisa],

            cambio_divisa_cancelado: "ABIERTO",
        },

        CAMBIANDO_AGENTE: {

            cambio_agente_listo: [cambiarAgente],

            cambio_agente_cancelado: "ABIERTO",
        },

        CAMBIANDO_DESCUENTO: {

            descuento_aplicado: [cambiarDescuento],

            descuento_cancelado: "ABIERTO",
        },

        CREANDO_LINEA: {

            linea_creada: crearLinea,

            crear_linea_cancelado: "ABIERTO",
        },

        CAMBIANDO_LINEA: {

            linea_actualizada: cambiarLinea,

            editar_linea_cancelado: "ABIERTO",
        },

        BORRANDO_LINEA: {

            linea_borrada: borrarLinea,

            borrar_linea_cancelado: "ABIERTO",
        },

    }
}
