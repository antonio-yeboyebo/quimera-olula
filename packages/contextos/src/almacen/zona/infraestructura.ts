import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ClausulaFiltro, Criteria, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { getUbicaciones } from "../ubicacion/infraestructura.ts";
import { Ubicacion } from "../ubicacion/diseño.ts";
import { FuncionZona, DeleteZona, GetZona, GetZonas, NuevaZona, PatchZona, PostZona, Zona } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/zona`;

interface ZonaApi {
    id: string;
    codigo: string;
    almacen_id: string;
    descripcion: string | null;
    funcion: FuncionZona;
    clases_admitidas: string[];
    admite_sin_clase: boolean;
}

interface NuevaZonaApi {
    codigo: string;
    almacen_id: string;
    descripcion: string | null;
    funcion: FuncionZona;
}

type CambiosZonaApi = Partial<Omit<ZonaApi, "id">>;

const aBooleano = (v: unknown): boolean => v === true || v === "true" || v === "1";

export const zonaDesdeApi = (api: ZonaApi): Zona => ({
    id: api.id,
    codigo: api.codigo,
    almacenId: api.almacen_id,
    descripcion: api.descripcion,
    funcion: api.funcion,
    clasesAdmitidas: api.clases_admitidas ?? [],
    admiteSinClase: api.admite_sin_clase ?? true,
});

const nuevaZonaAApi = (z: NuevaZona): NuevaZonaApi => ({
    codigo: z.codigo,
    almacen_id: z.almacenId,
    descripcion: z.descripcion,
    funcion: z.funcion,
});

const cambiosZonaAApi = (z: Partial<Zona>): CambiosZonaApi => {
    const cambios: CambiosZonaApi = {};
    if (z.codigo !== undefined) cambios.codigo = z.codigo;
    if (z.almacenId !== undefined) cambios.almacen_id = z.almacenId;
    if (z.descripcion !== undefined) cambios.descripcion = z.descripcion;
    if (z.funcion !== undefined) cambios.funcion = z.funcion;
    if (z.clasesAdmitidas !== undefined) cambios.clases_admitidas = z.clasesAdmitidas;
    if (z.admiteSinClase !== undefined) cambios.admite_sin_clase = aBooleano(z.admiteSinClase);
    return cambios;
};

export const getZona: GetZona = async (id) =>
    RestAPI.getItem<Zona, ZonaApi>(`${baseUrl}/${id}`, zonaDesdeApi);

export const getZonas: GetZonas = async (criteria: Criteria) =>
    RestAPI.getQuery<Zona, ZonaApi>(baseUrl, criteria, zonaDesdeApi);

export const getZonasLista = async (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: ZonaApi[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(zonaDesdeApi), total: respuesta.total };
};

export const postZona: PostZona = async (nuevaZona) => {
    const respuesta = await RestAPI.post<NuevaZonaApi>(
        baseUrl,
        nuevaZonaAApi(nuevaZona),
        tAlmacen("zona.errorAlCrearZona")
    );
    return respuesta.id;
};

export const patchZona: PatchZona = async (id, cambios) => {
    await RestAPI.patch<CambiosZonaApi>(
        `${baseUrl}/${id}`,
        cambiosZonaAApi(cambios),
        tAlmacen("zona.errorAlActualizarZona")
    );
};

export const deleteZona: DeleteZona = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tAlmacen("zona.errorAlEliminarZona"));
};

/** Una página de las ubicaciones de la zona, según el criterio (orden y paginación) del listado. */
export const getUbicacionesZona = async (
    zonaId: string,
    criteria: Criteria
): Promise<{ datos: Ubicacion[]; total: number }> => {
    const filtroListado = Array.isArray(criteria.filtro) ? (criteria.filtro as ClausulaFiltro[]) : [];
    return getUbicaciones(
        [["zona_id", "==", zonaId], ...filtroListado],
        criteria.orden.length ? criteria.orden : ["codigo", "ASC"],
        criteria.paginacion
    );
};
