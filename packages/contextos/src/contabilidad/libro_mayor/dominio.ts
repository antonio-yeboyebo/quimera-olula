import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { conChecks } from "#/contabilidad/comun/checks_informe.ts";
import { subcuentasRequeridas } from "#/contabilidad/comun/rangos_ejercicio.ts";
import { ASCENDENTE } from "#/contabilidad/libro_diario/dominio.ts";
import { Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { LibroMayor, NuevoLibroMayor } from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export { ASCENDENTE, ejercicioActual };

export const etiquetaLibroMayor = (
    informe: Pick<LibroMayor, "descripcion" | "ejercicioId">
): string =>
    informe.descripcion
        ? `${informe.descripcion} — ${informe.ejercicioId}`
        : tContabilidad("libro_mayor.libroMayorEjercicioid", { ejercicioId: informe.ejercicioId });

export const libroMayorVacio = (): LibroMayor => ({
    id: "",
    descripcion: "",
    ejercicioId: "",
    fechaDesde: "",
    fechaHasta: "",
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    saldoInicial: true,
    excluirPartidasCero: false,
    orden: "Fecha",
    tipoOrden: ASCENDENTE,
});

/** Campos `bool` de `co_i_mayor` que se editan como casilla. */
export const CHECKS_LIBRO_MAYOR = [
    "todasSubcuentas",
    "saldoInicial",
    "excluirPartidasCero",
] as const;

/** Meta común del alta y de la ficha: casillas y subcuentas obligatorias
 * sin «todas las subcuentas» (`co_i_mayor.qs`). */
export const metaFormularioLibroMayor = <
    T extends Modelo & Pick<LibroMayor, "todasSubcuentas">,
>(): MetaModelo<T> =>
    conChecks<T>(
        {
            campos: {
                descripcion: { requerido: true },
                ejercicioId: { requerido: true },
                subcuentaDesde: { requerido: subcuentasRequeridas },
                subcuentaHasta: { requerido: subcuentasRequeridas },
            },
        },
        CHECKS_LIBRO_MAYOR
    );

export const nuevoLibroMayorInicial = (
    ejercicioId: string
): NuevoLibroMayor => ({
    descripcion: "",
    ejercicioId,
    fechaDesde: `${ejercicioId}-01-01`,
    fechaHasta: `${ejercicioId}-12-31`,
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    saldoInicial: true,
    excluirPartidasCero: false,
    orden: "Fecha",
    tipoOrden: ASCENDENTE,
});

export const nombreFicheroLibroMayor = (
    informe: Pick<LibroMayor, "descripcion" | "ejercicioId">
): string => {
    const base = (informe.descripcion || tContabilidad("libro_mayor.libroMayorEjercicioid2", { ejercicioId: informe.ejercicioId }))
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "libro-mayor"}.pdf`;
};
