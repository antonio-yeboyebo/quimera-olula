import { LineaOrdenAlmacen, OrdenAlmacen } from "../diseño.ts";
import { DefinicionPasos, FaseLectura } from "./diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

type Def = Omit<DefinicionPasos, "codigo" | "fase" | "directo" | "serie" | "palet"> &
    Partial<Pick<DefinicionPasos, "directo" | "serie" | "palet">>;

const crear = (fase: FaseLectura, defs: Record<string, Def>): Record<string, DefinicionPasos> =>
    Object.fromEntries(
        Object.entries(defs).map(([codigo, d]) => [
            codigo,
            { directo: false, serie: null, palet: false, ...d, codigo, fase },
        ])
    );

export const CATALOGO_DROP: Record<string, DefinicionPasos> = crear("DROP", {
    "SKU-CANTIDAD": {
        get nombre() { return tAlmacen("orden.skuCantidadUbicacionOCaja"); },
        get instruccion() { return tAlmacen("orden.leeElSkuLaCantidadY"); },
        origen: null, que: "SKU_O_LOTE", cantidad: "LEER", destino: "UBI_O_CAJA", manejoCaja: null,
    },
    "LOTE-CANTIDAD": {
        get nombre() { return tAlmacen("orden.loteCantidadUbicacionOCaja"); },
        get instruccion() { return tAlmacen("orden.leeElLoteLaCantidadY"); },
        origen: null, que: "LOTE", cantidad: "LEER", destino: "UBI_O_CAJA", manejoCaja: null,
    },
    "SKU_LOTE-CANTIDAD": {
        get nombre() { return tAlmacen("orden.skuLoteCantidad"); },
        get instruccion() { return tAlmacen("orden.leeElSkuLoteYCantidad"); },
        origen: null, que: "SKU_O_LOTE", cantidad: "LEER", destino: "LINEA", manejoCaja: null,
    },
    "CAJAS": {
        get nombre() { return tAlmacen("orden.leerCajas"); },
        get instruccion() { return tAlmacen("orden.leeLaCaja"); },
        origen: null, que: "LINEA", cantidad: "CAPACIDAD_CAJA_DESTINO", destino: "CAJA", manejoCaja: null,
        palet: true,
    },
    "PALET": {
        get nombre() { return tAlmacen("orden.leerPales"); },
        get instruccion() { return tAlmacen("orden.leeElPalet"); },
        origen: null, que: "CAJA", cantidad: "CONTENIDO_CAJA", destino: "LINEA", manejoCaja: "COMPLETA",
        palet: true,
    },
    "CAJAS-UBICACION": {
        get nombre() { return tAlmacen("orden.cajaUbicacion"); },
        get instruccion() { return tAlmacen("orden.leeLaCajaYLaUbicacion"); },
        origen: null, que: "CAJA", cantidad: "CONTENIDO_CAJA", destino: "UBI", manejoCaja: "COMPLETA",
        serie: "QUE", palet: true,
    },
    "SKU-UBICACION": {
        get nombre() { return tAlmacen("orden.skuCantidadUbicacion"); },
        get instruccion() { return tAlmacen("orden.leeElSkuLaCantidadY2"); },
        origen: null, que: "SKU_O_LOTE", cantidad: "LEER", destino: "UBI", manejoCaja: null,
    },
});

export const CATALOGO_PICK: Record<string, DefinicionPasos> = crear("PICK", {
    "SKU_CAJA": {
        get nombre() { return tAlmacen("orden.cajaOSkuSuelto"); },
        get instruccion() { return tAlmacen("orden.leeLaCajaOElSku"); },
        origen: "UBI_O_CAJA", que: "SKU", cantidad: "PENDIENTE", destino: "NINGUNO", manejoCaja: "EXTRAER",
    },
    "LOTE_CAJA": {
        get nombre() { return tAlmacen("orden.cajaOLoteSuelto"); },
        get instruccion() { return tAlmacen("orden.leeLaCajaOElLote"); },
        origen: "UBI_O_CAJA", que: "LOTE", cantidad: "PENDIENTE", destino: "NINGUNO", manejoCaja: "EXTRAER",
    },
    "LOTE-CAJAS": {
        get nombre() { return tAlmacen("orden.paleCLotesCajasEtiqueta"); },
        get instruccion() { return tAlmacen("orden.leeElLoteDeLaSubcaja"); },
        origen: "LINEA", que: "LOTE", cantidad: "CAPACIDAD_SUBCAJA", destino: "CAJA_ETIQUETA", manejoCaja: "EXTRAER",
        serie: "DESTINO",
    },
    "CAJA-CAJAS": {
        get nombre() { return tAlmacen("orden.paleSLotesCajasEtiqueta"); },
        get instruccion() { return tAlmacen("orden.leeElPaleYLasNuevas"); },
        origen: "CAJA", que: "CAJA", cantidad: "CAPACIDAD_SUBCAJA", destino: "CAJA_ETIQUETA", manejoCaja: "EXTRAER",
        serie: "DESTINO",
    },
    "CAJAS": {
        get nombre() { return tAlmacen("orden.recogerCajasCompletas"); },
        get instruccion() { return tAlmacen("orden.leeLaCaja"); },
        origen: "CAJA", que: "CAJA", cantidad: "CONTENIDO_CAJA", destino: "NINGUNO", manejoCaja: "COMPLETA",
    },
    "CAJA-CANTIDAD": {
        get nombre() { return tAlmacen("orden.cajaCantidadDirecto"); },
        get instruccion() { return tAlmacen("orden.leeLaCajaYLaCantidad"); },
        origen: "CAJA", que: "CAJA", cantidad: "LEER", destino: "LINEA", manejoCaja: "EXTRAER",
        directo: true,
    },
});

const catalogo = (fase: FaseLectura) => (fase === "PICK" ? CATALOGO_PICK : CATALOGO_DROP);

export const definicion = (codigo: string | null, fase: FaseLectura): DefinicionPasos | null =>
    codigo ? (catalogo(fase)[codigo] ?? null) : null;

/** Código de pasos que aplica a una línea: el suyo o, si no tiene, el de la cabecera. */
export const pasosEfectivos = (
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    fase: FaseLectura,
): string | null =>
    fase === "PICK"
        ? (linea.pasosPick ?? orden.pasosPick)
        : (linea.pasosDrop ?? orden.pasosDrop);

/**
 * Definición que aplica a una línea en una fase. Las entradas antiguas sin
 * pasos de drop se leen como "CAJAS" (lectura de cajas de entrada).
 */
export const definicionDeLinea = (
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    fase: FaseLectura,
): DefinicionPasos | null => {
    const codigo = pasosEfectivos(linea, orden, fase);
    if (!codigo && fase === "DROP" && orden.tipo === "ENTRADA") return CATALOGO_DROP["CAJAS"];
    return definicion(codigo, fase);
};

/** La línea se recoge en una fase PICK separada (no directa). */
export const tieneFasePick = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen): boolean => {
    const codigo = pasosEfectivos(linea, orden, "PICK");
    return !!codigo && !(definicion(codigo, "PICK")?.directo ?? false);
};

/** La línea tiene fase DROP (o es una entrada, que siempre la tiene). */
export const tieneFaseDrop = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen): boolean =>
    definicionDeLinea(linea, orden, "DROP") !== null;

/** Texto de instrucción para un código; si no está en el catálogo, el propio código. */
export const instruccionPasos = (codigo: string, fase: FaseLectura): string =>
    definicion(codigo, fase)?.instruccion ?? codigo;
