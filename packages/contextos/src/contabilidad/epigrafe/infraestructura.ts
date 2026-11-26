import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CambiosEpigrafe,
    DeleteEpigrafe,
    Epigrafe,
    GetEpigrafe,
    GetEpigrafes,
    NuevoEpigrafe,
    PatchEpigrafe,
    PostEpigrafe,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const baseUrl = new ApiUrls().EPIGRAFE;

export interface EpigrafeApi {
    id: number;
    codigo: string;
    descripcion: string;
    ejercicio_id: string;
    grupo_id: number | null;
    codigo_grupo: string | null;
    padre_id: number | null;
}

export const epigrafeDesdeApi = (api: EpigrafeApi): Epigrafe => ({
    id: String(api.id),
    codigo: api.codigo,
    descripcion: api.descripcion ?? "",
    ejercicioId: api.ejercicio_id,
    grupoId: api.grupo_id ? String(api.grupo_id) : "",
    codigoGrupo: api.codigo_grupo ?? "",
    padreId: api.padre_id ? String(api.padre_id) : "",
});

export const getEpigrafes: GetEpigrafes = async (criteria) =>
    RestAPI.getQuery<Epigrafe, EpigrafeApi>(baseUrl, criteria, epigrafeDesdeApi);

export const getEpigrafe: GetEpigrafe = async (id) =>
    RestAPI.getItem<Epigrafe, EpigrafeApi>(
        `${baseUrl}/${id}`,
        epigrafeDesdeApi
    );

export const nuevoEpigrafeAApi = (nuevo: NuevoEpigrafe) => ({
    codigo: nuevo.codigo,
    ejercicio_id: nuevo.ejercicioId,
    descripcion: nuevo.descripcion,
    ...(nuevo.grupoId ? { grupo_id: Number(nuevo.grupoId) } : {}),
});

export const postEpigrafe: PostEpigrafe = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoEpigrafeAApi(nuevo),
        tContabilidad("epigrafe.errorAlCrearElSubgrupo"),
    );
    return String(respuesta.id);
};

export const cambiosEpigrafeAApi = (cambios: CambiosEpigrafe) => {
    const api: Record<string, string | number | null> = {};
    if (cambios.codigo !== undefined) api.codigo = cambios.codigo;
    if (cambios.descripcion !== undefined) {
        api.descripcion = cambios.descripcion || null;
    }
    if (cambios.grupoId !== undefined) {
        api.grupo_id = cambios.grupoId ? Number(cambios.grupoId) : null;
    }
    return api;
};

export const patchEpigrafe: PatchEpigrafe = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosEpigrafeAApi(cambios),
        tContabilidad("epigrafe.errorAlGuardarElSubgrupo"),
    );
};

export const deleteEpigrafe: DeleteEpigrafe = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tContabilidad("epigrafe.errorAlBorrarElSubgrupo"));
};
