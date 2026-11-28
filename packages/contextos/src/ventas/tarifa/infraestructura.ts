import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import ApiUrls from "../comun/urls.js";
import {
    ArticuloTarifa,
    CambiosArticuloTarifa,
    CambiosTarifa,
    DeleteArticuloTarifa,
    DeleteTarifa,
    GetArticulosTarifa,
    GetTarifa,
    GetTarifas,
    NuevaTarifa,
    NuevoArticuloTarifa,
    PatchArticuloTarifa,
    PatchTarifa,
    PostArticuloTarifa,
    PostTarifa,
    Tarifa,
} from "./diseño.js";
import { tVentas } from "../i18n/index.ts";

export interface TarifaApi {
    id: string;
    nombre: string;
    divisa_id: string | null;
    divisa: string | null;
}

interface NuevaTarifaApi {
    nombre: string;
    divisa_id?: string;
}

type CambiosTarifaApi = Partial<NuevaTarifaApi>;

/**
 * Los PATCH del backend declaran el cuerpo con `Body(embed=True)`, así que los
 * cambios viajan envueltos en una clave `cambios`. El POST, en cambio, recibe
 * el objeto plano. Mismo criterio que en `ventas/cliente`.
 */
interface PayloadCambios<T> {
    cambios: T;
}

interface ArticuloTarifaApi {
    id: string;
    articulo_id: string;
    descripcion_articulo: string | null;
    tarifa_id: string;
    nombre_tarifa: string | null;
    precio: number;
}

interface NuevoArticuloTarifaApi {
    articulo_id: string;
    tarifa_id: string;
    precio: number;
}

interface CambiosArticuloTarifaApi {
    precio?: number;
}

const baseUrl = new ApiUrls().TARIFA;
const baseUrlArticulos = new ApiUrls().ARTICULO_TARIFA;

/**
 * Los artículos de una tarifa se piden a un endpoint propio filtrando por
 * tarifa, no vienen embebidos en la tarifa. Una tarifa puede tener muchos
 * artículos, así que se pide una página grande de una vez: la lista se muestra
 * entera en el detalle, sin paginar.
 */
const LIMITE_ARTICULOS_TARIFA = 1000;

const criteriaArticulosDeTarifa = (tarifaId: string): Criteria => ({
    filtro: [["tarifa_id", tarifaId]],
    orden: ["articulo_id", "ASC"],
    paginacion: { pagina: 1, limite: LIMITE_ARTICULOS_TARIFA },
});

/**
 * Mapea respuesta de API a interfaz del dominio.
 * `divisa_id`, `divisa`, `descripcion_articulo` y `nombre_tarifa` son nullables
 * en la API (columnas legacy y LEFT JOIN); el dominio usa cadena vacía.
 */
export const tarifaDesdeApi = (api: TarifaApi): Tarifa => ({
    id: api.id,
    nombre: api.nombre,
    divisaId: api.divisa_id ?? "",
    divisa: api.divisa ?? "",
});

export const articuloTarifaDesdeApi = (api: ArticuloTarifaApi): ArticuloTarifa => ({
    id: api.id,
    articuloId: api.articulo_id,
    descripcionArticulo: api.descripcion_articulo ?? "",
    tarifaId: api.tarifa_id,
    nombreTarifa: api.nombre_tarifa ?? "",
    precio: api.precio,
});

/**
 * Mapea datos de creación y cambio de dominio a API.
 * La divisa vacía no se envía: el servidor toma entonces la de la empresa.
 */
const nuevaTarifaAApi = (t: NuevaTarifa): NuevaTarifaApi => ({
    nombre: t.nombre,
    ...(t.divisaId ? { divisa_id: t.divisaId } : {}),
});

const cambiosTarifaAApi = (t: CambiosTarifa): CambiosTarifaApi => {
    const cambios: CambiosTarifaApi = {};
    if (t.nombre !== undefined) cambios.nombre = t.nombre;
    // La divisa vacía no se envía. El servidor valida que la divisa exista en
    // cuanto la clave está presente
    if (t.divisaId) cambios.divisa_id = t.divisaId;
    return cambios;
};

