import { LineaOrdenAlmacen, NuevaLecturaCajaOrden, NuevaLecturaOrden, OrdenAlmacen } from "../diseño.ts";
import { definicionDeLinea, tieneFaseDrop } from "./catalogo.ts";
import {
    CajaResuelta,
    CodigoResuelto,
    ContextoLectura,
    DefinicionPasos,
    DimensionLectura,
    FaseLectura,
    ResultadoAplicar,
    TipoCodigo,
    ValoresLectura,
} from "./diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

const error = (mensaje: string): ResultadoAplicar => ({ ok: false, error: mensaje });
const ok = (valores: ValoresLectura): ResultadoAplicar => ({ ok: true, valores });

// ---------------------------------------------------------------------------
// Cantidades de la línea
// ---------------------------------------------------------------------------

/**
 * Cantidad ya hecha en la fase. En el pick de una línea que también tiene drop,
 * lo dejado en destino cuenta como recogido (el backend descuenta del pick al dejar).
 */
export const cantidadHecha = (
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    fase: FaseLectura,
): number => {
    const real = linea.cantidadReal ?? 0;
    if (fase === "DROP") return real;
    if (definicionDeLinea(linea, orden, "PICK")?.directo) return real;
    const pick = linea.cantidadPick ?? 0;
    return tieneFaseDrop(linea, orden) ? pick + real : pick;
};

export const cantidadPendiente = (
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    fase: FaseLectura,
): number => linea.cantidadPrevista - cantidadHecha(linea, orden, fase);

const lineaPendiente = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen, fase: FaseLectura) =>
    cantidadPendiente(linea, orden, fase) > 0;

/** Líneas pendientes en la fase que tienen pasos definidos. */
export const lineasPendientes = (orden: OrdenAlmacen, fase: FaseLectura): LineaOrdenAlmacen[] =>
    orden.lineas.filter((l) => !!definicionDeLinea(l, orden, fase) && lineaPendiente(l, orden, fase));

// ---------------------------------------------------------------------------
// Dimensiones pendientes
// ---------------------------------------------------------------------------

const origenCompleto = (def: DefinicionPasos, linea: LineaOrdenAlmacen, v: ValoresLectura): boolean => {
    switch (def.origen) {
        case null:
        case "LINEA":
            return true;
        case "CAJA":
            return !!v.idCajaOrigen;
        case "UBI":
            return v.idUbicacionOrigen !== undefined;
        case "UBI_O_CAJA":
            if (v.idCajaOrigen === undefined) return false;
            return v.idCajaOrigen !== null || !!(v.idUbicacionOrigen ?? linea.idUbicacionOrigen);
    }
};

const queCompleto = (def: DefinicionPasos, linea: LineaOrdenAlmacen, v: ValoresLectura): boolean => {
    if (v.palet || def.que === "LINEA") return true;
    if (v.lotesParaElegir) return false;
    if (def.que === "CAJA") return !!v.sku;
    return !!v.sku && (!linea.porLotes || !!v.loteId);
};

const destinoCompleto = (def: DefinicionPasos, v: ValoresLectura): boolean => {
    switch (def.destino) {
        case "NINGUNO":
        case "LINEA":
            return true;
        case "CAJA":
            return !!v.palet || !!v.idCajaDestino;
        case "CAJA_ETIQUETA":
            return !!v.idCajaDestino;
        case "UBI":
        case "UBI_O_CAJA":
            return v.idUbicacionDestino !== undefined;
    }
};

/**
 * Dimensiones que quedan por completar, en el orden en que se piden.
 * Sin línea (palé leído en cabecera) solo puede faltar el destino.
 */
export const dimensionesPendientes = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen | null,
    v: ValoresLectura,
): DimensionLectura[] => {
    const pendientes: DimensionLectura[] = [];
    if (linea && !v.palet) {
        if (!origenCompleto(def, linea, v)) pendientes.push("origen");
        if (!queCompleto(def, linea, v)) pendientes.push("que");
        if (def.cantidad === "LEER" && v.cantidad === undefined) pendientes.push("cantidad");
    }
    if (!destinoCompleto(def, v)) pendientes.push("destino");
    return pendientes;
};

