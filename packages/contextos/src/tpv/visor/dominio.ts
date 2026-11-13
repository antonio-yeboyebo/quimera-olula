import { redondeaMoneda } from "@olula/lib/dominio.ts";
import { LineaFactura, VentaTpv } from "../venta/diseño.ts";
import { EstadoVisor, MensajeVisor, MetodoCobroVisor, VentaVisor } from "./diseño.ts";

export const estadoVisorVacio: EstadoVisor = { venta: null, cobro: null, pagado: null };

/** Tiempo que se queda en pantalla el "Pago recibido" antes de volver a la espera. */
export const DURACION_PAGADO_MS = 6000;

const METODOS_POR_ESTADO: Record<string, MetodoCobroVisor> = {
    PAGANDO_EN_EFECTIVO: "efectivo",
    PAGANDO_CON_TARJETA: "tarjeta",
    PAGANDO_CON_VALE: "vale",
    PAGANDO_CON_QR: "qr",
};

export const metodoCobroDeEstado = (estado: string): MetodoCobroVisor | null =>
    METODOS_POR_ESTADO[estado] ?? null;

/** El cliente ve precios finales: si la línea no lleva el IVA incluido, se le suma (y el recargo). */
const conImpuestos = (linea: LineaFactura, importe: number, divisaId: string): number =>
    linea.iva_incluido
        ? importe
        : redondeaMoneda(importe * (1 + ((linea.tipo_iva ?? 0) + (linea.tipo_recargo ?? 0)) / 100), divisaId);

export const ventaVisorDesdeVenta = (venta: VentaTpv, lineas: LineaFactura[]): VentaVisor => ({
    id: venta.id,
    codigo: venta.codigo,
    divisaId: venta.divisa_id,
    lineas: lineas.map((l) => ({
        id: l.id,
        descripcion: l.descripcionArticulo || l.descripcion || l.referencia || "",
        cantidad: l.cantidad,
        pvpUnitario: conImpuestos(l, l.pvp_unitario, venta.divisa_id),
        dtoPorcentual: l.dto_porcentual,
        total: conImpuestos(l, l.pvp_total, venta.divisa_id),
    })),
    total: venta.total,
    pagado: venta.pagado,
    pendiente: venta.pendiente,
});

export const cambioDeEfectivo = (estado: EstadoVisor): number => {
    const { venta, cobro } = estado;
    if (!venta || cobro?.metodo !== "efectivo" || cobro.entregado === undefined) return 0;
    const cambio = redondeaMoneda(cobro.entregado - venta.pendiente, venta.divisaId);
    return cambio > 0 ? cambio : 0;
};

/** Aplica al estado del visor un mensaje del TPV. Pura: sirve igual en el TPV y en el visor. */
export const aplicarMensajeVisor = (estado: EstadoVisor, mensaje: MensajeVisor): EstadoVisor => {
    switch (mensaje.tipo) {
        case "venta": {
            const { venta, metodo } = mensaje;
            // Tras cobrar llega la venta ya pagada: el agradecimiento sigue en pantalla.
            const sigueElPagado = estado.pagado?.ventaId === venta.id && venta.pendiente === 0;
            const mismoCobro = estado.cobro && estado.cobro.metodo === metodo && estado.venta?.id === venta.id;
            return {
                venta,
                cobro: metodo ? (mismoCobro ? estado.cobro : { metodo }) : null,
                pagado: sigueElPagado ? estado.pagado : null,
            };
        }
        case "entregado":
            // Puede llegar antes que la venta con método "efectivo" (el modal monta primero).
            return { ...estado, cobro: { metodo: "efectivo", entregado: mensaje.importe } };
        case "qr":
            return {
                ...estado,
                cobro: { metodo: "qr", qr: { url: mensaje.url, modo: mensaje.modo } },
                pagado: null,
            };
        case "pagado":
            return {
                ...estado,
                cobro: null,
                pagado: {
                    ventaId: mensaje.ventaId,
                    importe: mensaje.importe,
                    divisaId: mensaje.divisaId,
                    cambio: cambioDeEfectivo(estado),
                },
            };
        case "limpiar":
            return estadoVisorVacio;
        case "estado":
            return mensaje.estado;
        case "solicitar_estado":
            return estado;
    }
};
