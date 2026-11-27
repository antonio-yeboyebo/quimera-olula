import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ComunUrls from "../urls.ts";
import { CambiosIaFlujo, DeleteIaFlujo, GetIaFlujo, GetIaFlujos, IaFlujo, NuevoIaFlujo, PatchIaFlujo, PostIaFlujo } from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

/**
 * Forma de la entidad tal como la devuelve la API (snake_case).
 */
export interface IaFlujoApi {
    id: string;
    nombre: string;
    descripcion_corta: string;
    contenido: string;
    activo: boolean;
    creado_por: string;
    creado_en: string;
    actualizado_en: string;
}

interface NuevoIaFlujoApi {
    nombre: string;
    descripcion_corta: string;
    contenido: string;
}

type CambiosIaFlujoApi = Partial<{
    nombre: string;
    descripcion_corta: string;
    contenido: string;
    activo: boolean;
}>;

const baseUrl = new ComunUrls().IA_FLUJO;

/**
 * Mapea respuesta de API a interfaz del dominio.
 * Convierte snake_case a camelCase y strings de fecha a Date.
 */
export const iaFlujoDesdeApi = (api: IaFlujoApi): IaFlujo => ({
    id: api.id,
    nombre: api.nombre,
    descripcionCorta: api.descripcion_corta,
    contenido: api.contenido,
    activo: api.activo,
    creadoPor: api.creado_por,
    creadoEn: new Date(Date.parse(api.creado_en)),
    actualizadoEn: new Date(Date.parse(api.actualizado_en)),
});

/**
 * Mapea datos de creación de dominio a API.
 */
export const nuevoIaFlujoAApi = (m: NuevoIaFlujo): NuevoIaFlujoApi => ({
    nombre: m.nombre,
    descripcion_corta: m.descripcionCorta,
    contenido: m.contenido,
});

const cambiosIaFlujoAApi = (m: CambiosIaFlujo): CambiosIaFlujoApi => {
    const cambios: CambiosIaFlujoApi = {};
    if (m.nombre !== undefined) cambios.nombre = m.nombre;
    if (m.descripcionCorta !== undefined) cambios.descripcion_corta = m.descripcionCorta;
    if (m.contenido !== undefined) cambios.contenido = m.contenido;
    if (m.activo !== undefined) cambios.activo = m.activo;
    return cambios;
};

/**
 * Obtener un flujo por ID
 */
export const getIaFlujo: GetIaFlujo = async (id) => {
    return await RestAPI.getItem<IaFlujo, IaFlujoApi>(
        `${baseUrl}/${id}`,
        iaFlujoDesdeApi,
    );
};

/**
 * Obtener lista de flujos con filtros
 */
export const getIaFlujos: GetIaFlujos = async (criteria) => {
    return await RestAPI.getQuery<IaFlujo, IaFlujoApi>(
        baseUrl,
        criteria,
        iaFlujoDesdeApi,
    );
};

/**
 * Crear nuevo flujo
 */
export const postIaFlujo: PostIaFlujo = async (nuevoIaFlujo) => {
    const respuesta = await RestAPI.post<NuevoIaFlujoApi>(
        baseUrl,
        nuevoIaFlujoAApi(nuevoIaFlujo),
        tComun("iaFlujo.errorAlCrearElFlujoDe"),
    );
    return respuesta.id;
};

/**
 * Actualizar flujo existente
 */
export const patchIaFlujo: PatchIaFlujo = async (id, cambios) => {
    await RestAPI.patch<CambiosIaFlujoApi>(
        `${baseUrl}/${id}`,
        cambiosIaFlujoAApi(cambios),
        tComun("iaFlujo.errorAlGuardarElFlujoDe"),
    );
};

/**
 * Eliminar flujo
 */
export const deleteIaFlujo: DeleteIaFlujo = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tComun("iaFlujo.errorAlEliminarElFlujoDe"),
    );
};
