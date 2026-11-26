import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { LibroDiario } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroLibroDiario = "INICIAL" | "CREANDO";

export type ContextoMaestroLibroDiario = {
    estado: EstadoMaestroLibroDiario;
    informes: ListaActivaEntidades<LibroDiario>;
};

export const metaTablaLibroDiario: MetaTabla<LibroDiario> = [
    { id: "descripcion", get cabecera() { return tContabilidad("libro_diario.descripcion"); } },
    { id: "ejercicioId", get cabecera() { return tContabilidad("libro_diario.ejercicio"); } },
    { id: "fechaDesde", get cabecera() { return tContabilidad("libro_diario.desde"); } },
    { id: "fechaHasta", get cabecera() { return tContabilidad("libro_diario.hasta"); } },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroLibroDiario: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("libro_diario.descripcion"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("libro_diario.ejercicio"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaLibroDiarioDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
