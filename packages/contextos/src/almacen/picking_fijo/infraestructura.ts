import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosPickingFijo,
    DeletePickingFijo,
    GetPickingFijo,
    GetPickingsFijos,
    NuevoPickingFijo,
    PatchPickingFijo,
    PickingFijo,
    PostPickingFijo,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/picking_fijo`;

interface PickingFijoApi {
    id: string;
    articulo_id: string;
    articulo: string;
    ubicacion_id: string;
    ubicacion: string;
    almacen_id: string;
    minimo: number;
    maximo: number;
    unidad_reposicion: number;
    stock: number;
}

interface NuevoPickingFijoApi {
    articulo_id: string;
    ubicacion_id: string;
    minimo: number;
    maximo: number;
    unidad_reposicion: number;
}

type CambiosPickingFijoApi = Partial<Pick<NuevoPickingFijoApi, "minimo" | "maximo" | "unidad_reposicion">>;

export const pickingFijoDesdeApi = (api: PickingFijoApi): PickingFijo => ({
    id: api.id,
    articuloId: api.articulo_id,
    articulo: api.articulo,
    ubicacionId: api.ubicacion_id,
    ubicacion: api.ubicacion,
    almacenId: api.almacen_id,
    minimo: api.minimo,
    maximo: api.maximo,
    unidadReposicion: api.unidad_reposicion,
    stock: api.stock,
});

const nuevoPickingFijoAApi = (p: NuevoPickingFijo): NuevoPickingFijoApi => ({
    articulo_id: p.articuloId,
    ubicacion_id: p.ubicacionId,
    minimo: p.minimo,
    maximo: p.maximo,
    unidad_reposicion: p.unidadReposicion,
});

const cambiosPickingFijoAApi = (c: CambiosPickingFijo): CambiosPickingFijoApi => {
    const cambios: CambiosPickingFijoApi = {};
    if (c.minimo !== undefined) cambios.minimo = c.minimo;
    if (c.maximo !== undefined) cambios.maximo = c.maximo;
    if (c.unidadReposicion !== undefined) cambios.unidad_reposicion = c.unidadReposicion;
    return cambios;
};

export const getPickingFijo: GetPickingFijo = async (id) =>
    RestAPI.getItem<PickingFijo, PickingFijoApi>(`${baseUrl}/${id}`, pickingFijoDesdeApi);

export const getPickingsFijos: GetPickingsFijos = async (criteria: Criteria) =>
    RestAPI.getQuery<PickingFijo, PickingFijoApi>(baseUrl, criteria, pickingFijoDesdeApi);

export const postPickingFijo: PostPickingFijo = async (nuevo) => {
    const respuesta = await RestAPI.post<NuevoPickingFijoApi>(
        baseUrl,
        nuevoPickingFijoAApi(nuevo),
        tAlmacen("picking_fijo.errorAlCrearPickingFijo")
    );
    return respuesta.id;
};

export const patchPickingFijo: PatchPickingFijo = async (id, cambios) => {
    await RestAPI.patch<CambiosPickingFijoApi>(
        `${baseUrl}/${id}`,
        cambiosPickingFijoAApi(cambios),
        tAlmacen("picking_fijo.errorAlActualizarPickingFijo")
    );
};

export const deletePickingFijo: DeletePickingFijo = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tAlmacen("picking_fijo.errorAlBorrarPickingFijo"));
};
