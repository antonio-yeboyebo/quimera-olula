// Flujos de lectura: combinaciones válidas de pasos de pick y drop que se
// ofrecen al crear una orden o una línea a mano, con la explicación de lo que
// hará el operario.
import { LineaOrdenAlmacen, OrdenAlmacen, TipoOrden } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

export type CampoFlujo = "ubicacionOrigen" | "cajaOrigen" | "paletOrigen" | "ubicacionDestino" | "cajaDestino";
export type UsoCampo = "requerido" | "opcional";

export interface Flujo {
    codigo: string;
    tipo: TipoOrden;
    nombre: string;
    explicacion: string;
    pasosPick: string | null;
    pasosDrop: string | null;
    /** Otros códigos de pick que también corresponden a este flujo. */
    pasosPickAlternativos?: string[];
    /** La línea se crea a partir de un palé (crea las cajas etiqueta). */
    palet?: true;
    campos: Partial<Record<CampoFlujo, UsoCampo>>;
}

export const FLUJOS: Flujo[] = [
    {
        codigo: "TRASPASO_SIN_PICK",
        tipo: "TRASPASO",
        get nombre() { return tAlmacen("orden.sinPickDirecto"); },
        get explicacion() { return tAlmacen("orden.unSoloPasoEnDestinoLee"); },
        pasosPick: null,
        pasosDrop: "SKU-CANTIDAD",
        campos: { ubicacionOrigen: "requerido", ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "TRASPASO_CAJAS",
        tipo: "TRASPASO",
        get nombre() { return tAlmacen("orden.cajasCompletas"); },
        get explicacion() { return tAlmacen("orden.pickEnOrigenLeeCadaCaja"); },
        pasosPick: "CAJAS",
        pasosDrop: "CAJAS-UBICACION",
        campos: { ubicacionOrigen: "opcional", cajaOrigen: "opcional", ubicacionDestino: "requerido" },
    },
    {
        codigo: "TRASPASO_MATERIAL",
        tipo: "TRASPASO",
        get nombre() { return tAlmacen("orden.materialDeCajaOSuelto"); },
        get explicacion() { return tAlmacen("orden.pickLeeLaCajaDeLa"); },
        pasosPick: "SKU_CAJA",
        pasosDrop: "SKU-CANTIDAD",
        campos: {
            ubicacionOrigen: "requerido", cajaOrigen: "opcional",
            ubicacionDestino: "requerido", cajaDestino: "opcional",
        },
    },
    {
        codigo: "TRASPASO_PALET",
        tipo: "TRASPASO",
        get nombre() { return tAlmacen("orden.paleCajasEtiqueta"); },
        get explicacion() { return tAlmacen("orden.seCreanLasCajasEtiquetaDel"); },
        pasosPick: "LOTE-CAJAS",
        pasosPickAlternativos: ["CAJA-CAJAS"],
        pasosDrop: "CAJAS-UBICACION",
        palet: true,
        campos: { paletOrigen: "requerido", ubicacionDestino: "requerido" },
    },
    {
        codigo: "ENTRADA_SUELTO",
        tipo: "ENTRADA",
        get nombre() { return tAlmacen("orden.materialSuelto"); },
        get explicacion() { return tAlmacen("orden.leeElSkuOElLote"); },
        pasosPick: null,
        pasosDrop: "SKU-CANTIDAD",
        campos: { ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "ENTRADA_CAJAS",
        tipo: "ENTRADA",
        get nombre() { return tAlmacen("orden.cajas"); },
        get explicacion() { return tAlmacen("orden.leeCadaCajaDeDestinoYa"); },
        pasosPick: null,
        pasosDrop: "CAJAS",
        campos: { ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "ENTRADA_PALET",
        tipo: "ENTRADA",
        get nombre() { return tAlmacen("orden.pale"); },
        get explicacion() { return tAlmacen("orden.leeElPaleYSeRegistra"); },
        pasosPick: null,
        pasosDrop: "PALET",
        campos: { ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "SALIDA_MATERIAL",
        tipo: "SALIDA",
        get nombre() { return tAlmacen("orden.materialDeCajaOSuelto"); },
        get explicacion() { return tAlmacen("orden.leeLaCajaDeLaQue"); },
        pasosPick: "SKU_CAJA",
        pasosDrop: null,
        campos: { ubicacionOrigen: "requerido", cajaOrigen: "opcional" },
    },
];

export const flujosDeTipo = (tipo: string): Flujo[] => FLUJOS.filter((f) => f.tipo === tipo);

export const flujoPorCodigo = (codigo: string | null): Flujo | null =>
    FLUJOS.find((f) => f.codigo === codigo) ?? null;

/** Flujo al que corresponden unos pasos de pick y drop, o null si no hay ninguno. */
export const flujoDePasos = (tipo: string, pick: string | null, drop: string | null): Flujo | null =>
    flujosDeTipo(tipo).find(
        (f) =>
            (f.pasosPick === pick || (!!pick && !!f.pasosPickAlternativos?.includes(pick))) &&
            f.pasosDrop === drop
    ) ?? null;

const flujoDeLinea = (linea: LineaOrdenAlmacen, tipo: string) =>
    flujoDePasos(tipo, linea.pasosPick, linea.pasosDrop);

/**
 * Flujo con el que se preselecciona una línea nueva: el de la cabecera; si la
 * cabecera no tiene (líneas con pasos distintos), el de la última línea; si
 * tampoco, el primero del tipo de orden.
 */
export const flujoPorDefecto = (orden: OrdenAlmacen): Flujo | null => {
    const deCabecera = orden.pasosPick || orden.pasosDrop
        ? flujoDePasos(orden.tipo, orden.pasosPick, orden.pasosDrop)
        : null;
    const ultima = orden.lineas[orden.lineas.length - 1];
    return deCabecera ?? (ultima ? flujoDeLinea(ultima, orden.tipo) : null) ?? flujosDeTipo(orden.tipo)[0] ?? null;
};

export interface DatosLineaFlujo {
    idUbicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
}

const NOMBRE_CAMPO: Record<CampoFlujo, string> = {
    get ubicacionOrigen() { return tAlmacen("orden.ubicacionOrigen"); },
    get cajaOrigen() { return tAlmacen("orden.cajaOrigen"); },
    get paletOrigen() { return tAlmacen("orden.paleOrigen"); },
    get ubicacionDestino() { return tAlmacen("orden.ubicacionDestino"); },
    get cajaDestino() { return tAlmacen("orden.cajaDestino"); },
};

/** Campos requeridos por el flujo que faltan en la línea. */
export const camposPendientes = (flujo: Flujo, linea: DatosLineaFlujo): string[] => {
    const valor: Record<CampoFlujo, string | null> = {
        ubicacionOrigen: linea.idUbicacionOrigen,
        cajaOrigen: linea.idCajaOrigen,
        paletOrigen: linea.idCajaOrigen,
        ubicacionDestino: linea.idUbicacionDestino,
        cajaDestino: null,
    };
    return (Object.entries(flujo.campos) as [CampoFlujo, UsoCampo][])
        .filter(([campo, uso]) => uso === "requerido" && !valor[campo])
        .map(([campo]) => NOMBRE_CAMPO[campo]);
};
