import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import {
    CuentasAnuales,
    FormatoCuentasAnuales,
    FormatoHoja,
    LineaCuentasAnuales,
    NivelDesglose,
    NuevaCuentasAnuales,
    SubtotalCuentasAnuales,
    TipoCuentasAnuales,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export { ejercicioActual };

const TEXTO_VALOR: Record<string, () => string> = {
    Situacion: () => tContabilidad("comun.situacion"),
    "Perdidas y ganancias": () => tContabilidad("comun.perdidasYGanancias"),
    "Ingresos y gastos": () => tContabilidad("comun.ingresosYGastos"),
    Normal: () => tContabilidad("comun.normal"),
    Abreviado: () => tContabilidad("comun.abreviado"),
    "No desglosar": () => tContabilidad("comun.noDesglosar"),
    Cuenta: () => tContabilidad("comun.cuenta"),
    Subcuenta: () => tContabilidad("comun.subcuenta"),
};

/** Texto visible de un tipo, formato o desglose (el valor se guarda como en Eneboo). */
export const textoValorCuentasAnuales = (valor: string): string =>
    TEXTO_VALOR[valor]?.() ?? valor;

export const etiquetaCuentasAnuales = (
    c: Pick<CuentasAnuales, "descripcion" | "tipo">
): string => {
    const tipo = textoValorCuentasAnuales(c.tipo);
    return c.descripcion ? `${c.descripcion} — ${tipo}` : tipo;
};

export const cuentasAnualesVacias = (): CuentasAnuales => ({
    id: "",
    descripcion: "",
    tipo: "Situacion",
    formato: "Normal",
    nivelDesglose: "No desglosar",
    ejercicioId: "",
    fechaDesde: "",
    fechaHasta: "",
    ejercicioAnteriorId: "",
    fechaDesdeAnterior: "",
    fechaHastaAnterior: "",
    omitirEpigrafesSinSaldo: false,
});

/** El balance abreviado no admite desglose: en el ERP el combo se deshabilita
 * y se fuerza a «No desglosar». El backend aplica la misma regla. */
export const admiteDesglose = (formato: FormatoCuentasAnuales): boolean =>
    formato !== "Abreviado";

export const desgloseSegunFormato = (
    formato: FormatoCuentasAnuales,
    nivelDesglose: NivelDesglose
): NivelDesglose =>
    admiteDesglose(formato) ? nivelDesglose : "No desglosar";

/** El check de omitir epígrafes sin saldo solo existe en balance de situación. */
export const admiteOmitirEpigrafes = (tipo: TipoCuentasAnuales): boolean =>
    tipo === "Situacion";

/** `habilitarPorTipo` de `co_i_cuentasanuales.qs`: fuera del balance de
 * situación la casilla se apaga y se deshabilita. */
export const omitirEpigrafesSegunTipo = <
    T extends Pick<CuentasAnuales, "tipo" | "omitirEpigrafesSinSaldo">,
>(
    informe: T
): T =>
    !admiteOmitirEpigrafes(informe.tipo) && informe.omitirEpigrafesSinSaldo
        ? { ...informe, omitirEpigrafesSinSaldo: false }
        : informe;

export const nuevaCuentasAnualesInicial = (
    ejercicioId: string
): NuevaCuentasAnuales => ({
    descripcion: "",
    tipo: "Situacion",
    formato: "Normal",
    nivelDesglose: "No desglosar",
    ejercicioId,
    fechaDesde: `${ejercicioId}-01-01`,
    fechaHasta: `${ejercicioId}-12-31`,
    ejercicioAnteriorId: "",
    fechaDesdeAnterior: "",
    fechaHastaAnterior: "",
});

export const nombreFicheroCuentasAnuales = (
    informe: Pick<CuentasAnuales, "descripcion" | "tipo">,
    extension: "pdf" | FormatoHoja
): string => {
    const base = (informe.descripcion || informe.tipo)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "cuentas-anuales"}.${extension}`;
};

/** Nivel de sangría de una línea: el del último texto informado. El importe
 * cuelga de ese mismo nivel (`PG-A-20--`, por ejemplo, no tiene cuarto). */
export const nivelLinea = (linea: LineaCuentasAnuales): number => {
    const textos = [
        linea.descripcion1,
        linea.descripcion2,
        linea.descripcion3,
        linea.descripcion4,
    ];
    for (let i = textos.length - 1; i >= 0; i--) {
        if (textos[i]?.trim()) return i;
    }
    return 0;
};

export const conceptoLinea = (linea: LineaCuentasAnuales): string => {
    const textos = [
        linea.descripcion1,
        linea.descripcion2,
        linea.descripcion3,
        linea.descripcion4,
    ];
    return textos[nivelLinea(linea)]?.trim() || linea.codbalance;
};

/** Subtotales que van impresos justo después de esta línea. */
export const subtotalesTrasLinea = (
    subtotales: SubtotalCuentasAnuales[],
    linea: LineaCuentasAnuales,
    siguiente: LineaCuentasAnuales | undefined
): SubtotalCuentasAnuales[] => {
    if (linea.nivel2 === null) return [];
    if (siguiente && siguiente.nivel2 === linea.nivel2) return [];
    return subtotales.filter((s) => s.despuesDeNivel2 === linea.nivel2);
};
