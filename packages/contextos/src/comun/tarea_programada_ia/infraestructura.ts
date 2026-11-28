import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ComunUrls from "../urls.ts";
import {
    CambiosIaTareaProgramada, DeleteIaTareaProgramada, EjecucionIaTareaProgramada,
    EstadoEjecucionIaTareaProgramada, GetEjecucionesIaTareaProgramada, GetIaTareaProgramada,
    GetIaTareasProgramadas, IaTareaProgramada, NuevoIaTareaProgramada, PatchIaTareaProgramada,
    PostIaTareaProgramada,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

/**
 * Forma de la entidad tal como la devuelve la API (snake_case).
 */
export interface IaTareaProgramadaApi {
    id: number;
    nombre: string;
    ia_flujo_id: string;
    empresa_id: string | null;
    expresion_cron: string;
    activo: boolean;
    proxima_ejecucion: string;
    usuario_id: string;
    credencial_ids: string[];
}

interface NuevaIaTareaProgramadaApi {
    nombre: string;
    ia_flujo_id: string;
    expresion_cron: string;
    activo: boolean;
    credencial_ids: string[];
}

type CambiosIaTareaProgramadaApi = Partial<{
    nombre: string;
    ia_flujo_id: string;
    expresion_cron: string;
    activo: boolean;
    credencial_ids: string[];
}>;

export interface EjecucionIaTareaProgramadaApi {
    id: number;
    tarea_id: number;
    timestamp: string;
    estado: EstadoEjecucionIaTareaProgramada;
    resumen: string | null;
    thread_id: string | null;
}

const baseUrl = new ComunUrls().IA_TAREA_PROGRAMADA;

/**
 * Mapea respuesta de API a interfaz del dominio.
 */
export const iaTareaProgramadaDesdeApi = (api: IaTareaProgramadaApi): IaTareaProgramada => ({
    id: String(api.id),
    nombre: api.nombre,
    iaFlujoId: api.ia_flujo_id,
    expresionCron: api.expresion_cron,
    activo: api.activo,
    proximaEjecucion: new Date(Date.parse(api.proxima_ejecucion)),
    usuarioId: api.usuario_id,
    credencialIds: api.credencial_ids,
});

export const nuevaIaTareaProgramadaAApi = (m: NuevoIaTareaProgramada): NuevaIaTareaProgramadaApi => ({
    nombre: m.nombre,
    ia_flujo_id: m.iaFlujoId,
    expresion_cron: m.expresionCron,
    activo: m.activo,
    credencial_ids: m.credencialIds,
});

const cambiosIaTareaProgramadaAApi = (m: CambiosIaTareaProgramada): CambiosIaTareaProgramadaApi => {
    const cambios: CambiosIaTareaProgramadaApi = {};
    if (m.nombre !== undefined) cambios.nombre = m.nombre;
    if (m.iaFlujoId !== undefined) cambios.ia_flujo_id = m.iaFlujoId;
    if (m.expresionCron !== undefined) cambios.expresion_cron = m.expresionCron;
    if (m.activo !== undefined) cambios.activo = m.activo;
    if (m.credencialIds !== undefined) cambios.credencial_ids = m.credencialIds;
    return cambios;
};

const ejecucionIaTareaProgramadaDesdeApi = (
    api: EjecucionIaTareaProgramadaApi
): EjecucionIaTareaProgramada => ({
    id: api.id,
    tareaId: String(api.tarea_id),
    timestamp: new Date(Date.parse(api.timestamp)),
    estado: api.estado,
    resumen: api.resumen,
    threadId: api.thread_id,
});

export const getIaTareaProgramada: GetIaTareaProgramada = async (id) => {
    return await RestAPI.getItem<IaTareaProgramada, IaTareaProgramadaApi>(
        `${baseUrl}/${id}`,
        iaTareaProgramadaDesdeApi,
    );
};

export const getIaTareasProgramadas: GetIaTareasProgramadas = async (criteria) => {
    return await RestAPI.getQuery<IaTareaProgramada, IaTareaProgramadaApi>(
        baseUrl,
        criteria,
        iaTareaProgramadaDesdeApi,
    );
};

export const postIaTareaProgramada: PostIaTareaProgramada = async (nuevaTarea) => {
    const respuesta = await RestAPI.post<NuevaIaTareaProgramadaApi>(
        baseUrl,
        nuevaIaTareaProgramadaAApi(nuevaTarea),
        tComun("tareaProgramadaIa.errorAlCrearLaTareaProgramada"),
    );
    return respuesta.id;
};

export const patchIaTareaProgramada: PatchIaTareaProgramada = async (id, cambios) => {
    await RestAPI.patch<CambiosIaTareaProgramadaApi>(
        `${baseUrl}/${id}`,
        cambiosIaTareaProgramadaAApi(cambios),
        tComun("tareaProgramadaIa.errorAlGuardarLaTareaProgramada"),
    );
};

export const deleteIaTareaProgramada: DeleteIaTareaProgramada = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tComun("tareaProgramadaIa.errorAlEliminarLaTareaProgramada"),
    );
};

export const getEjecucionesIaTareaProgramada: GetEjecucionesIaTareaProgramada = async (tareaId) => {
    return await RestAPI.getLista<EjecucionIaTareaProgramada, EjecucionIaTareaProgramadaApi>(
        `${baseUrl}/${tareaId}/ejecuciones`,
        ejecucionIaTareaProgramadaDesdeApi,
        tComun("tareaProgramadaIa.errorAlObtenerElHistorialDe"),
    );
};
