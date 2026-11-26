import { LineaPedido } from "#/ventas/pedido/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { AlbaranarPedido, LineaAlbaranar, LoteAlbaranar } from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

// ---------------------------------------------------------------------------
// MetaModelo
// ---------------------------------------------------------------------------

export const metaLote: MetaModelo<LoteAlbaranar> = {
    campos: {
        idLote: { requerido: true },
        cantidad: { tipo: "numero", requerido: true, positivo: true },
    },
};

export const metaLinea: MetaModelo<LineaAlbaranar> = {
    campos: {
        enviada: { tipo: "numero", positivo: true },
        lotes: { itemMeta: metaLote },
    },
    editable: (linea: LineaAlbaranar, campo?: string) => {
        if (campo === "enviada") return !linea.porLotes;
        return true;
    },
};

export const metaAlbaranarPedido: MetaModelo<AlbaranarPedido> = {
    campos: {
        lineas: { itemMeta: metaLinea },
    },
    validacion: (modelo: AlbaranarPedido) => {
        const hayAlgunaEnviada = modelo.lineas.some((l) => calcularEnviada(l) > 0);
        return hayAlgunaEnviada ? true : tVentas("pedido.albaranar.algunaEnviada");
    },
};

// ---------------------------------------------------------------------------
// Funciones puras
// ---------------------------------------------------------------------------

export const calcularEnviada = (linea: LineaAlbaranar): number => {
    if (linea.porLotes) {
        return linea.lotes.reduce((acc, lote) => acc + (lote.cantidad ?? 0), 0);
    }
    return linea.enviada;
};

export const lineaDesdeLineaPedido = (l: LineaPedido): LineaAlbaranar => ({
    idLinea: l.id,
    sku: l.referencia ?? "",
    descripcion: l.descripcion,
    pvpTotal: l.pvp_total,
    cantidad: l.cantidad,
    servida: l.servida,
    pendiente: l.cantidad,
    enviada: 0,
    cerrada: false,
    porLotes: l.porLotes,
    lotes: [],
});

export const marcarTodasPendientes = (modelo: AlbaranarPedido): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) => {
        if (l.porLotes || l.cerrada) return l;
        return { ...l, enviada: Math.max(0, l.cantidad - l.servida) };
    }),
});

export const setEnviadaLinea = (
    modelo: AlbaranarPedido,
    idLinea: string,
    enviada: number
): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) =>
        l.idLinea === idLinea ? { ...l, enviada } : l
    ),
});

export const setCerradaLinea = (
    modelo: AlbaranarPedido,
    idLinea: string,
    cerrada: boolean
): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) =>
        l.idLinea === idLinea ? { ...l, cerrada } : l
    ),
});

export const addLoteLinea = (
    modelo: AlbaranarPedido,
    idLinea: string,
    lote: LoteAlbaranar
): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) => {
        if (l.idLinea !== idLinea) return l;
        const lotes = [...l.lotes, lote];
        return { ...l, lotes, enviada: lotes.reduce((acc, lt) => acc + lt.cantidad, 0) };
    }),
});

export const updateLoteLinea = (
    modelo: AlbaranarPedido,
    idLinea: string,
    lote: LoteAlbaranar
): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) => {
        if (l.idLinea !== idLinea) return l;
        const lotes = l.lotes.map((lt) => (lt.idLote === lote.idLote ? lote : lt));
        return { ...l, lotes, enviada: lotes.reduce((acc, lt) => acc + lt.cantidad, 0) };
    }),
});

export const removeLoteLinea = (
    modelo: AlbaranarPedido,
    idLinea: string,
    idLote: string
): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) => {
        if (l.idLinea !== idLinea) return l;
        const lotes = l.lotes.filter((lt) => lt.idLote !== idLote);
        return { ...l, lotes, enviada: lotes.reduce((acc, lt) => acc + lt.cantidad, 0) };
    }),
});
