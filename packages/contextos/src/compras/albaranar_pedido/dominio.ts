import { tCompras } from "#/compras/i18n/index.ts";
import { LineaPedido } from "#/compras/pedido/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { AlbaranarPedido, LineaAlbaranar, LoteAlbaranar } from "./diseño.ts";

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
        recibiendo: { tipo: "numero", positivo: true },
        lotes: { itemMeta: metaLote },
    },
    editable: (linea: LineaAlbaranar, campo?: string) => {
        if (campo === "recibiendo") return !linea.porLotes;
        return true;
    },
};

export const metaAlbaranarPedido: MetaModelo<AlbaranarPedido> = {
    campos: {
        lineas: { itemMeta: metaLinea },
    },
    validacion: (modelo: AlbaranarPedido) => {
        const hayAlgunaRecibiendo = modelo.lineas.some((l) => calcularRecibiendo(l) > 0);
        return hayAlgunaRecibiendo ? true : tCompras("albaranarPedido.sinCantidad");
    },
};

// ---------------------------------------------------------------------------
// Funciones puras
// ---------------------------------------------------------------------------

export const calcularRecibiendo = (linea: LineaAlbaranar): number => {
    if (linea.porLotes) {
        return linea.lotes.reduce((acc, lote) => acc + (lote.cantidad ?? 0), 0);
    }
    return linea.recibiendo;
};

export const lineaDesdeLineaPedido = (l: LineaPedido): LineaAlbaranar => ({
    idLinea: l.id,
    sku: l.referencia ?? "",
    descripcion: l.descripcion,
    cantidad: l.cantidad,
    recibida: l.cantidadRecibida,
    pendiente: l.cantidad,
    recibiendo: 0,
    cerrada: false,
    porLotes: l.porLotes,
    lotes: [],
});

export const marcarTodasPendientes = (modelo: AlbaranarPedido): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) => {
        if (l.porLotes || l.cerrada) return l;
        return { ...l, recibiendo: Math.max(0, l.cantidad - l.recibida) };
    }),
});

export const setRecibiendoLinea = (
    modelo: AlbaranarPedido,
    idLinea: string,
    recibiendo: number
): AlbaranarPedido => ({
    ...modelo,
    lineas: modelo.lineas.map((l) =>
        l.idLinea === idLinea ? { ...l, recibiendo } : l
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
        return { ...l, lotes, recibiendo: lotes.reduce((acc, lt) => acc + lt.cantidad, 0) };
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
        return { ...l, lotes, recibiendo: lotes.reduce((acc, lt) => acc + lt.cantidad, 0) };
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
        return { ...l, lotes, recibiendo: lotes.reduce((acc, lt) => acc + lt.cantidad, 0) };
    }),
});
