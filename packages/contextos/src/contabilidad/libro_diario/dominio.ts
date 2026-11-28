import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { conChecks } from "#/contabilidad/comun/checks_informe.ts";
import { subcuentasRequeridas } from "#/contabilidad/comun/rangos_ejercicio.ts";
import { Modelo } from "@olula/lib/diseño.ts";
import { formatearFechaDate, MetaModelo } from "@olula/lib/dominio.ts";
import {
    CriterioOrden,
    FilaLibroDiario,
    LibroDiario,
    NuevoLibroDiario,
    SentidoOrden,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export { ejercicioActual };

export const NO_ORDENAR: CriterioOrden = "No ordenar";
export const ASCENDENTE: SentidoOrden = "Ascendente";

export const etiquetaLibroDiario = (
    informe: Pick<LibroDiario, "descripcion" | "ejercicioId">
): string =>
    informe.descripcion
        ? `${informe.descripcion} — ${informe.ejercicioId}`
        : tContabilidad("libro_diario.libroDiarioEjercicioid", { ejercicioId: informe.ejercicioId });

export const libroDiarioVacio = (): LibroDiario => ({
    id: "",
    descripcion: "",
    tipo: "Borrador",
    ejercicioId: "",
    fechaDesde: "",
    fechaHasta: "",
    todosAsientos: true,
    asientoDesde: "",
    asientoHasta: "",
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    datosIva: false,
    agruparMeses: false,
    resumenMensual: false,
    orden1: "Asiento",
    tipoOrden1: ASCENDENTE,
    orden2: NO_ORDENAR,
    tipoOrden2: ASCENDENTE,
    orden3: NO_ORDENAR,
    tipoOrden3: ASCENDENTE,
});

/**
 * `controlChecks` del formulario de Eneboo: con resumen mensual marcado, los
 * checks de datos de I.V.A. y agrupar por meses se deshabilitan y se apagan.
 * El backend aplica la misma regla.
 */
export const admiteOpcionesDeDetalle = (
    informe: Pick<LibroDiario, "resumenMensual">
): boolean => !informe.resumenMensual;

/** Campos `bool` de `co_i_diario` que se editan como casilla. */
export const CHECKS_LIBRO_DIARIO = [
    "todosAsientos",
    "todasSubcuentas",
    "resumenMensual",
    "datosIva",
    "agruparMeses",
] as const;

type OpcionesLibroDiario = Pick<
    LibroDiario,
    "resumenMensual" | "datosIva" | "agruparMeses"
>;

/** `controlChecks` de Eneboo: al marcar resumen mensual se apagan datos de
 * I.V.A. y agrupar por meses. */
export const opcionesCoherentes = <T extends OpcionesLibroDiario>(
    informe: T
): T =>
    informe.resumenMensual && (informe.datosIva || informe.agruparMeses)
        ? { ...informe, datosIva: false, agruparMeses: false }
        : informe;

type FormularioLibroDiario = Modelo &
    OpcionesLibroDiario &
    Pick<LibroDiario, "todasSubcuentas">;

/** Meta común del alta y de la ficha: casillas, subcuentas obligatorias sin
 * «todas las subcuentas» y `controlChecks`. */
export const metaFormularioLibroDiario = <
    T extends FormularioLibroDiario,
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
        CHECKS_LIBRO_DIARIO,
        opcionesCoherentes
    );

export const nuevoLibroDiarioInicial = (
    ejercicioId: string
): NuevoLibroDiario => ({
    descripcion: "",
    ejercicioId,
    fechaDesde: `${ejercicioId}-01-01`,
    fechaHasta: `${ejercicioId}-12-31`,
    todosAsientos: true,
    asientoDesde: "",
    asientoHasta: "",
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    datosIva: false,
    agruparMeses: false,
    resumenMensual: false,
    orden1: "Asiento",
    tipoOrden1: ASCENDENTE,
    orden2: NO_ORDENAR,
    tipoOrden2: ASCENDENTE,
    orden3: NO_ORDENAR,
    tipoOrden3: ASCENDENTE,
});

