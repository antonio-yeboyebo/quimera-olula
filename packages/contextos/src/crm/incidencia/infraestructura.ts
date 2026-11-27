import { getAcciones } from "#/crm/accion/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { DeleteIncidencia, GetIncidencia, GetIncidencias, Incidencia, PatchIncidencia, PostIncidencia } from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const baseUrlIncidencia = new ApiUrls().INCIDENCIA;

type IncidenciaAPI = Incidencia & { fecha: string };

export const incidenciaDesdeApi = (incidenciaAPI: IncidenciaAPI): Incidencia => ({
    ...incidenciaAPI,
    fecha: new Date(Date.parse(incidenciaAPI.fecha))
});

export const getIncidencia: GetIncidencia = async (id) =>
    await RestAPI.get<{ datos: IncidenciaAPI }>(`${baseUrlIncidencia}/${id}`).then((respuesta) =>
        incidenciaDesdeApi(respuesta.datos)
    );

export const getIncidencias: GetIncidencias = async (
    filtro, orden, paginacion
) => {

    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: IncidenciaAPI[]; total: number }>(baseUrlIncidencia + q);

    return { datos: respuesta.datos.map(incidenciaDesdeApi), total: respuesta.total };
};

export const postIncidencia: PostIncidencia = async (incidencia) => {
    const incidenciaAPI = {
        ...incidencia,
        fecha: incidencia.fecha?.toISOString().slice(0, 10),
    };

    return await RestAPI.post(baseUrlIncidencia, incidenciaAPI, tCrm("incidencia.errorAlGuardarIncidencia")).then(
        (respuesta) => respuesta.id
    );
};

export const patchIncidencia: PatchIncidencia = async (id, incidencia) => {
    const incidenciaAPI = {
        ...incidencia,
        fecha: incidencia.fecha?.toISOString().slice(0, 10),
    };

    const IncidenciaSinNulls = Object.fromEntries(
        Object.entries(incidenciaAPI).map(([k, v]) => [k, v === null ? "" : v])
    );

    await RestAPI.patch(`${baseUrlIncidencia}/${id}`, IncidenciaSinNulls, tCrm("incidencia.errorAlGuardarIncidencia"));
};

export const deleteIncidencia: DeleteIncidencia = async (id) => {
    await RestAPI.delete(`${baseUrlIncidencia}/${id}`, tCrm("incidencia.errorAlBorrarIncidencia"));
}

export const getAccionesIncidencia = async (incidenciaId: string) => {
    return getAcciones([['incidencia_id', incidenciaId]], [], { limite: 50, pagina: 1 });
};
