import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { Accion, DeleteAccion, GetAccion, GetAcciones, PatchAccion, PostAccion } from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

export type AccionAPI = Omit<Accion, "fecha" | "fecha_fin"> & {
    fecha: string | null;
    fecha_fin?: string | null;
};

export const accionDesdeAPI = (accionAPI: AccionAPI): Accion => ({
    ...accionAPI,
    fecha: accionAPI.fecha ? new Date(Date.parse(accionAPI.fecha)) : null,
    fecha_fin: accionAPI.fecha_fin ? new Date(Date.parse(accionAPI.fecha_fin)) : null,
} as Accion)

export const getAccion: GetAccion = async (id) =>
    await RestAPI.get<{ datos: AccionAPI }>(`${new ApiUrls().ACCION}/${id}`).then((respuesta) => accionDesdeAPI(respuesta.datos));

export const getAcciones: GetAcciones = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: AccionAPI[]; total: number }>(new ApiUrls().ACCION + q);
    return { datos: respuesta.datos.map(accionDesdeAPI), total: respuesta.total };
};

export const postAccion: PostAccion = async (accion) => {
    const body = {
        ...accion,
        fecha: accion.fecha?.toISOString().slice(0, 10)
    };

    return await RestAPI.post(new ApiUrls().ACCION, body, tCrm("accion.errorAlGuardarAccion")).then((respuesta) => respuesta.id);
};

export const patchAccion: PatchAccion = async (id, accion) => {
    const { cliente: _cliente, ...accionPatch } = accion;
    const accionSinNulls = Object.fromEntries(
        Object.entries(accionPatch).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${new ApiUrls().ACCION}/${id}`, accionSinNulls, tCrm("accion.errorAlGuardarAccion"));
};

export const deleteAccion: DeleteAccion = async (id) =>
    await RestAPI.delete(`${new ApiUrls().ACCION}/${id}`, tCrm("accion.errorAlBorrarAccion"));

export const finalizarAccion = async (id: string): Promise<void> => {
    await RestAPI.patch(`${new ApiUrls().ACCION}/${id}/finalizar`, {}, tCrm("accion.errorAlFinalizarAccion"));
};