const nuevoArticuloTarifaAApi = (
    tarifaId: string,
    a: NuevoArticuloTarifa
): NuevoArticuloTarifaApi => ({
    articulo_id: a.articuloId,
    tarifa_id: tarifaId,
    precio: Number(a.precio),
});

const cambiosArticuloTarifaAApi = (
    a: CambiosArticuloTarifa
): CambiosArticuloTarifaApi => {
    const cambios: CambiosArticuloTarifaApi = {};
    if (a.precio !== undefined) cambios.precio = Number(a.precio);
    return cambios;
};

/**
 * Obtener una tarifa por ID
 */
export const getTarifa: GetTarifa = async (id) => {
    return await RestAPI.getItem<Tarifa, TarifaApi>(
        `${baseUrl}/${id}`,
        tarifaDesdeApi,
        tVentas("tarifa.errores.obtener")
    );
};

/**
 * Obtener lista de tarifas con filtros
 */
export const getTarifas: GetTarifas = async (criteria) => {
    return await RestAPI.getQuery<Tarifa, TarifaApi>(
        baseUrl,
        criteria,
        tarifaDesdeApi,
        tVentas("tarifa.errores.obtenerLista")
    );
};

/**
 * Crear nueva tarifa
 */
export const postTarifa: PostTarifa = async (nuevaTarifa) => {
    const respuesta = await RestAPI.post<NuevaTarifaApi>(
        baseUrl,
        nuevaTarifaAApi(nuevaTarifa),
        tVentas("tarifa.errores.crear")
    );
    return respuesta.id;
};

/**
 * Actualizar tarifa existente
 */
export const patchTarifa: PatchTarifa = async (id, cambios) => {
    await RestAPI.patch<PayloadCambios<CambiosTarifaApi>>(
        `${baseUrl}/${id}`,
        { cambios: cambiosTarifaAApi(cambios) },
        tVentas("tarifa.errores.actualizar")
    );
};

/**
 * Eliminar tarifa.
 * El servidor responde 409 si la tarifa tiene artículos asociados.
 */
export const deleteTarifa: DeleteTarifa = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tVentas("tarifa.errores.eliminar"));
};

/**
 * Obtener los artículos (precios) de una tarifa
 */
export const getArticulosTarifa: GetArticulosTarifa = async (tarifaId) => {
    return await RestAPI.getQuery<ArticuloTarifa, ArticuloTarifaApi>(
        baseUrlArticulos,
        criteriaArticulosDeTarifa(tarifaId),
        articuloTarifaDesdeApi,
        tVentas("tarifa.errores.obtenerArticulos")
    );
};

/**
 * Añadir un artículo a una tarifa
 */
export const postArticuloTarifa: PostArticuloTarifa = async (
    tarifaId,
    nuevoArticuloTarifa
) => {
    const respuesta = await RestAPI.post<NuevoArticuloTarifaApi>(
        baseUrlArticulos,
        nuevoArticuloTarifaAApi(tarifaId, nuevoArticuloTarifa),
        tVentas("tarifa.errores.anadirArticulo")
    );
    return respuesta.id;
};

/**
 * Cambiar el precio de un artículo de una tarifa
 */
export const patchArticuloTarifa: PatchArticuloTarifa = async (id, cambios) => {
    await RestAPI.patch<PayloadCambios<CambiosArticuloTarifaApi>>(
        `${baseUrlArticulos}/${id}`,
        { cambios: cambiosArticuloTarifaAApi(cambios) },
        tVentas("tarifa.errores.actualizarArticulo")
    );
};

/**
 * Quitar un artículo de una tarifa
 */
export const deleteArticuloTarifa: DeleteArticuloTarifa = async (id) => {
    await RestAPI.delete(
        `${baseUrlArticulos}/${id}`,
        tVentas("tarifa.errores.quitarArticulo")
    );
};
