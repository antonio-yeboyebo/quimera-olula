import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { ReciboVenta } from "../diseño.js";
import { enDivisaExtranjera } from "../dominio.js";
import { desagruparReciboVenta, getReciboVenta, patchDevolverReciboVenta, patchPagarReciboVenta } from "../infraestructura.js";
import { ContextoDetalleReciboVenta, EstadoDetalleReciboVenta } from "./diseño.js";
import { DevolucionRecibo } from "./devolver/diseño.js";
import { PagoRecibo } from "./pagar/diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleReciboVenta, ContextoDetalleReciboVenta>;

const pipeRecibo = ejecutarListaProcesos<EstadoDetalleReciboVenta, ContextoDetalleReciboVenta>;

export const metaReciboVenta: MetaModelo<ReciboVenta> = {
    campos: {
        codigo: { tipo: "texto" },
        estado: { tipo: "texto" },
        importe: { tipo: "moneda" },
        fechaEmision: { tipo: "fecha" },
        fechaVencimiento: { tipo: "fecha" },
        clienteId: { tipo: "texto" },
        nombreCliente: { tipo: "texto" },
        idFiscal: { tipo: "texto" },
        facturaId: { tipo: "texto" },
    },
    editable: () => false,
};

export const reciboVentaInicial = (): ReciboVenta => ({
    id: '',
    facturaId: '',
    grupoId: '',
    codigo: '',
    fechaEmision: null,
    fechaVencimiento: null,
    estado: '',
    importe: 0,
    clienteId: '',
    nombreCliente: '',
    idFiscal: '',
    divisaId: '',
    divisaEmpresaId: null,
    pagos: [],
    recibosAgrupados: [],
});

export const contextoDetalleReciboVentaInicial: ContextoDetalleReciboVenta = {
    estado: 'INICIAL',
    recibo: reciboVentaInicial(),
};

export const cargarReciboVenta: (_: string) => ProcesarDetalle =
    (idRecibo) => async (contexto) => {
        const recibo = await getReciboVenta(idRecibo);
        return pipeRecibo(contexto, [
            async (ctx) => ({ ...ctx, recibo }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idRecibo = payload as string;
    if (idRecibo) {
        return cargarReciboVenta(idRecibo)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', recibo: reciboVentaInicial() };
};

/** Publica el recibo cobrado para que el maestro refresque su fila. */
export const pagarRecibo: ProcesarDetalle = async (contexto, payload) => {
    const pago = payload as PagoRecibo;
    await patchPagarReciboVenta(contexto.recibo.id, {
        cuentaPagoId: pago.cuenta_pago_id,
        fecha: pago.fecha.toISOString().slice(0, 10),
        ...(enDivisaExtranjera(contexto.recibo) && { tasaConversion: pago.tasa_conversion }),
    });
    const recibo = await getReciboVenta(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};

/** La cuenta es la del último pago; el modal la muestra sin dejar cambiarla. */
export const devolverRecibo: ProcesarDetalle = async (contexto, payload) => {
    const devolucion = payload as DevolucionRecibo;
    await patchDevolverReciboVenta(contexto.recibo.id, {
        cuentaPagoId: devolucion.cuenta_pago_id,
        fecha: devolucion.fecha.toISOString().slice(0, 10),
        ...(enDivisaExtranjera(contexto.recibo) && { tasaConversion: devolucion.tasa_conversion }),
        reembolsarEnPasarela: devolucion.reembolsar_en_pasarela ?? false,
    });
    const recibo = await getReciboVenta(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};

export const desagruparRecibo: ProcesarDetalle = async (contexto) => {
    const idGrupo = contexto.recibo.id;
    await desagruparReciboVenta(idGrupo);

    return [
        { ...contexto, estado: 'INICIAL', recibo: reciboVentaInicial() },
        [["recibo_desagrupado", idGrupo]],
    ];
};
