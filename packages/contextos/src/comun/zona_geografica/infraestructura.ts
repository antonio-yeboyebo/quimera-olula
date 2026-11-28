import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    DeleteZonaGeografica,
    GetZonaGeografica,
    GetZonasGeograficasMaestro,
    PatchZonaGeografica,
    PostZonaGeografica,
    ZonaGeografica,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

const baseUrl = "/comun/zona_geografica";

const urlZona = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export interface ZonaGeograficaApi {
    id: string;
    descripcion: string | null;
}

export const zonaGeograficaDesdeApi = (api: ZonaGeograficaApi): ZonaGeografica => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
});

const descripcionAApi = (descripcion: string) => descripcion.trim() || null;

export const getZonasGeograficasMaestro: GetZonasGeograficasMaestro = async (criteria) =>
    RestAPI.getQuery<ZonaGeografica, ZonaGeograficaApi>(baseUrl, criteria, zonaGeograficaDesdeApi);

export const getZonaGeografica: GetZonaGeografica = async (id) =>
    RestAPI.getItem<ZonaGeografica, ZonaGeograficaApi>(urlZona(id), zonaGeograficaDesdeApi);

export const postZonaGeografica: PostZonaGeografica = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { id: nueva.id.trim(), descripcion: descripcionAApi(nueva.descripcion) },
        tComun("zonaGeografica.errorAlCrearLaZonaGeografica")
    );
    return String(respuesta.id);
};

export const patchZonaGeografica: PatchZonaGeografica = async (id, cambios) => {
    await RestAPI.patch(
        urlZona(id),
        { descripcion: descripcionAApi(cambios.descripcion ?? "") },
        tComun("zonaGeografica.errorAlGuardarLaZonaGeografica")
    );
};

export const deleteZonaGeografica: DeleteZonaGeografica = async (id) => {
    await RestAPI.delete(urlZona(id), tComun("zonaGeografica.errorAlBorrarLaZonaGeografica"));
};