/** Tipos de código que se aceptan al leer una dimensión. */
export const tiposAceptados = (
    def: DefinicionPasos,
    dimension: DimensionLectura,
    v: ValoresLectura = {},
): TipoCodigo[] => {
    switch (dimension) {
        case "origen":
            if (def.origen === "CAJA") return ["caja"];
            if (def.origen === "UBI") return ["ubicacion"];
            if (def.origen === "UBI_O_CAJA") return v.idCajaOrigen === null ? ["ubicacion"] : ["caja", "articulo"];
            return [];
        case "que":
            return def.que === "CAJA" ? ["caja"] : ["articulo"];
        case "destino":
            if (def.destino === "UBI") return ["ubicacion"];
            if (def.destino === "CAJA" || def.destino === "CAJA_ETIQUETA") return ["caja"];
            if (def.destino === "UBI_O_CAJA") return ["caja", "ubicacion"];
            return [];
        case "cantidad":
            return [];
    }
};

/** Texto que se muestra (y se dice en modo voz) para pedir una dimensión. */
export const instruccionDimension = (
    def: DefinicionPasos,
    dimension: DimensionLectura,
    v: ValoresLectura = {},
): string => {
    switch (dimension) {
        case "origen":
            if (def.origen === "UBI" || (def.origen === "UBI_O_CAJA" && v.idCajaOrigen === null)) {
                return tAlmacen("orden.leeLaUbicacionDeOrigen");
            }
            if (def.origen === "UBI_O_CAJA") {
                return def.que === "LOTE" ? tAlmacen("orden.leeLaCajaOElLote2") : tAlmacen("orden.leeLaCajaOElSku2");
            }
            return def.cantidad === "CAPACIDAD_SUBCAJA" ? tAlmacen("orden.leeElPaleDeOrigen") : tAlmacen("orden.leeLaCajaDeOrigen");
        case "que":
            if (v.lotesParaElegir) return tAlmacen("orden.laCajaTieneVariosLotesElige");
            if (def.que === "CAJA") return def.palet ? tAlmacen("orden.leeLaCajaOElPale") : tAlmacen("orden.leeLaCaja2");
            if (def.que === "LOTE" || v.sku) return tAlmacen("orden.leeElLote");
            return tAlmacen("orden.leeElSkuOElLote2");
        case "cantidad":
            return tAlmacen("orden.indicaLaCantidad");
        case "destino":
            if (def.destino === "CAJA_ETIQUETA") return tAlmacen("orden.leeLaNuevaCajaEtiqueta");
            if (def.destino === "CAJA") return def.palet ? tAlmacen("orden.leeLaCajaOElPale") : tAlmacen("orden.leeLaCajaDeDestino");
            if (def.destino === "UBI") return tAlmacen("orden.leeLaUbicacionDeDestino");
            return tAlmacen("orden.leeLaUbicacionMaterialSueltoO");
    }
};

// ---------------------------------------------------------------------------
// Validaciones comunes
// ---------------------------------------------------------------------------

/** La caja ya está ligada a la línea: es su caja prevista o se leyó en otra lectura de la línea. */
export const cajaVinculadaALinea = (linea: LineaOrdenAlmacen, cajaId: string): boolean =>
    linea.idCajaOrigen === cajaId ||
    linea.idCajaDestino === cajaId ||
    linea.lecturas.some((l) => l.idCajaOrigen === cajaId || l.idCajaDestino === cajaId);

const errorCajaContraMaterial = (
    caja: CajaResuelta,
    sku: string,
    loteId: string | null | undefined,
): string | null => {
    if (caja.sku && caja.sku !== sku) return tAlmacen("orden.laCajaLpnContieneOtroArticulo", { lpn: caja.lpn, sku: caja.sku });
    if (caja.idLote && loteId && caja.idLote !== loteId) {
        return tAlmacen("orden.laCajaLpnContieneOtroLote", { lpn: caja.lpn, idLote: caja.idLote });
    }
    return null;
};

