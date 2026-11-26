import {
    NuevaRegularizacionIva,
    PeriodoRegularizacion,
    RegularizacionIva,
    Trimestre,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const MESES_TRIMESTRE: Record<Exclude<Trimestre, "OTRO">, number> = {
    T1: 0,
    T2: 3,
    T3: 6,
    T4: 9,
};

export const opcionesTrimestre = [
    { valor: "T1", get descripcion() { return tContabilidad("regularizacion_iva.t1erTrimestre"); } },
    { valor: "T2", get descripcion() { return tContabilidad("regularizacion_iva.t2Trimestre"); } },
    { valor: "T3", get descripcion() { return tContabilidad("regularizacion_iva.t3erTrimestre"); } },
    { valor: "T4", get descripcion() { return tContabilidad("regularizacion_iva.t4Trimestre"); } },
    { valor: "OTRO", get descripcion() { return tContabilidad("regularizacion_iva.otroPeriodo"); } },
];

const fechaLocal = (anyo: number, mes: number, dia: number): Date =>
    new Date(anyo, mes, dia, 12, 0, 0);

/** Fechas del trimestre como `co_regiva.qs::calculateField`: del día 1 del
 * primer mes al último día del tercero. */
export const fechasTrimestre = (
    anyo: number,
    trimestre: Exclude<Trimestre, "OTRO">
): { fechaInicio: Date; fechaFin: Date } => {
    const mes = MESES_TRIMESTRE[trimestre];
    return {
        fechaInicio: fechaLocal(anyo, mes, 1),
        fechaFin: fechaLocal(anyo, mes + 3, 0),
    };
};

const anyoEjercicio = (ejercicioId: string): number => {
    const anyo = Number.parseInt(ejercicioId, 10);
    return Number.isNaN(anyo) ? new Date().getFullYear() : anyo;
};

/** Fechas que propone el periodo elegido en el ejercicio; con «Otro
 * periodo» no hay propuesta y se dejan las que haya. */
export const fechasPeriodo = (
    ejercicioId: string,
    trimestre: Trimestre
): { fechaInicio: Date; fechaFin: Date } | null =>
    trimestre === "OTRO"
        ? null
        : fechasTrimestre(anyoEjercicio(ejercicioId), trimestre);

/** Periodo de unas fechas, como `co_regiva.qs::calculateField("periodo")`:
 * un trimestre natural completo o «Otro periodo». */
export const trimestreDeFechas = (
    fechaInicio: Date | null,
    fechaFin: Date | null
): Trimestre => {
    if (!fechaInicio || !fechaFin) return "OTRO";
    const trimestre = (Object.keys(MESES_TRIMESTRE) as Exclude<Trimestre, "OTRO">[])
        .find((t) => {
            const fechas = fechasTrimestre(fechaInicio.getFullYear(), t);
            return (
                fechaInicio.getMonth() === fechas.fechaInicio.getMonth() &&
                fechaInicio.getDate() === 1 &&
                fechaFin.getFullYear() === fechaInicio.getFullYear() &&
                fechaFin.getMonth() === fechas.fechaFin.getMonth() &&
                fechaFin.getDate() === fechas.fechaFin.getDate()
            );
        });
    return trimestre ?? "OTRO";
};

/** Como `co_regiva.qs::bufferChanged`: al cambiar el periodo (o el
 * ejercicio) se cargan sus fechas y al cambiar las fechas se recalcula el
 * periodo. Las fechas siempre se pueden modificar a mano. */
export const cambiarNuevaRegularizacion = (
    nueva: NuevaRegularizacionIva,
    campo: string
): NuevaRegularizacionIva => {
    if (campo === "trimestre" || campo === "ejercicioId") {
        const fechas = fechasPeriodo(nueva.ejercicioId, nueva.trimestre);
        return fechas ? { ...nueva, ...fechas } : nueva;
    }
    if (campo === "fechaInicio" || campo === "fechaFin") {
        return {
            ...nueva,
            trimestre: trimestreDeFechas(nueva.fechaInicio, nueva.fechaFin),
        };
    }
    return nueva;
};

/** Periodo a enviar: las fechas del formulario (cargadas del periodo o
 * cambiadas a mano). Sin fecha de asiento se usa el fin del periodo, como
 * propone Eneboo. */
export const periodoNuevaRegularizacion = (
    nueva: NuevaRegularizacionIva
): PeriodoRegularizacion => ({
    fechaInicio: nueva.fechaInicio,
    fechaFin: nueva.fechaFin,
    fechaAsiento: nueva.fechaAsiento ?? nueva.fechaFin,
});

/** Trimestre siguiente al último regularizado del ejercicio (Eneboo propone
 * empezar el día después de la última regularización). */
export const trimestreSiguiente = (
    regularizaciones: Pick<RegularizacionIva, "ejercicioId" | "periodo">[],
    ejercicioId: string
): Trimestre => {
    const hechos = regularizaciones
        .filter((r) => r.ejercicioId === ejercicioId)
        .map((r) => r.periodo);
    const siguiente = (["T1", "T2", "T3", "T4"] as const).find(
        (t) => !hechos.includes(t)
    );
    return siguiente ?? "OTRO";
};

export const etiquetaRegularizacionIva = (
    r: Pick<RegularizacionIva, "ejercicioId" | "periodo">
): string => tContabilidad("regularizacion_iva.regularizacionIvaEjercicioidPeriodo", { ejercicioId: r.ejercicioId, periodo: r.periodo });

export const regularizacionIvaVacia = (): RegularizacionIva => ({
    id: "",
    ejercicioId: "",
    periodo: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    fechaAsiento: new Date(),
    asientoId: "",
    numeroAsiento: null,
    importe: null,
    codigoSubcuentaDeudora: "",
    codigoSubcuentaAcreedora: "",
});
