import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import {
    FilaPatrimonioNeto,
    FormatoHoja,
    NuevoPatrimonioNeto,
    PatrimonioNeto,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export { ejercicioActual };

/** Filas de saldo, que cierran cada bloque y se resaltan. */
const FILAS_SALDO = ["saldo_final_anterior", "saldo_inicio", "saldo_final"];

export const etiquetaPatrimonioNeto = (
    p: Pick<PatrimonioNeto, "descripcion" | "ejercicioId">
): string =>
    p.descripcion
        ? `${p.descripcion} — ${p.ejercicioId}`
        : tContabilidad("patrimonio_neto.patrimonioNetoEjercicioid", { ejercicioId: p.ejercicioId });

export const patrimonioNetoVacio = (): PatrimonioNeto => ({
    id: "",
    descripcion: "",
    ejercicioId: "",
    ejercicioAnteriorId: "",
    ejercicioAnteriorAnteriorId: "",
});

/** Propone como anterior el código del año previo, si el ejercicio actual
 * tiene forma de año; si no existe, el usuario lo vacía o lo corrige. */
export const ejercicioPrevio = (ejercicioId: string): string =>
    /^\d{4}$/.test(ejercicioId) ? String(Number(ejercicioId) - 1) : "";

export const nuevoPatrimonioNetoInicial = (
    ejercicioId: string
): NuevoPatrimonioNeto => ({
    descripcion: "",
    ejercicioId,
    ejercicioAnteriorId: ejercicioPrevio(ejercicioId),
    ejercicioAnteriorAnteriorId: "",
});

export const esFilaSaldo = (fila: Pick<FilaPatrimonioNeto, "clave">): boolean =>
    FILAS_SALDO.includes(fila.clave);

/** Eneboo deja en blanco las celdas a cero. */
export const importePatrimonioNeto = (valor: number): string =>
    valor
        ? valor.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : "";

export const nombreFicheroPatrimonioNeto = (
    informe: Pick<PatrimonioNeto, "descripcion" | "ejercicioId">,
    extension: "pdf" | FormatoHoja
): string => {
    const base = (informe.descripcion || `patrimonio-neto-${informe.ejercicioId}`)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "patrimonio-neto"}.${extension}`;
};