const aplicarArticulo = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen,
    v: ValoresLectura,
    codigo: Extract<CodigoResuelto, { tipo: "articulo" }>,
): ResultadoAplicar => {
    if (codigo.sku !== linea.sku) {
        return error(tAlmacen("orden.elArticuloSkuNoCorrespondeA", { sku: codigo.sku, sku2: linea.sku }));
    }
    if (v.sku && v.sku !== codigo.sku) return error(tAlmacen("orden.seEsperabaElLoteDelArticulo", { sku: v.sku }));
    if (def.que === "LOTE" && !codigo.loteId && !v.loteId) return error(tAlmacen("orden.leeElCodigoDelLote"));
    if (codigo.loteId && linea.loteId && codigo.loteId !== linea.loteId) {
        return error(tAlmacen("orden.elLoteLoteidNoCorrespondeA", { loteId: codigo.loteId, loteId2: linea.loteId }));
    }
    if (codigo.loteId && !linea.porLotes) return error(tAlmacen("orden.elArticuloSkuNoSeControla", { sku: codigo.sku }));

    const loteId = codigo.loteId ?? v.loteId ?? (linea.porLotes ? undefined : null);
    return ok({ ...v, sku: codigo.sku, articulo: codigo.descripcion, loteId });
};

/** Rellena el "qué" a partir de una caja monoproducto (o de los lotes que contiene). */
const queDesdeCaja = (
    linea: LineaOrdenAlmacen,
    v: ValoresLectura,
    caja: CajaResuelta,
    ctx: ContextoLectura,
): ResultadoAplicar => {
    if (caja.sku && caja.sku !== linea.sku) {
        return error(tAlmacen("orden.laCajaLpnContieneOtroArticulo", { lpn: caja.lpn, sku: caja.sku }));
    }
    if (!caja.sku && !ctx.lotesEnCaja?.length) return error(tAlmacen("orden.laCajaLpnNoEsMonoproducto", { lpn: caja.lpn }));

    const base = { ...v, sku: linea.sku, articulo: linea.articulo };
    if (caja.idLote) {
        if (linea.loteId && caja.idLote !== linea.loteId) {
            return error(tAlmacen("orden.laCajaLpnContieneOtroLote", { lpn: caja.lpn, idLote: caja.idLote }));
        }
        return ok({ ...base, loteId: caja.idLote });
    }
    if (!linea.porLotes || ctx.lotesEnCaja === undefined) {
        return ok({ ...base, loteId: linea.loteId ?? null });
    }
    const lotes = ctx.lotesEnCaja.filter((l) => !linea.loteId || l === linea.loteId);
    if (lotes.length === 0) return error(tAlmacen("orden.elArticuloSkuNoEstaEn", { sku: linea.sku, lpn: caja.lpn }));
    if (lotes.length === 1) return ok({ ...base, loteId: lotes[0] });
    return ok({ ...base, loteId: undefined, lotesParaElegir: lotes });
};

// ---------------------------------------------------------------------------
// Aplicar un código leído
// ---------------------------------------------------------------------------

const aplicarOrigen = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen,
    v: ValoresLectura,
    codigo: CodigoResuelto,
    ctx: ContextoLectura,
): ResultadoAplicar => {
    if (codigo.tipo === "ubicacion") {
        if (linea.idUbicacionOrigen && codigo.id !== linea.idUbicacionOrigen) {
            return error(tAlmacen("orden.laUbicacionCodigoNoEsLa", { codigo: codigo.codigo, valor: linea.ubicacionOrigen ?? linea.idUbicacionOrigen }));
        }
        return ok({ ...v, idUbicacionOrigen: codigo.id, ubicacionOrigen: codigo.codigo });
    }

    if (codigo.tipo === "caja") {
        if (linea.idCajaOrigen && codigo.id !== linea.idCajaOrigen && !cajaVinculadaALinea(linea, codigo.id)) {
            return error(tAlmacen("orden.laCajaLpnNoEsLa", { lpn: codigo.lpn, valor: linea.cajaOrigen ?? linea.idCajaOrigen }));
        }
        if (linea.idUbicacionOrigen && codigo.idUbicacion && codigo.idUbicacion !== linea.idUbicacionOrigen) {
            return error(tAlmacen("orden.laCajaLpnNoEstaEn", { lpn: codigo.lpn, valor: linea.ubicacionOrigen ?? linea.idUbicacionOrigen }));
        }
        const conOrigen: ValoresLectura = {
            ...v,
            idCajaOrigen: codigo.id,
            cajaOrigen: codigo.lpn,
            idUbicacionOrigen: codigo.idUbicacion ?? linea.idUbicacionOrigen,
            cantidadCaja: codigo.cantidad ?? codigo.capacidad,
        };
        // La caja origen aporta también el "qué" (caja monoproducto o palé de la línea).
        return queDesdeCaja(linea, conOrigen, codigo, ctx);
    }

    // Artículo o lote leído: se coge suelto de la ubicación de la línea.
    if (def.origen !== "UBI_O_CAJA") return error(tAlmacen("orden.leeLaCajaDeOrigen"));
    const r = aplicarArticulo(def, linea, v, codigo);
    if (!r.ok) return r;
    if (ctx.stockSuelto !== undefined && ctx.stockSuelto <= 0) {
        return error(tAlmacen("orden.valorSoloTieneStockEnCajas", { valor: codigo.loteId ? tAlmacen("orden.elLoteLoteid", { loteId: codigo.loteId }) : tAlmacen("orden.elArticuloSku", { sku: codigo.sku }) }));
    }
    return ok({
        ...r.valores,
        idCajaOrigen: null,
        cajaOrigen: null,
        idUbicacionOrigen: linea.idUbicacionOrigen ?? undefined,
        ubicacionOrigen: linea.ubicacionOrigen,
        cantidadMaxima: ctx.stockSuelto,
    });
};

