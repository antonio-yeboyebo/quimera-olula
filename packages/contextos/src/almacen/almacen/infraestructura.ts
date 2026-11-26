import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    Almacen,
    AlmacenAPI,
    DeleteAlmacen,
    GetAlmacen,
    GetAlmacenes,
    PatchAlmacen,
    PostAlmacen
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrlAlmacen = `/almacen/almacen`;

// const almacenDesdeApi = (t: AlmacenAPI): Almacen => t;

export const almacenFromApi = (almacenApi: AlmacenAPI): Almacen => ({
    ...almacenApi,
});

export const almacenToApi = (almacen: Almacen): AlmacenAPI => ({
    ...almacen,
});

export const obtenerAlmacenes = async (filtro: Filtro, orden: Orden): Promise<Almacen[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: AlmacenAPI[] }>(baseUrlAlmacen + q).then((respuesta) => respuesta.datos.map(almacenFromApi));
}

export const getAlmacen: GetAlmacen = async (id) =>
    await RestAPI.get<{ datos: AlmacenAPI }>(`${baseUrlAlmacen}/${id}`).then((respuesta) =>
        almacenFromApi(respuesta.datos)
    );

export const getAlmacenes: GetAlmacenes = async (
    filtro,
    orden,
    paginacion?
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: AlmacenAPI[]; total: number }>(baseUrlAlmacen + q);
    return { datos: respuesta.datos.map(almacenFromApi), total: respuesta.total };
};

export const postAlmacen: PostAlmacen = async (almacen) => {
    return await RestAPI.post(baseUrlAlmacen, almacen, tAlmacen("almacen.errorAlGuardarAlmacen")).then(
        (respuesta) => respuesta.id
    );
};

export const patchAlmacen: PatchAlmacen = async (id, almacen) => {
    const apiAlmacen = almacenToApi(almacen as Almacen);
    const almacenSinNulls = Object.fromEntries(
        Object.entries(apiAlmacen).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlAlmacen}/${id}`, almacenSinNulls, tAlmacen("almacen.errorAlGuardarAlmacen"));
};

export const deleteAlmacen: DeleteAlmacen = async (id) => {
    await RestAPI.delete(`${baseUrlAlmacen}/${id}`, tAlmacen("almacen.errorAlBorrarAlmacen"));
};


export type AlmacenLocal = { id: string; nombre_almacen: string };

export const almacenLocal = {
    actualizar: (almacen: AlmacenLocal) => localStorage.setItem("almacen-local", JSON.stringify(almacen)),
    obtener: (): AlmacenLocal | null => {
        const raw = localStorage.getItem("almacen-local");
        if (!raw) return null;
        try { return JSON.parse(raw) as AlmacenLocal; } catch { return null; }
    },
    eliminar: () => localStorage.removeItem("almacen-local"),
}