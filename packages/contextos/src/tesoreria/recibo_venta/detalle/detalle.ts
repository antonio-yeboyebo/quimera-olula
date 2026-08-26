import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { ReciboVenta } from "../diseño.js";
import { getReciboVenta, patchPagarReciboVenta } from "../infraestructura.js";
import { ContextoDetalleReciboVenta, EstadoDetalleReciboVenta } from "./diseño.js";
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
        idFiscal: { tipo: "texto" },
        facturaId: { tipo: "texto" },
    },
    editable: () => false,
};

export const reciboVentaInicial = (): ReciboVenta => ({
    id: '',
    facturaId: '',
    codigo: '',
    fechaEmision: null,
    fechaVencimiento: null,
    estado: '',
    importe: 0,
    clienteId: '',
    idFiscal: '',
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
    });
    const recibo = await getReciboVenta(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};