const aplicarQue = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen,
    v: ValoresLectura,
    codigo: CodigoResuelto,
): ResultadoAplicar => {
    if (codigo.tipo === "articulo") {
        if (def.que === "CAJA") return error(tAlmacen("orden.leeLaCaja2"));
        return aplicarArticulo(def, linea, v, codigo);
    }
    if (codigo.tipo !== "caja") return error(tAlmacen("orden.leeElCodigoDelArticuloO"));
    if (!codigo.sku) {
        if (def.palet) return ok({ ...v, palet: { id: codigo.id, lpn: codigo.lpn } });
        return error(tAlmacen("orden.laCajaLpnNoEsMonoproducto", { lpn: codigo.lpn }));
    }
    if (linea.idCajaOrigen && codigo.id !== linea.idCajaOrigen && !cajaVinculadaALinea(linea, codigo.id)) {
        return error(tAlmacen("orden.laCajaLpnNoEsLa", { lpn: codigo.lpn, valor: linea.cajaOrigen ?? linea.idCajaOrigen }));
    }
    const errorMaterial = errorCajaContraMaterial(codigo, linea.sku, linea.loteId);
    if (errorMaterial) return error(errorMaterial);
    return ok({
        ...v,
        idCajaOrigen: codigo.id,
        cajaOrigen: codigo.lpn,
        sku: codigo.sku,
        articulo: linea.articulo,
        loteId: codigo.idLote ?? linea.loteId ?? null,
        cantidadCaja: codigo.cantidad ?? codigo.capacidad,
    });
};

const aplicarDestino = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen | null,
    v: ValoresLectura,
    codigo: CodigoResuelto,
): ResultadoAplicar => {
    if (!tiposAceptados(def, "destino").includes(codigo.tipo)) {
        return error(instruccionDimension(def, "destino", v));
    }

    if (codigo.tipo === "ubicacion") {
        if (linea?.idCajaDestino) {
            return error(tAlmacen("orden.laLineaTienePrevistaLaCaja", { valor: linea.cajaDestino ?? linea.idCajaDestino }));
        }
        if (linea?.idUbicacionDestino && codigo.id !== linea.idUbicacionDestino) {
            return error(tAlmacen("orden.laUbicacionCodigoNoEsLa", { codigo: codigo.codigo, valor: linea.ubicacionDestino ?? linea.idUbicacionDestino }));
        }
        return ok({
            ...v,
            idUbicacionDestino: codigo.id,
            ubicacionDestino: codigo.codigo,
            idCajaDestino: null,
            cajaDestino: null,
        });
    }

    if (codigo.tipo !== "caja" || !linea) return error(tAlmacen("orden.codigoNoValidoParaElDestino"));

    if (!codigo.sku && def.palet && def.destino === "CAJA") {
        return ok({ ...v, palet: { id: codigo.id, lpn: codigo.lpn } });
    }

    const errorMaterial = errorCajaContraMaterial(
        codigo, v.sku ?? linea.sku, v.loteId !== undefined ? v.loteId : linea.loteId);
    if (errorMaterial) return error(errorMaterial);

    if (def.destino === "CAJA_ETIQUETA") {
        if (codigo.id === v.idCajaOrigen) return error(tAlmacen("orden.laCajaEtiquetaNoPuedeSer"));
        return ok({ ...v, idCajaDestino: codigo.id, cajaDestino: codigo.lpn });
    }

    if (linea.idCajaDestino && codigo.id !== linea.idCajaDestino) {
        return error(tAlmacen("orden.laCajaLpnNoEsLa", { lpn: codigo.lpn, valor: linea.cajaDestino ?? linea.idCajaDestino }));
    }
    if (linea.idUbicacionDestino && codigo.idUbicacion && codigo.idUbicacion !== linea.idUbicacionDestino) {
        return error(tAlmacen("orden.laCajaLpnNoEstaEn", { lpn: codigo.lpn, valor: linea.ubicacionDestino ?? linea.idUbicacionDestino }));
    }
    return ok({
        ...v,
        idCajaDestino: codigo.id,
        cajaDestino: codigo.lpn,
        idUbicacionDestino: codigo.idUbicacion ?? linea.idUbicacionDestino,
        ubicacionDestino: codigo.idUbicacion ? null : linea.ubicacionDestino,
        cantidadCaja: def.cantidad === "CAPACIDAD_CAJA_DESTINO" ? codigo.capacidad : v.cantidadCaja,
    });
};

