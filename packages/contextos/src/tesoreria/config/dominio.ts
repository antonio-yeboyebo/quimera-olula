import { plugin } from "@olula/lib/dominio.ts";
import { ConfigTesoreria, ModoPagoRemesa, TipoRemesa } from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

/** El modo de las remesas de pago solo existe con su plugin activo (sin él, la BD
 * no tiene sus columnas y el servidor no las lee ni las guarda). */
export const conRemesasPago = (): boolean => plugin("remesa_pago") === "activo";

export const configTesoreriaPorDefecto: ConfigTesoreria = {
    modoCobro: "directo",
    modoPago: "directo",
};

/** En bd son dos flags; el indirecto es una variante del diferido y manda sobre él. */
export const modoDesdeFlags = (diferido: boolean, indirecto: boolean): ModoPagoRemesa =>
    indirecto ? "indirecto" : diferido ? "diferido" : "directo";

export const flagsDesdeModo = (modo: ModoPagoRemesa): { diferido: boolean; indirecto: boolean } => ({
    diferido: modo !== "directo",
    indirecto: modo === "indirecto",
});

export const opcionesModoPagoRemesa: { valor: ModoPagoRemesa; descripcion: string }[] = [
    { valor: "directo", get descripcion() { return tTesoreria("config.directo"); } },
    { valor: "diferido", get descripcion() { return tTesoreria("config.diferido"); } },
    { valor: "indirecto", get descripcion() { return tTesoreria("config.indirecto"); } },
];

const EXPLICACION: Record<TipoRemesa, Record<ModoPagoRemesa, string>> = {
    cobro: {
        get directo() { return tTesoreria("config.alRemesarCadaReciboQuedaCobrado"); },
        get diferido() { return tTesoreria("config.alRemesarLosRecibosQuedanRemesados"); },
        get indirecto() { return tTesoreria("config.alRemesarCadaReciboQuedaCobrado2"); },
    },
    pago: {
        get directo() { return tTesoreria("config.alRemesarCadaReciboQuedaPagado"); },
        get diferido() { return tTesoreria("config.alRemesarLosRecibosQuedanRemesados2"); },
        get indirecto() { return tTesoreria("config.alRemesarCadaReciboQuedaPagado2"); },
    },
};

export const explicacionModoPagoRemesa = (tipo: TipoRemesa, modo: ModoPagoRemesa): string =>
    EXPLICACION[tipo][modo];
