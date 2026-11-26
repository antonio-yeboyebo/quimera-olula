import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    DeleteFamilia,
    Familia,
    FamiliaAPI,
    GetFamilia,
    GetFamilias,
    PatchFamilia,
    PostFamilia
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrlFamilia = `/almacen/familia`;

export const moduloFromApi = (moduloApi: FamiliaAPI): Familia => ({
    id: moduloApi.id,
    descripcion: moduloApi.descripcion,
    unidadId: moduloApi.unidad_id ?? "",
});

export const moduloToApi = (modulo: Partial<Familia>): FamiliaAPI => {
    const { unidadId, ...resto } = modulo;
    return {
        ...resto,
        // Sin el plugin pesos_medidas la unidad no viaja (el servidor la ignora igualmente).
        ...(unidadId !== undefined ? { unidad_id: unidadId || null } : {}),
    } as FamiliaAPI;
};

export const getFamilia: GetFamilia = async (id) =>
    await RestAPI.get<{ datos: FamiliaAPI }>(`${baseUrlFamilia}/${id}`).then((respuesta) =>
        moduloFromApi(respuesta.datos)
    );

export const getFamilias: GetFamilias = async (
    filtro,
    orden,
    paginacion?
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: FamiliaAPI[]; total: number }>(baseUrlFamilia + q);
    return { datos: respuesta.datos.map(moduloFromApi), total: respuesta.total };
};

export const postFamilia: PostFamilia = async (modulo) => {
    return await RestAPI.post(baseUrlFamilia, moduloToApi(modulo), tAlmacen("familia.errorAlGuardarFamilia")).then(
        (respuesta) => respuesta.id
    );
};

export const patchFamilia: PatchFamilia = async (id, modulo) => {
    const apiFamilia = moduloToApi(modulo);
    const moduloSinNulls = Object.fromEntries(
        Object.entries(apiFamilia).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlFamilia}/${id}`, moduloSinNulls, tAlmacen("familia.errorAlGuardarFamilia"));
};

export const deleteFamilia: DeleteFamilia = async (id) => {
    await RestAPI.delete(`${baseUrlFamilia}/${id}`, tAlmacen("familia.errorAlBorrarFamilia"));
};