/**
 * Aplica un código leído a la dimensión pendiente actual. Valida contra lo
 * previsto en la línea y devuelve los valores acumulados (una lectura puede
 * completar varias dimensiones: una caja da origen, artículo, lote y cantidad).
 */
export const aplicarCodigo = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen | null,
    v: ValoresLectura,
    codigo: CodigoResuelto,
    ctx: ContextoLectura = {},
): ResultadoAplicar => {
    const dimension = dimensionesPendientes(def, linea, v)[0];
    if (dimension === "destino") return aplicarDestino(def, linea, v, codigo);
    if (!linea) return error(tAlmacen("orden.noHayNingunaLineaSeleccionada"));
    if (dimension === "origen") return aplicarOrigen(def, linea, v, codigo, ctx);
    if (dimension === "que") return aplicarQue(def, linea, v, codigo);
    if (dimension === "cantidad") return error(tAlmacen("orden.indicaLaCantidad"));
    return error(tAlmacen("orden.noHayNadaPendienteDeLeer"));
};

export const elegirLote = (v: ValoresLectura, loteId: string): ValoresLectura => ({
    ...v,
    loteId,
    lotesParaElegir: undefined,
});

/** Quita el destino leído (para la siguiente lectura de una serie de destinos). */
export const sinDestino = (v: ValoresLectura): ValoresLectura => {
    const { idUbicacionDestino, ubicacionDestino, idCajaDestino, cajaDestino, ...resto } = v;
    void idUbicacionDestino; void ubicacionDestino; void idCajaDestino; void cajaDestino;
    return resto;
};

// ---------------------------------------------------------------------------
// Modo cabecera: localizar la línea a partir de la primera lectura
// ---------------------------------------------------------------------------

const primeraDimension = (def: DefinicionPasos, linea: LineaOrdenAlmacen) =>
    dimensionesPendientes(def, linea, {})[0];

/** Tipos de código admitidos como primera lectura en cabecera (unión de todas las líneas pendientes). */
export const tiposAceptadosCabecera = (orden: OrdenAlmacen, fase: FaseLectura): TipoCodigo[] => {
    const tipos = new Set<TipoCodigo>();
    for (const l of lineasPendientes(orden, fase)) {
        const def = definicionDeLinea(l, orden, fase)!;
        const dim = primeraDimension(def, l);
        if (dim) tiposAceptados(def, dim).forEach((t) => tipos.add(t));
    }
    return [...tipos];
};

/**
 * Busca la línea pendiente a la que corresponde el primer código leído en
 * cabecera. Prioridad: caja ligada a la línea, mismo lote, mismo SKU sin lote
 * previsto, mismo SKU (se pedirá después el lote).
 */
