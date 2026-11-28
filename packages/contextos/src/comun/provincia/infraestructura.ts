import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosProvincia,
    DeleteProvincia,
    GetProvincia,
    GetProvinciasMaestro,
    PatchProvincia,
    PostProvincia,
    Provincia,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

const baseUrl = "/comun/provincia";

const urlProvincia = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export interface ProvinciaApi {
    id: number;
    nombre: string;
    pais_id: string;
    codigo: string | null;
    nombre_pais: string | null;
}

export const provinciaDesdeApi = (api: ProvinciaApi): Provincia => ({
    id: String(api.id),
    nombre: api.nombre ?? "",
    paisId: api.pais_id ?? "",
    nombrePais: api.nombre_pais ?? "",
    codigo: api.codigo ?? "",
});

export const cambiosProvinciaAApi = (cambios: CambiosProvincia) => {
    const api: Record<string, string | null> = {};
    if (cambios.nombre !== undefined) api.nombre = cambios.nombre.trim();
    if (cambios.paisId !== undefined) api.pais_id = cambios.paisId.trim();
    if (cambios.codigo !== undefined) api.codigo = cambios.codigo.trim() || null;
    return api;
};

export const getProvinciasMaestro: GetProvinciasMaestro = async (criteria) =>
    RestAPI.getQuery<Provincia, ProvinciaApi>(baseUrl, criteria, provinciaDesdeApi);

export const getProvincia: GetProvincia = async (id) =>
    RestAPI.getItem<Provincia, ProvinciaApi>(urlProvincia(id), provinciaDesdeApi);

export const postProvincia: PostProvincia = async (nueva) => {
    const respuesta = await RestAPI.post(baseUrl, cambiosProvinciaAApi(nueva), tComun("provincia.errorAlCrearLaProvincia"));
    return String(respuesta.id);
};

export const patchProvincia: PatchProvincia = async (id, cambios) => {
    await RestAPI.patch(urlProvincia(id), cambiosProvinciaAApi(cambios), tComun("provincia.errorAlGuardarLaProvincia"));
};

export const deleteProvincia: DeleteProvincia = async (id) => {
    await RestAPI.delete(urlProvincia(id), tComun("provincia.errorAlBorrarLaProvincia"));
};
