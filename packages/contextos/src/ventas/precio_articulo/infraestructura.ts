import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import ApiUrls from "../comun/urls.ts";
import {
    CambiosPrecioArticulo,
    DeletePrecioArticulo,
    GetPreciosArticuloCliente,
    NuevoPrecioArticulo,
    PatchPrecioArticulo,
    PostPrecioArticulo,
    PrecioArticulo,
} from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

const baseUrl = new ApiUrls().PRECIO_ARTICULO;

interface PrecioArticuloApi {
    id: string;
    cliente_id: string;
    articulo_id: string;
    descripcion_articulo: string | null;
    cantidad_min: number | null;
    cantidad_max: number | null;
    dto_porcentual: number;
    pvp: number;
}

interface NuevoPrecioArticuloApi {
    cliente_id: string;
    articulo_id: string;
    cantidad_min: number | null;
    cantidad_max: number | null;
    dto_porcentual: number;
    pvp: number;
}

type CambiosPrecioArticuloApi = Partial<Omit<NuevoPrecioArticuloApi, "cliente_id">>;

/**
 * Las condiciones de un cliente se muestran todas a la vez en su pestaña.
 */
const LIMITE = 1000;

const criteriaDeCliente = (clienteId: string): Criteria => ({
    filtro: [["cliente_id", clienteId]],
    orden: ["articulo_id", "ASC"],
    paginacion: { pagina: 1, limite: LIMITE },
});

/** En la API una cantidad sin límite es null; en el dominio, 0. */
const cantidadAApi = (cantidad: number): number | null =>
    Number(cantidad) ? Number(cantidad) : null;

export const precioArticuloDesdeApi = (api: PrecioArticuloApi): PrecioArticulo => ({
    id: api.id,
    clienteId: api.cliente_id,
    articuloId: api.articulo_id,
    descripcionArticulo: api.descripcion_articulo ?? "",
    cantidadMin: api.cantidad_min ?? 0,
    cantidadMax: api.cantidad_max ?? 0,
    dtoPorcentual: api.dto_porcentual,
    pvp: api.pvp,
});

export const nuevoPrecioArticuloAApi = (
    clienteId: string,
    nuevo: NuevoPrecioArticulo
): NuevoPrecioArticuloApi => ({
    cliente_id: clienteId,
    articulo_id: nuevo.articuloId,
    cantidad_min: cantidadAApi(nuevo.cantidadMin),
    cantidad_max: cantidadAApi(nuevo.cantidadMax),
    dto_porcentual: Number(nuevo.dtoPorcentual) || 0,
    pvp: Number(nuevo.pvp) || 0,
});

export const cambiosPrecioArticuloAApi = (
    cambios: CambiosPrecioArticulo
): CambiosPrecioArticuloApi => {
    const api: CambiosPrecioArticuloApi = {};
    if (cambios.articuloId !== undefined) api.articulo_id = cambios.articuloId;
    if (cambios.cantidadMin !== undefined) api.cantidad_min = cantidadAApi(cambios.cantidadMin);
    if (cambios.cantidadMax !== undefined) api.cantidad_max = cantidadAApi(cambios.cantidadMax);
    if (cambios.dtoPorcentual !== undefined) api.dto_porcentual = Number(cambios.dtoPorcentual) || 0;
    if (cambios.pvp !== undefined) api.pvp = Number(cambios.pvp) || 0;
    return api;
};

export const getPreciosArticuloCliente: GetPreciosArticuloCliente = async (clienteId) =>
    RestAPI.getQuery<PrecioArticulo, PrecioArticuloApi>(
        baseUrl,
        criteriaDeCliente(clienteId),
        precioArticuloDesdeApi,
        tVentas("precioArticulo.errores.obtener")
    );

export const postPrecioArticulo: PostPrecioArticulo = async (clienteId, nuevo) => {
    const respuesta = await RestAPI.post<NuevoPrecioArticuloApi>(
        baseUrl,
        nuevoPrecioArticuloAApi(clienteId, nuevo),
        tVentas("precioArticulo.errores.crear")
    );
    return respuesta.id;
};

/**
 * El PATCH declara el cuerpo con `Body(embed=True)`: los cambios van en `cambios`.
 */
export const patchPrecioArticulo: PatchPrecioArticulo = async (id, cambios) => {
    await RestAPI.patch<{ cambios: CambiosPrecioArticuloApi }>(
        `${baseUrl}/${id}`,
        { cambios: cambiosPrecioArticuloAApi(cambios) },
        tVentas("precioArticulo.errores.cambiar")
    );
};

export const deletePrecioArticulo: DeletePrecioArticulo = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tVentas("precioArticulo.errores.borrar"));
};