export const buscarLineaParaCodigo = (
    orden: OrdenAlmacen,
    fase: FaseLectura,
    codigo: CodigoResuelto,
): LineaOrdenAlmacen | null => {
    const candidatas = lineasPendientes(orden, fase).filter((l) => {
        const def = definicionDeLinea(l, orden, fase)!;
        const dim = primeraDimension(def, l);
        return !!dim && tiposAceptados(def, dim).includes(codigo.tipo);
    });

    if (codigo.tipo === "articulo") {
        const delSku = candidatas.filter((l) => l.sku === codigo.sku);
        return (
            (codigo.loteId ? delSku.find((l) => l.loteId === codigo.loteId) : undefined) ??
            delSku.find((l) => !l.loteId) ??
            (codigo.loteId ? undefined : delSku[0]) ??
            null
        );
    }

    if (codigo.tipo === "caja") {
        const vinculada = candidatas.find((l) => cajaVinculadaALinea(l, codigo.id));
        if (vinculada) return vinculada;
        if (!codigo.sku) return null;
        return (
            candidatas.find((l) => {
                if (l.sku !== codigo.sku) return false;
                if (codigo.idLote && l.loteId && codigo.idLote !== l.loteId) return false;
                const def = definicionDeLinea(l, orden, fase)!;
                // Una línea con caja prevista solo admite esa caja (ya descartada arriba).
                return primeraDimension(def, l) === "destino" ? !l.idCajaDestino : !l.idCajaOrigen;
            }) ?? null
        );
    }

    return null;
};

/** Definición con la que se registra un palé leído en cabecera (sin línea). */
export const definicionParaPalet = (orden: OrdenAlmacen, fase: FaseLectura): DefinicionPasos | null => {
    for (const l of lineasPendientes(orden, fase)) {
        const def = definicionDeLinea(l, orden, fase)!;
        const dim = primeraDimension(def, l);
        if (def.palet && dim && tiposAceptados(def, dim).includes("caja")) return def;
    }
    return null;
};

// ---------------------------------------------------------------------------
// Construir la lectura a registrar
// ---------------------------------------------------------------------------

export const cantidadALeer = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    v: ValoresLectura,
    fase: FaseLectura,
): number => {
    const pendiente = cantidadPendiente(linea, orden, fase);
    switch (def.cantidad) {
        case "LEER":
            return v.cantidad ?? pendiente;
        case "PENDIENTE":
            return v.cantidadMaxima !== undefined ? Math.min(pendiente, v.cantidadMaxima) : pendiente;
        case "CONTENIDO_CAJA":
            return v.cantidadCaja ?? pendiente;
        case "CAPACIDAD_CAJA_DESTINO":
            return v.cantidadCaja || pendiente;
        case "CAPACIDAD_SUBCAJA":
            return 0; // la calcula el backend a partir de la subcaja del palé
    }
};

export const aLecturaOrden = (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    v: ValoresLectura,
    fase: FaseLectura,
): NuevaLecturaOrden => {
    const destinoDeLinea = def.destino === "LINEA";
    const sinDestinoFisico = def.destino === "NINGUNO";
    return {
        sku: v.sku ?? linea.sku,
        articulo: v.articulo ?? linea.articulo,
        idLote: v.loteId !== undefined ? v.loteId : linea.loteId,
        idLinea: linea.id,
        cajaCompleta: def.manejoCaja === "COMPLETA",
        cantidad: cantidadALeer(def, linea, orden, v, fase),
        idCajaOrigen: v.idCajaOrigen !== undefined ? v.idCajaOrigen : linea.idCajaOrigen,
        idUbicacionOrigen: v.idUbicacionOrigen ?? linea.idUbicacionOrigen,
        idCajaDestino: sinDestinoFisico ? null
            : destinoDeLinea ? linea.idCajaDestino
            : (v.idCajaDestino ?? null),
        idUbicacionDestino: sinDestinoFisico ? null
            : destinoDeLinea ? linea.idUbicacionDestino
            : (v.idUbicacionDestino ?? null),
        fase: def.directo ? null : fase,
    };
};

/** Lectura de un palé completo (registra todo su contenido en el backend). */
export const aLecturaPalet = (v: ValoresLectura): NuevaLecturaCajaOrden => ({
    cajaId: v.palet!.id,
    cajaCompleta: true,
    idUbicacionDestino: v.idUbicacionDestino ?? null,
    idCajaDestino: null,
});
