import { formatearNumero } from "@olula/lib/dominio.ts";
import { OpcionesCargaFichero, ResultadoCargaFichero, SeparadorFichero } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

/** Ficheros que lee el servidor: texto con separador, Excel y OpenDocument. */
export const EXTENSIONES_FICHERO = [".csv", ".txt", ".xlsx", ".ods"];

export type FormatoFichero = "texto" | "xlsx" | "ods";

export const formatoFichero = (nombre: string): FormatoFichero | null => {
    const extension = nombre.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
    if (extension === ".csv" || extension === ".txt") return "texto";
    if (extension === ".xlsx") return "xlsx";
    if (extension === ".ods") return "ods";
    return null;
};

/** En el desplegable "auto" es detectar (QSelect toma "" como vacío). */
const SEPARADOR_DETECTAR = "auto";

export const opcionesSeparador: { valor: string; descripcion: string }[] = [
    { valor: SEPARADOR_DETECTAR, get descripcion() { return tAlmacen("inventario.detectar"); } },
    { valor: "|", get descripcion() { return tAlmacen("inventario.barraVertical"); } },
    { valor: ";", get descripcion() { return tAlmacen("inventario.puntoYComa"); } },
    { valor: ",", get descripcion() { return tAlmacen("inventario.coma"); } },
    { valor: "\t", get descripcion() { return tAlmacen("inventario.tabulador"); } },
];

export const separadorAOpcion = (separador: SeparadorFichero): string =>
    separador || SEPARADOR_DETECTAR;

export const separadorDesdeOpcion = (valor: string | undefined): SeparadorFichero =>
    opcionesSeparador.some((o) => o.valor === valor) && valor !== SEPARADOR_DETECTAR
        ? (valor as SeparadorFichero)
        : "";

export const opcionesCargaIniciales = (): OpcionesCargaFichero => ({
    separador: "",
    ignorarPrimeraLinea: false,
    simular: false,
    omitirRechazadas: false,
});

/** Lecturas pegadas a mano (referencia|cantidad|ubicación) como un fichero de texto. */
export const ficheroDesdeTexto = (texto: string): File =>
    new File([texto], "lecturas.txt", { type: "text/plain" });

const plural = (n: number, singular: string, plural: string) =>
    `${formatearNumero(n)} ${n === 1 ? singular : plural}`;

export const resumenCarga = (resultado: ResultadoCargaFichero, simulado: boolean): string => {
    const lecturas = plural(resultado.lecturas, tAlmacen("inventario.lecturaValida"), tAlmacen("inventario.lecturasValidas"));
    const articulos = plural(resultado.articulos.length, tAlmacen("inventario.articulo2"), tAlmacen("inventario.articulos"));
    const rechazadas = plural(resultado.rechazadas.length, tAlmacen("inventario.filaRechazada"), tAlmacen("inventario.filasRechazadas2"));
    if (resultado.cargado) {
        const lineas = plural(resultado.lineas, tAlmacen("inventario.lineaRegularizada"), tAlmacen("inventario.lineasRegularizadas"));
        return resultado.rechazadas.length
            ? tAlmacen("inventario.cargadoLecturasDeArticulosLineasOmitidas", { lecturas, articulos, lineas, rechazadas })
            : tAlmacen("inventario.cargadoLecturasDeArticulosLineas", { lecturas, articulos, lineas });
    }
    if (simulado) {
        return tAlmacen("inventario.simulacionNoSeHaGrabadoNada", { lecturas, articulos, rechazadas });
    }
    return resultado.rechazadas.length
        ? tAlmacen("inventario.noSeHaCargadoNadaRechazadas", { rechazadas })
        : tAlmacen("inventario.noSeHaCargadoNadaEl");
};
