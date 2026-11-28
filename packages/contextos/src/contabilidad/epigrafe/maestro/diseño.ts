import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { Epigrafe } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroEpigrafe = 'INICIAL' | 'CREANDO';

export type ContextoMaestroEpigrafe = {
    estado: EstadoMaestroEpigrafe;
    epigrafes: ListaActivaEntidades<Epigrafe>;
};

export const metaTablaEpigrafe: MetaTabla<Epigrafe> = [
    { id: 'codigo', get cabecera() { return tContabilidad("epigrafe.codigo"); } },
    { id: 'descripcion', get cabecera() { return tContabilidad("epigrafe.descripcion"); } },
    { id: 'codigoGrupo', get cabecera() { return tContabilidad("epigrafe.grupo"); } },
    { id: 'ejercicioId', get cabecera() { return tContabilidad("epigrafe.ejercicio"); } },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroEpigrafe: MetaFiltro = {
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("epigrafe.ejercicio"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
    codigo: {
        id: "codigo",
        campo: "codigo",
        get label() { return tContabilidad("epigrafe.codigo"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["codigo", "~", valor as string];
        },
    },
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("epigrafe.descripcion"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["descripcion", "~", valor as string];
        },
    },
};

export const criteriaEpigrafesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "eq", ejercicioActual()]],
    orden: ["codigo", "ASC"],
});
