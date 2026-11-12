import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { abiertaOEmitidaContexto, cambiarDescuento, cambiarVenta, cargarContexto, ContextoVentaTpv, crearLineaPorBarcode, emitirVale, EstadoVentaTpv, getContextoVacio, Lineas, onLineaBorrada, onLineaCambiada, onLineaCreada, onVentaBorrada, Pagos, refrescarCabecera, refrescarLineas, refrescarPagos } from "./detalle.ts";


export const getMaquina: () => Maquina<EstadoVentaTpv, ContextoVentaTpv> = () => {

    return {

        INICIAL: {

            venta_id_cambiada: [cargarContexto],

            venta_deseleccionada: [
                getContextoVacio,
                publicar('venta_deselaccionada', null)
            ]
        },

        ABIERTA: {

            linea_creada: [
                refrescarCabecera,
                refrescarLineas
            ],

            alta_linea_solicitada: "CREANDO_LINEA",

            baja_linea_solicitada: "BORRANDO_LINEA",

            cambio_cliente_solicitado: "CAMBIANDO_CLIENTE",

            descuento_solicitado: "CAMBIANDO_DESCUENTO",

            cambio_linea_solicitado: "CAMBIANDO_LINEA",

            borrar_solicitado: "BORRANDO_VENTA",

            devolucion_solicitada: "DEVOLVIENDO_VENTA",

            emision_solicitada: "EMITIENDO_VENTA",

            emision_de_vale_solicitada: emitirVale,

            pago_efectivo_solicitado: "PAGANDO_EN_EFECTIVO",

            pago_vale_solicitado: "PAGANDO_CON_VALE",

            pago_tarjeta_solicitado: "PAGANDO_CON_TARJETA",

            pago_qr_solicitado: "PAGANDO_CON_QR",

            borrar_pago_solicitado: "BORRANDO_PAGO",

            venta_cargada: [abiertaOEmitidaContexto],

            venta_cambiada: [refrescarCabecera],

            venta_guardada: [refrescarCabecera],

            edicion_de_venta_lista: [cambiarVenta],

            // edicion_de_venta_cancelada: [cancelarcambioVenta],

            pago_seleccionado: [Pagos.activar],

            linea_seleccionada: [Lineas.activar],

            alta_de_linea_por_barcode_lista: crearLineaPorBarcode,
        },

        CAMBIANDO_CLIENTE: {

            cliente_cambiado: [refrescarCabecera, refrescarLineas, "ABIERTA"],

            cambio_cliente_cancelado: "ABIERTA",
        },

        CAMBIANDO_DESCUENTO: {

            descuento_aplicado: [cambiarDescuento],

            descuento_cancelado: "ABIERTA",
        },

        EMITIDA: {

            venta_cargada: [abiertaOEmitidaContexto],

            pago_seleccionado: [Pagos.activar],

            linea_seleccionada: [Lineas.activar],

            tique_regalo_solicitado: "GENERANDO_TIQUE_REGALO",

            pago_efectivo_solicitado: "PAGANDO_EN_EFECTIVO",

            pago_vale_solicitado: "PAGANDO_CON_VALE",

            pago_tarjeta_solicitado: "PAGANDO_CON_TARJETA",

            pago_qr_solicitado: "PAGANDO_CON_QR",

            borrar_pago_solicitado: "BORRANDO_PAGO",
        },

        BORRANDO_VENTA: {

            venta_borrada: onVentaBorrada,

            borrado_de_venta_cancelado: "ABIERTA",
        },

        EMITIENDO_VENTA: {

            emision_confirmada: [refrescarCabecera, abiertaOEmitidaContexto],

            emision_cancelada: "ABIERTA",
        },

        PAGANDO_EN_EFECTIVO: {

            // pago_en_efectivo_listo: pagarEnEfectivo,
            pago_en_efectivo_hecho: [
                refrescarCabecera,
                refrescarPagos,
                abiertaOEmitidaContexto,
            ],

            pago_cancelado: [abiertaOEmitidaContexto],
        },

        PAGANDO_CON_VALE: {

            // pago_con_vale_listo: pagarConVale,
            pago_con_vale_hecho: [
                refrescarCabecera,
                refrescarPagos,
                abiertaOEmitidaContexto,
            ],

            pago_cancelado: [abiertaOEmitidaContexto],
        },

        PAGANDO_CON_TARJETA: {

            // pago_con_tarjeta_listo: pagarConTarjeta,
            pago_con_tarjeta_hecho: [
                refrescarCabecera,
                refrescarPagos,
                abiertaOEmitidaContexto,
            ],

            pago_cancelado: [abiertaOEmitidaContexto],
        },

        PAGANDO_CON_QR: {

            // El pago lo crea el servidor al recibir el aviso de Stripe.
            pago_con_qr_hecho: [
                refrescarCabecera,
                refrescarPagos,
                abiertaOEmitidaContexto,
            ],

            pago_cancelado: [abiertaOEmitidaContexto],
        },

        BORRANDO_PAGO: {

            pago_borrado: [Pagos.quitar, refrescarCabecera, abiertaOEmitidaContexto],

            borrado_de_pago_cancelado: [abiertaOEmitidaContexto],
        },

        DEVOLVIENDO_VENTA: {

            // devolucion_lista: devolverVenta,
            devolucion_hecha: [refrescarCabecera, refrescarLineas, "ABIERTA"],

            devolucion_cancelada: "ABIERTA",
        },

        GENERANDO_TIQUE_REGALO: {

            tique_regalo_generado: "EMITIDA",

            tique_regalo_cancelado: "EMITIDA",
        },

        CREANDO_LINEA: {

            // alta_de_linea_lista: crearLinea,
            linea_creada: [onLineaCreada, "ABIERTA"],

            alta_de_linea_cancelada: "ABIERTA",
        },

        CAMBIANDO_LINEA: {

            // cambio_de_linea_listo: cambiarLinea,
            linea_cambiada: [onLineaCambiada, "ABIERTA"],

            cambio_de_linea_cancelado: "ABIERTA",
        },

        BORRANDO_LINEA: {

            // borrado_de_linea_listo: borrarLinea,
            linea_borrada: [onLineaBorrada, "ABIERTA"],

            borrado_de_linea_cancelado: "ABIERTA",
        },
    }
}