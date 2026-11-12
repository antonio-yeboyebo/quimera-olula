import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    AGENTE_CLIENTE,
    AGENTE_FACTURA,
    ComparativaVentas,
    NuevaComparativaVentas,
} from "./diseño.ts";

export const opcionesBusquedaAgente = [
    { valor: AGENTE_FACTURA, descripcion: AGENTE_FACTURA },
    { valor: AGENTE_CLIENTE, descripcion: AGENTE_CLIENTE },
];

export const opcionesIntervalo = [
    { valor: "", descripcion: "Sin intervalo" },
    { valor: "000001", descripcion: "Hoy" },
    { valor: "000002", descripcion: "Ayer" },
    { valor: "000003", descripcion: "Esta semana" },
    { valor: "000004", descripcion: "Semana pasada" },
    { valor: "000005", descripcion: "Este mes" },
    { valor: "000006", descripcion: "Mes pasado" },
    { valor: "000007", descripcion: "Este año" },
    { valor: "000008", descripcion: "Año pasado" },
    { valor: "000009", descripcion: "Todo" },
    { valor: "000010", descripcion: "Hasta hoy" },
];

export const etiquetaComparativaVentas = (
    comparativa: Pick<ComparativaVentas, "descripcion" | "anioDesde" | "anioHasta">
): string =>
    `${comparativa.descripcion} — ${comparativa.anioDesde}-${comparativa.anioHasta}`;

const camposComunes = () => ({
    descripcion: "",
    intervaloId: "",
    fechaDesde: "",
    fechaHasta: "",
    clienteId: "",
    nombreCliente: "",
    agenteId: "",
    nombreAgente: "",
    busquedaAgente: AGENTE_FACTURA,
    provinciaId: "",
    nombreProvincia: "",
    mostrarObjetivo: false,
});

const aniosPorDefecto = () => ({
    anioDesde: new Date().getFullYear() - 2,
    anioHasta: new Date().getFullYear(),
});

export const comparativaVentasVacia = (): ComparativaVentas => ({
    id: "",
    ...aniosPorDefecto(),
    ...camposComunes(),
});

export const nuevaComparativaVentasInicial = (): NuevaComparativaVentas => ({
    ...aniosPorDefecto(),
    ...camposComunes(),
});

export const admiteFechas = (
    comparativa: Pick<ComparativaVentas, "mostrarObjetivo" | "intervaloId">
): boolean => !comparativa.mostrarObjetivo && !comparativa.intervaloId;

const esAnio = (valor: unknown): boolean => /^\d{4}$/.test(String(valor ?? ""));

export const aniosInformados = (
    comparativa: Pick<NuevaComparativaVentas, "anioDesde" | "anioHasta">
): boolean => esAnio(comparativa.anioDesde) && esAnio(comparativa.anioHasta);

const fechaIso = (fecha: Date): string =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

const dia = (anio: number, mes: number, diaMes: number): string =>
    fechaIso(new Date(anio, mes, diaMes));

export const fechasIntervalo = (
    intervaloId: string,
    hoy: Date,
    anioDesde: number
): [string, string] | null => {
    const [a, m, d] = [hoy.getFullYear(), hoy.getMonth(), hoy.getDate()];
    const lunes = d - ((hoy.getDay() + 6) % 7);
    const intervalos: Record<string, [string, string]> = {
        "000001": [dia(a, m, d), dia(a, m, d)],
        "000002": [dia(a, m, d - 1), dia(a, m, d - 1)],
        "000003": [dia(a, m, lunes), dia(a, m, lunes + 6)],
        "000004": [dia(a, m, lunes - 7), dia(a, m, lunes - 1)],
        "000005": [dia(a, m, 1), dia(a, m + 1, 0)],
        "000006": [dia(a, m - 1, 1), dia(a, m, 0)],
        "000007": [dia(a, 0, 1), dia(a, 11, 31)],
        "000008": [dia(a - 1, 0, 1), dia(a - 1, 11, 31)],
        "000009": ["", ""],
        "000010": [dia(anioDesde, 0, 1), dia(a, m, d)],
    };
    return intervalos[intervaloId] ?? null;
};

export const enlazarAnios = <T extends NuevaComparativaVentas>(
    entrada: T,
    campo: string
): T => {
    const modelo = {
        ...entrada,
        mostrarObjetivo: String(entrada.mostrarObjetivo) === "true",
        intervaloId: entrada.intervaloId ?? "",
    };
    if (campo === "anioDesde" && esAnio(modelo.anioDesde)) {
        return { ...modelo, anioDesde: Number(modelo.anioDesde), anioHasta: Number(modelo.anioDesde) + 2 };
    }
    if (campo === "anioHasta" && esAnio(modelo.anioHasta)) {
        return { ...modelo, anioHasta: Number(modelo.anioHasta), anioDesde: Number(modelo.anioHasta) - 2 };
    }
    if (campo === "intervaloId") {
        const fechas = fechasIntervalo(modelo.intervaloId, new Date(), Number(modelo.anioDesde));
        return fechas ? { ...modelo, fechaDesde: fechas[0], fechaHasta: fechas[1] } : modelo;
    }
    if (campo === "mostrarObjetivo" && modelo.mostrarObjetivo) {
        return { ...modelo, fechaDesde: "", fechaHasta: "" };
    }
    return modelo;
};

const validarComparativa = (modelo: NuevaComparativaVentas): string | boolean => {
    if (!esAnio(modelo.anioDesde) || !esAnio(modelo.anioHasta)) {
        return "Los años deben tener 4 cifras";
    }
    if (Number(modelo.anioHasta) !== Number(modelo.anioDesde) + 2) {
        return "El año hasta debe ser el año desde más 2";
    }
    if (modelo.fechaDesde && modelo.fechaHasta && modelo.fechaDesde > modelo.fechaHasta) {
        return "La fecha desde no puede ser posterior a la fecha hasta";
    }
    return true;
};

export const metaComparativaVentas = <T extends NuevaComparativaVentas>(): MetaModelo<T> => ({
    campos: {
        descripcion: { requerido: true },
        anioDesde: { requerido: true, tipo: "entero" },
        anioHasta: { requerido: true, tipo: "entero" },
        fechaDesde: { tipo: "fecha" },
        fechaHasta: { tipo: "fecha" },
        mostrarObjetivo: { tipo: "checkbox" },
    },
    editable: (modelo, campo) =>
        !(campo === "fechaDesde" || campo === "fechaHasta") || admiteFechas(modelo),
    validacion: validarComparativa,
    onChange: enlazarAnios,
});

export const nombreFicheroComparativaVentas = (
    comparativa: Pick<ComparativaVentas, "descripcion">
): string => {
    const base = (comparativa.descripcion || "comparativa ventas")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "comparativa-ventas"}.pdf`;
};
