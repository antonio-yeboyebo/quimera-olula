import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, MetaModelo } from "@olula/lib/dominio.ts";
import {
    AlcanceRegeneracion,
    CodigoBalance,
    CuentaCodigoBalance,
    FormatoBalance,
    NuevaCuentaCodigoBalance,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export const NATURALEZAS = [
    { valor: "A", get descripcion() { return tContabilidad("codigo_balance.activo"); } },
    { valor: "P", get descripcion() { return tContabilidad("codigo_balance.patrimonioNetoYPasivo"); } },
    { valor: "PG", get descripcion() { return tContabilidad("codigo_balance.perdidasYGanancias"); } },
    { valor: "IG", get descripcion() { return tContabilidad("codigo_balance.ingresosYGastos"); } },
];

export const SIGNOS = [
    { valor: "Ambos", get descripcion() { return tContabilidad("codigo_balance.ambos"); } },
    { valor: "Positivo", get descripcion() { return tContabilidad("codigo_balance.positivoSaldoDeudor"); } },
    { valor: "Negativo", get descripcion() { return tContabilidad("codigo_balance.negativoSaldoAcreedor"); } },
];

/** Longitud de `codcuenta` en `co_cuentascb` / `co_cuentascbba`. */
export const LONGITUD_MAXIMA_CUENTA = 6;

export const codigoBalanceVacio = (): CodigoBalance => ({
    id: "",
    naturaleza: "A",
    nivel1: "",
    descripcion1: "",
    nivel2: "",
    descripcion2: "",
    nivel3: "",
    orden3: "",
    descripcion3: "",
    nivel4: "",
    descripcion4: "",
    descripcion4ba: "",
});

/** La descripción más concreta que tenga el código (nivel 4, 3, 2 o 1). */
export const descripcionCodigoBalance = (c: CodigoBalance): string =>
    c.descripcion4 || c.descripcion3 || c.descripcion2 || c.descripcion1 || "";

export const etiquetaCodigoBalance = (c: CodigoBalance): string => {
    const descripcion = descripcionCodigoBalance(c);
    return descripcion ? `${c.id} — ${descripcion}` : c.id;
};

export const nivel2Valido = (nivel2: string): boolean =>
    nivel2.trim() === "" || /^\d+$/.test(nivel2.trim());

export const metaCodigoBalance: MetaModelo<CodigoBalance> = {
    campos: {
        naturaleza: { requerido: true },
        nivel2: {
            requerido: false,
            validacion: (c) => nivel2Valido(c.nivel2) || tContabilidad("codigo_balance.debeSerUnNumero"),
        },
    },
};

export const cuentaCodigoBalanceVacia = (): NuevaCuentaCodigoBalance => ({
    codigoCuenta: "",
    descripcionCuenta: "",
    signo: "Ambos",
});

export const metaCuentaCodigoBalance: MetaModelo<NuevaCuentaCodigoBalance> = {
    campos: {
        codigoCuenta: { requerido: true, maximo: LONGITUD_MAXIMA_CUENTA },
        descripcionCuenta: { requerido: false },
        signo: { requerido: true },
    },
};

export const etiquetaCuentaCodigoBalance = (c: CuentaCodigoBalance): string =>
    c.descripcionCuenta ? `${c.codigoCuenta} — ${c.descripcionCuenta}` : c.codigoCuenta;

export const filtroCuentasDeCodigo = (codigoBalanceId: string): ClausulaFiltro =>
    ["codigo_balance_id", "=", codigoBalanceId];

/** Todas las cuentas del código, ordenadas por cuenta (cabe en una página). */
export const criteriaCuentasDeCodigo = (codigoBalanceId: string): Criteria => ({
    ...criteriaDefecto,
    filtro: [filtroCuentasDeCodigo(codigoBalanceId)],
    orden: ["codigo_cuenta", "ASC"],
    paginacion: { limite: 1000, pagina: 1 },
});

export const ETIQUETA_FORMATO: Record<FormatoBalance, string> = {
    get normal() { return tContabilidad("codigo_balance.cuentasNormales"); },
    get abreviado() { return tContabilidad("codigo_balance.cuentasDeBalanceAbreviado"); },
};

/** Avisos de los botones de regeneración de Eneboo (co_mastercodbalances08). */
export const AVISO_REGENERACION: Record<AlcanceRegeneracion, { titulo: string; mensaje: string }> = {
    todo: {
        get titulo() { return tContabilidad("codigo_balance.regenerarCodigosDeBalance"); },
        get mensaje() { return tContabilidad("codigo_balance.aContinuacionSeRegeneraranLosCodigos"); },
    },
    cuentas: {
        get titulo() { return tContabilidad("codigo_balance.regenerarCuentasPorCodigoDeBalance"); },
        get mensaje() { return tContabilidad("codigo_balance.aContinuacionSeRegeneraranLasCorresponde"); },
    },
    cuentas_abreviado: {
        get titulo() { return tContabilidad("codigo_balance.regenerarCuentasPorCodigoDeBalance2"); },
        get mensaje() { return tContabilidad("codigo_balance.aContinuacionSeRegeneraranLasCorresponde2"); },
    },
};
