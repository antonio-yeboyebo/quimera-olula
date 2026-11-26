import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { LibroMayor } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroLibroMayor = "INICIAL" | "CREANDO";

export type ContextoMaestroLibroMayor = {
    estado: EstadoMaestroLibroMayor;
    informes: ListaActivaEntidades<LibroMayor>;
};

export const metaTablaLibroMayor: MetaTabla<LibroMayor> = [
    { id: "descripcion", get cabecera() { return tContabilidad("libro_mayor.descripcion"); } },
    { id: "ejercicioId", get cabecera() { return tContabilidad("libro_mayor.ejercicio"); } },
    { id: "fechaDesde", get cabecera() { return tContabilidad("libro_mayor.desde"); } },
    { id: "fechaHasta", get cabecera() { return tContabilidad("libro_mayor.hasta"); } },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroLibroMayor: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("libro_mayor.descripcion"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("libro_mayor.ejercicio"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaLibroMayorDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
