import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import {
    CambiosTipoCaja,
    DeleteTipoCaja,
    GetTipoCaja,
    GetTiposCaja,
    NuevoTipoCaja,
    PatchTipoCaja,
    PostTipoCaja,
    TipoCaja,
} from "./diseño.js";
import { tAlmacen } from "../i18n/index.ts";

export interface TipoCajaApi {
    id: string;
    descripcion: string;
    sku: string | null;
    capacidad: number | null;
    prefijo: string | null;
}

export interface NuevoTipoCajaApi {
    descripcion?: string;
    sku?: string | null;
    capacidad?: number | null;
    prefijo?: string | null;
}

export interface CambiosTipoCajaApi {
    descripcion?: string;
    sku?: string | null;
    capacidad?: number | null;
    prefijo?: string | null;
}

const baseUrl = new ApiUrls().TIPO_CAJA;

/**
 * Mapea respuesta de API a interfaz del dominio.
 * Los nombres de los campos son idénticos; solo se garantiza el tipo correcto.
 */
export const tipoCajaDesdeApi = (api: TipoCajaApi): TipoCaja => ({
    id: api.id,
    descripcion: api.descripcion,
    sku: api.sku,
    capacidad: api.capacidad,
    prefijo: api.prefijo,
});

/**
 * Obtener un tipo de caja por ID
 */
export const getTipoCaja: GetTipoCaja = async (id) => {
    return await RestAPI.getItem<TipoCaja, TipoCajaApi>(
        `${baseUrl}/${id}`,
        tipoCajaDesdeApi,
    );
};

/**
 * Obtener lista de tipos de caja con filtros
 */
export const getTiposCaja: GetTiposCaja = async (criteria) => {
    return await RestAPI.getQuery<TipoCaja, TipoCajaApi>(
        baseUrl,
        criteria,
        tipoCajaDesdeApi,
    );
};

/**
 * Crear nuevo tipo de caja.
 * El id lo proporciona el cliente en el payload.
 */
export const postTipoCaja: PostTipoCaja = async (nuevo: NuevoTipoCaja) => {
    const payload: NuevoTipoCajaApi = {
        descripcion: nuevo.descripcion,
        sku: nuevo.sku,
        capacidad: nuevo.capacidad,
        prefijo: nuevo.prefijo,
    };
    const respuesta = await RestAPI.post<NuevoTipoCajaApi>(
        baseUrl,
        payload,
        tAlmacen("tipo_caja.errorAlCrearTipoDeCaja")
    );
    return respuesta.id as string;
};

/**
 * Actualizar sku y/o capacidad de un tipo de caja existente
 */
export const patchTipoCaja: PatchTipoCaja = async (id, cambios: CambiosTipoCaja) => {
    const payload: CambiosTipoCajaApi = {};
    if (cambios.descripcion !== undefined) payload.descripcion = cambios.descripcion;
    if (cambios.sku !== undefined) payload.sku = cambios.sku;
    if (cambios.capacidad !== undefined) payload.capacidad = cambios.capacidad;
    if (cambios.prefijo !== undefined) payload.prefijo = cambios.prefijo;
    await RestAPI.patch<CambiosTipoCajaApi>(
        `${baseUrl}/${id}`,
        payload,
        tAlmacen("tipo_caja.errorAlActualizarTipoDeCaja")
    );
};

/**
 * Eliminar tipo de caja
 */
export const deleteTipoCaja: DeleteTipoCaja = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tAlmacen("tipo_caja.errorAlEliminarTipoDeCaja")
    );
};
