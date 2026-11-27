import type { QKanbanColumna } from "@olula/componentes/atomos/qkanban.tsx";
import type { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { createElement } from "react";
import type { EstadoOportunidad, OportunidadVenta } from "../diseño.ts";
import {
    crearMapaProbabilidadEstados,
    obtenerTotalesOportunidadesPorEstado,
} from "../dominio.ts";
import { tCrm } from "../../i18n/index.ts";

export const crearColumnasKanbanOportunidad = (
    estados: EstadoOportunidad[]
): QKanbanColumna[] =>
    [...estados]
        .sort(
            (a, b) =>
                a.probabilidad - b.probabilidad ||
                String(a.id).localeCompare(String(b.id))
        )
        .map((estado) => ({
            id: String(estado.id),
            etiqueta: estado.descripcion ?? String(estado.id),
        }));

export const crearFiltroEstadoOportunidad = (
    valor: unknown
): ClausulaFiltro | null => {
    const valores = Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : [];

    if (!valores.length) return null;

    return ["estado_id", "in", valores as unknown as string] as ClausulaFiltro;
};

export const crearOpcionesFiltroEstadoOportunidad = (
    estados: EstadoOportunidad[]
) =>
    estados.map((estado) => ({
        valor: String(estado.id),
        descripcion: estado.descripcion ?? String(estado.id),
    }));

export const enriquecerColumnasKanbanOportunidad = (
    columnas: QKanbanColumna[],
    oportunidades: OportunidadVenta[],
    estados: EstadoOportunidad[]
): QKanbanColumna[] => {
    const probabilidadPorEstado = crearMapaProbabilidadEstados(estados);
    const totalesPorEstado = obtenerTotalesOportunidadesPorEstado(
        oportunidades,
        probabilidadPorEstado
    );

    return columnas.map((columna) => {
        const totales = totalesPorEstado.get(String(columna.id));
        const totalImporte = totales?.totalImporte ?? 0;
        const totalPrevision = totales?.totalPrevision ?? 0;

        return {
            ...columna,
            resumen: createElement(
                "div",
                { className: "qkanban-resumen-oportunidad" },
                createElement(
                    "div",
                    { className: "qkanban-resumen-total" },
                    createElement("strong", null, tCrm("oportunidadventa.totalTotalimporte", { totalImporte: formatearMoneda(totalImporte, "EUR") }))
                ),
                createElement(
                    "div",
                    { className: "qkanban-resumen-ponderado" },
                    tCrm("oportunidadventa.ponderadoTotalprevision", { totalPrevision: formatearMoneda(totalPrevision, "EUR") })
                )
            ),
        };
    });
};