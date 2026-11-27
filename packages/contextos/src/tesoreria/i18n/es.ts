/**
 * Textos del contexto Tesorería (namespace `tesoreria`). Referencia: español.
 * Una rama por módulo; las plantillas llevan `{{dato}}`.
 */
export const es = {
    comun: {
        seBorraraValorDelValor2Del: "Se borrará {{valor}} del {{valor2}} del recibo {{codigo}}, con su asiento contable.",
        laDevolucion: "la devolución",
        elPago: "el pago",
        elReciboVuelveAlEstadoQue: "El recibo vuelve al estado que tenía antes.",
        anularUltimoPagoODevolucion: "Anular último pago o devolución",
        anular: "Anular",
        laFechaDeVencimientoDebeSer: "La fecha de vencimiento debe ser igual o posterior a la de emisión",
        soloSePuedeBajarElImporte: "Solo se puede bajar el importe: la diferencia pasa a un recibo nuevo",
        editarReciboCodigo: "Editar recibo {{codigo}}",
        fechaDeVencimiento: "Fecha de vencimiento",
        cuentaDeDomiciliacion: "Cuenta de domiciliación",
        sinCuenta: "(sin cuenta)",
        importe: "Importe",
        guardar: "Guardar",
        subcuenta: "Subcuenta",
        enviaElDinero: "Envía el dinero",
        recibeElDinero: "Recibe el dinero",
        referencia: "Referencia",
        cuentaBancaria: "Cuenta bancaria",
        conectarBanco: "Conectar banco",
        errorDelBanco: "Error del banco",
        textoCodigoCode: "{{texto}} (código {{code}})",
    },
    estados: {
        emitido: "Emitido",
        pagado: "Pagado",
        devuelto: "Devuelto",
        agrupado: "Agrupado",
        remesado: "Remesado",
        emitida: "Emitida",
        pagada: "Pagada",
        recibos: "Recibos",
        nominas: "Nóminas",
    },
} as const;
