import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { EstadoOportunidad, OportunidadVenta } from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

export type SerieEstadoPrevision = {
    estadoId: string;
    estadoDescripcion: string;
    probabilidad: number;
    oportunidades: number;
    importeTotal: number;
    prevision: number;
};

type ColumnaConId = {
    id: string;
};

export const crearMapaProbabilidadEstados = (
    estados: EstadoOportunidad[]
): Map<string, number> =>
    new Map(estados.map((estado) => [String(estado.id), estado.probabilidad]));

export const obtenerIdsEstadosTerminales = (
    estados: EstadoOportunidad[]
): string[] =>
    estados
        .filter((estado) => estado.probabilidad === 0 || estado.probabilidad === 100)
        .map((estado) => String(estado.id));

export const calcularPrevisionPonderada = (
    importe: number,
    probabilidad: number
): number => (importe * probabilidad) / 100;

export const filtrarColumnasKanbanPorEstado = <T extends ColumnaConId>(
    columnas: T[],
    filtro: ClausulaFiltro[]
): T[] => {
    const filtrosEstado = filtro.filter(
        ([campo, operador]) =>
            campo === "estado_id" && (operador === "in" || operador === "!in")
    );

    if (!filtrosEstado.length) return columnas;

    return columnas.filter((columna) => {
        const idColumna = String(columna.id);

        return filtrosEstado.every(([, operador, valor]) => {
            const valores = Array.isArray(valor)
                ? valor.map(String)
                : String(valor)
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean);

            if (operador === "in") return valores.includes(idColumna);
            if (operador === "!in") return !valores.includes(idColumna);
            return true;
        });
    });
};

export const obtenerTotalesOportunidadesPorEstado = (
    oportunidades: Pick<OportunidadVenta, "estado_id" | "importe" | "probabilidad">[],
    probabilidadPorEstado: Map<string, number>
): Map<string, { oportunidades: number; totalImporte: number; totalPrevision: number }> => {
    const acumulado = new Map<
        string,
        { oportunidades: number; totalImporte: number; totalPrevision: number }
    >();

    for (const oportunidad of oportunidades) {
        const estadoId = String(oportunidad.estado_id);
        const totalActual = acumulado.get(estadoId) ?? {
            oportunidades: 0,
            totalImporte: 0,
            totalPrevision: 0,
        };
        const probabilidad =
            probabilidadPorEstado.get(estadoId) ?? oportunidad.probabilidad ?? 0;
        const importe = oportunidad.importe ?? 0;

        acumulado.set(estadoId, {
            oportunidades: totalActual.oportunidades + 1,
            totalImporte: totalActual.totalImporte + importe,
            totalPrevision:
                totalActual.totalPrevision +
                calcularPrevisionPonderada(importe, probabilidad),
        });
    }

    return acumulado;
};

export const agruparPrevisionPorEstado = (
    oportunidades: Pick<
        OportunidadVenta,
        "estado_id" | "descripcion_estado" | "importe" | "probabilidad"
    >[],
    probabilidadesPorEstado: Map<string, number>
): SerieEstadoPrevision[] => {
    const totalesPorEstado = obtenerTotalesOportunidadesPorEstado(
        oportunidades,
        probabilidadesPorEstado
    );

    const agrupadas = oportunidades.reduce<Map<string, SerieEstadoPrevision>>(
        (acumulado, oportunidad) => {
            const estadoId = String(oportunidad.estado_id);
            if (acumulado.has(estadoId)) return acumulado;

            const totales = totalesPorEstado.get(estadoId);
            const probabilidad =
                probabilidadesPorEstado.get(estadoId) ?? oportunidad.probabilidad ?? 0;

            acumulado.set(estadoId, {
                estadoId,
                estadoDescripcion:
                    oportunidad.descripcion_estado ?? tCrm("oportunidadventa.estadoEstadoid", { estadoId }),
                probabilidad,
                oportunidades: totales?.oportunidades ?? 0,
                importeTotal: totales?.totalImporte ?? 0,
                prevision: totales?.totalPrevision ?? 0,
            });

            return acumulado;
        },
        new Map()
    );

    return Array.from(agrupadas.values()).sort((a, b) => b.prevision - a.prevision);
};