export const nombreFicheroLibroDiario = (
    informe: Pick<LibroDiario, "descripcion" | "ejercicioId">
): string => {
    const base = (informe.descripcion || tContabilidad("libro_diario.libroDiarioEjercicioid2", { ejercicioId: informe.ejercicioId }))
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "libro-diario"}.pdf`;
};

/** Columnas del resultado agrupado, las mismas que el PDF (`co_i_diario_b.kut`). */
export const CABECERAS_LIBRO_DIARIO = [
    "Fecha",
    "Asiento",
    "Documento",
    "Subcuenta",
    "Descripción",
    "Concepto",
    "Debe",
    "Haber",
] as const;

/** Con «Datos de I.V.A.» (`co_i_diario_b_iva.kut`). */
export const CABECERAS_IVA_LIBRO_DIARIO = [
    "S",
    "Factura",
    "Base Im.",
    "% IVA",
    "R.E.",
] as const;

const TEXTO_CABECERA: Record<string, () => string> = {
    Fecha: () => tContabilidad("libro_diario.cabFecha"),
    Asiento: () => tContabilidad("libro_diario.cabAsiento"),
    Documento: () => tContabilidad("libro_diario.cabDocumento"),
    Subcuenta: () => tContabilidad("libro_diario.cabSubcuenta"),
    "Descripción": () => tContabilidad("libro_diario.cabDescripcion"),
    Concepto: () => tContabilidad("libro_diario.cabConcepto"),
    Debe: () => tContabilidad("libro_diario.cabDebe"),
    Haber: () => tContabilidad("libro_diario.cabHaber"),
    Factura: () => tContabilidad("libro_diario.cabFactura"),
    "Base Im.": () => tContabilidad("libro_diario.cabBaseIm"),
    "% IVA": () => tContabilidad("libro_diario.cabIva"),
    "R.E.": () => tContabilidad("libro_diario.cabRe"),
};

/** Texto visible de una cabecera del resultado, en el idioma activo. */
export const textoCabeceraLibroDiario = (cabecera: string): string =>
    TEXTO_CABECERA[cabecera]?.() ?? cabecera;

/** Los textos de mes, asiento y totales ocupan las columnas de antes de
 * «Debe»; el del asiento empieza tras su fecha y número. */
export const COLUMNA_DEBE_LIBRO_DIARIO = 6;

export const importeLibroDiario = (valor: number | null): string =>
    valor === null
        ? ""
        : valor.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

/** Una celda del resultado agrupado: texto y cuántas columnas ocupa. */
export interface CeldaLibroDiario {
    texto: string;
    columnas: number;
    numerica: boolean;
}

const texto = (valor: string, columnas = 1): CeldaLibroDiario => ({
    texto: valor,
    columnas,
    numerica: false,
});

const numero = (valor: string): CeldaLibroDiario => ({
    texto: valor,
    columnas: 1,
    numerica: true,
});

const vacias = (cuantas: number): CeldaLibroDiario[] =>
    Array.from({ length: cuantas }, () => texto(""));

const celdasIva = (fila: FilaLibroDiario): CeldaLibroDiario[] =>
    fila.tipo === "partida" && fila.baseImponible !== null
        ? [
              texto(fila.codigoSerie ?? ""),
              numero(fila.factura === null ? "" : String(fila.factura)),
              numero(importeLibroDiario(fila.baseImponible)),
              numero(importeLibroDiario(fila.iva)),
              numero(importeLibroDiario(fila.recargo)),
          ]
        : vacias(CABECERAS_IVA_LIBRO_DIARIO.length);

/**
 * Celdas de una fila agrupada, con el mismo reparto que el PDF: el mes ocupa
 * toda la fila; el asiento, fecha, número y su concepto; la partida, sus
 * datos (y los de I.V.A. si los tiene); los totales, su texto con el
 * descuadre, debe y haber.
 */
export const celdasFilaLibroDiario = (
    fila: FilaLibroDiario,
    datosIva: boolean
): CeldaLibroDiario[] => {
    const total =
        CABECERAS_LIBRO_DIARIO.length +
        (datosIva ? CABECERAS_IVA_LIBRO_DIARIO.length : 0);
    const iva = datosIva ? celdasIva(fila) : [];
    const debeHaber = [
        numero(importeLibroDiario(fila.debe)),
        numero(importeLibroDiario(fila.haber)),
    ];

    switch (fila.tipo) {
        case "mes":
            return [texto(fila.titulo, total)];
        case "asiento":
            return [
                texto(fila.fecha ? formatearFechaDate(fila.fecha) : ""),
                numero(
                    fila.asientoNumero === null ? "" : String(fila.asientoNumero)
                ),
                texto(fila.titulo, COLUMNA_DEBE_LIBRO_DIARIO - 2),
                ...vacias(2),
                ...iva,
            ];
        case "partida":
            return [
                ...vacias(2),
                texto(fila.documento),
                texto(fila.codigoSubcuenta),
                texto(fila.descripcionSubcuenta),
                texto(fila.titulo),
                ...debeHaber,
                ...iva,
            ];
        default:
            return [
                texto(
                    tContabilidad("libro_diario.tituloDescuadreDescuadre", { titulo: fila.titulo, descuadre: importeLibroDiario(fila.descuadre) }),
                    COLUMNA_DEBE_LIBRO_DIARIO
                ),
                ...debeHaber,
                ...iva,
            ];
    }
};
