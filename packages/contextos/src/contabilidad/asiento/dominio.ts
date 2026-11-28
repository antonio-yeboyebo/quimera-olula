import { preferencias } from "@olula/lib/preferencias.ts";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { formatearFechaDate, MetaModelo } from "@olula/lib/dominio.ts";
import {
    Asiento,
    ItemAsiento,
    NuevoAsientoManual,
    PartidaAsiento,
    PartidaManualInput,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export const metaPartidaManual: MetaModelo<PartidaManualInput> = {
    campos: {
        subcuentaId: {
            tipo: "numero",
            requerido: true,
            // `requerido` solo rechaza null/undefined/"": el 0 de una partida
            // recién añadida hay que rechazarlo aquí.
            validacion: (p) => (p.subcuentaId > 0 ? true : tContabilidad("asiento.seleccionaUnaSubcuenta")),
        },
        debe: { tipo: "numero", requerido: true, positivo: true },
        haber: { tipo: "numero", requerido: true, positivo: true },
        concepto: { requerido: false },
    },
};

export const metaNuevoAsientoManual: MetaModelo<NuevoAsientoManual> = {
    campos: {
        ejercicioId: { requerido: true },
        fecha: { requerido: true },
        concepto: {
            requerido: true,
            validacion: (m) => (m.concepto.trim().length > 0 ? true : tContabilidad("asiento.indicaUnConcepto")),
        },
        // Opcionales e independientes: un asiento manual normal no tiene
        // documento de origen.
        tipoDocumento: { requerido: false },
        documento: { requerido: false },
        partidas: { itemMeta: metaPartidaManual, minItems: 2 },
    },
    validacion: (m) =>
        asientoCuadrado(m.partidas)
            ? true
            : tContabilidad("asiento.elAsientoEstaDescuadradoEnTofixed", { toFixed: descuadrePartidas(m.partidas).toFixed(2) }),
};

export const partidaManualVacia = (): PartidaManualInput => ({
    subcuentaId: 0,
    debe: 0,
    haber: 0,
    concepto: "",
});

export const nuevoAsientoManualVacio = (ejercicioId: string): NuevoAsientoManual => ({
    ejercicioId,
    fecha: new Date(),
    concepto: "",
    tipoDocumento: "",
    documento: "",
    partidas: [partidaManualVacia(), partidaManualVacia()],
});

export const asientoVacio = (): Asiento => ({
    id: "",
    numero: 0,
    ejercicioId: "",
    fecha: new Date(),
    concepto: "",
    importe: 0,
    manual: false,
    tipoDocumento: "",
    documento: "",
    partidas: [],
});

export const totalDebe = (partidas: Pick<PartidaAsiento | PartidaManualInput, "debe">[]): number =>
    partidas.reduce((acc, p) => acc + (p.debe || 0), 0);

export const totalHaber = (partidas: Pick<PartidaAsiento | PartidaManualInput, "haber">[]): number =>
    partidas.reduce((acc, p) => acc + (p.haber || 0), 0);

export const descuadrePartidas = (
    partidas: Pick<PartidaAsiento | PartidaManualInput, "debe" | "haber">[]
): number => totalDebe(partidas) - totalHaber(partidas);

export const asientoCuadrado = (
    partidas: Pick<PartidaAsiento | PartidaManualInput, "debe" | "haber">[]
): boolean => Math.abs(descuadrePartidas(partidas)) < 0.005;

export const etiquetaAsiento = (a: ItemAsiento | Asiento): string =>
    `${a.ejercicioId} · nº ${a.numero} · ${formatearFechaDate(a.fecha)}`;

/** Clave de preferencias con el ejercicio de trabajo elegido en la pantalla
 * de ejercicios (el servidor lo guarda además en `flsettings`, como Eneboo). */
export const PREFERENCIA_EJERCICIO_ACTUAL = "contabilidad.ejercicioActual";

export const ejercicioActual = (): string => {
    try {
        const elegido = preferencias.get<string>(PREFERENCIA_EJERCICIO_ACTUAL, "");
        if (elegido) return elegido;
    } catch {
        // Sin almacenamiento local: el año en curso.
    }
    return String(new Date().getFullYear());
};

const clausulasFiltro = (filtro: Criteria["filtro"]): ClausulaFiltro[] => {
    if (Array.isArray(filtro) && filtro.length > 0 && Array.isArray(filtro[0])) {
        return filtro as ClausulaFiltro[];
    }
    if (Array.isArray(filtro) && typeof filtro[0] === "string") {
        return [filtro as ClausulaFiltro];
    }
    return [];
};

/** Ejercicio del filtro activo del listado (`ejercicio_id:eq:`). */
export const ejercicioIdEnCriteria = (criteria: Criteria): string | undefined => {
    for (const clausula of clausulasFiltro(criteria.filtro)) {
        if (clausula[0] === "ejercicio_id" && clausula[1] === "eq" && clausula[2] !== undefined) {
            return String(clausula[2]);
        }
    }
    return undefined;
};

export const ejercicioIdParaRenumerar = (criteria: Criteria): string =>
    ejercicioIdEnCriteria(criteria) ?? ejercicioActual();

export const mensajeConfirmacionRenumerarAsientos = (ejercicioId: string): string =>
    tContabilidad("asiento.seVaAProcederARenumerar", { ejercicioId });
