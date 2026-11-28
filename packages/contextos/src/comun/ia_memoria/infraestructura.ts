import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { empresaActual } from "#/valores/empresaActual.ts";
import ComunUrls from "../urls.ts";
import {
    CambiosIaMemoria, DeleteIaMemoria, EstadoRagIaMemoria, GetEstadoRagIaMemoria, GetIaMemoria, GetIaMemorias,
    IaMemoria, NuevaIaMemoria, NuevaIaMemoriaDesdeConector, NuevaIaMemoriaDesdeFichero, OrigenIaMemoria,
    PatchIaMemoria, PatchIaMemoriaDesdeFichero, PostIaMemoria, PostIaMemoriaDesdeConector, PostIaMemoriaDesdeFichero,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

/**
 * Forma de la entidad tal como la devuelve la API (snake_case).
 */
export interface IaMemoriaApi {
    id: string;
    titulo: string;
    contenido: string;
    activo: boolean;
    origen: OrigenIaMemoria;
    nombre_fichero?: string;
    documento_id?: string;
    proveedor_externo?: string | null;
    externo_modificado_en?: string | null;
    empresa_id: string;
    creado_por: string;
    creado_en: string;
    actualizado_en: string;
    indexado: boolean;
    indexado_en?: string;
    modelo_desactualizado: boolean;
}

interface EstadoRagIaMemoriaApi {
    disponible: boolean;
}

interface NuevaIaMemoriaApi {
    titulo: string;
    contenido: string;
    empresa_id: string;
}

interface NuevaIaMemoriaDesdeFicheroApi {
    titulo?: string;
    nombre_fichero: string;
    tipo_mime: string;
    contenido_base64: string;
    empresa_id: string;
}

interface NuevaIaMemoriaDesdeConectorApi {
    titulo?: string;
    credencial_id: string;
    proveedor: string;
    recurso_id: string;
    empresa_id: string;
}

type CambiosIaMemoriaApi = Partial<{
    titulo: string;
    contenido: string;
    activo: boolean;
}>;

const baseUrl = new ComunUrls().IA_MEMORIA;

/**
 * Mapea respuesta de API a interfaz del dominio.
 * Convierte snake_case a camelCase y strings de fecha a Date.
 */
export const iaMemoriaDesdeApi = (api: IaMemoriaApi): IaMemoria => ({
    id: api.id,
    titulo: api.titulo,
    contenido: api.contenido,
    activo: api.activo,
    origen: api.origen,
    nombreFichero: api.nombre_fichero,
    documentoId: api.documento_id,
    proveedorExterno: api.proveedor_externo ?? undefined,
    externoModificadoEn: api.externo_modificado_en ? new Date(Date.parse(api.externo_modificado_en)) : undefined,
    creadoPor: api.creado_por,
    creadoEn: new Date(Date.parse(api.creado_en)),
    actualizadoEn: new Date(Date.parse(api.actualizado_en)),
    indexado: api.indexado,
    indexadoEn: api.indexado_en ? new Date(Date.parse(api.indexado_en)) : undefined,
    modeloDesactualizado: api.modelo_desactualizado,
});

const estadoRagIaMemoriaDesdeApi = (api: EstadoRagIaMemoriaApi): EstadoRagIaMemoria => ({
    disponible: api.disponible,
});

/**
 * Mapea datos de creación de dominio a API.
 * `empresa_id` se inyecta aquí (empresa activa del navegador), igual que en
 * ventas/pedido/infraestructura.ts — el dominio de alta no lo pide al usuario.
 */
export const nuevaIaMemoriaAApi = (m: NuevaIaMemoria): NuevaIaMemoriaApi => ({
    titulo: m.titulo,
    contenido: m.contenido,
    empresa_id: empresaActual(),
});

const nuevaIaMemoriaDesdeFicheroAApi = (m: NuevaIaMemoriaDesdeFichero): NuevaIaMemoriaDesdeFicheroApi => ({
    titulo: m.titulo,
    nombre_fichero: m.nombreFichero,
    tipo_mime: m.tipoMime,
    contenido_base64: m.contenidoBase64,
    empresa_id: empresaActual(),
});

const nuevaIaMemoriaDesdeConectorAApi = (m: NuevaIaMemoriaDesdeConector): NuevaIaMemoriaDesdeConectorApi => ({
    titulo: m.titulo,
    credencial_id: m.credencialId,
    proveedor: m.proveedor,
    recurso_id: m.recursoId,
    empresa_id: empresaActual(),
});

const cambiosIaMemoriaAApi = (m: CambiosIaMemoria): CambiosIaMemoriaApi => {
    const cambios: CambiosIaMemoriaApi = {};
    if (m.titulo !== undefined) cambios.titulo = m.titulo;
    if (m.contenido !== undefined) cambios.contenido = m.contenido;
    if (m.activo !== undefined) cambios.activo = m.activo;
    return cambios;
};

/**
 * Obtener una memoria por ID
 */
export const getIaMemoria: GetIaMemoria = async (id) => {
    return await RestAPI.getItem<IaMemoria, IaMemoriaApi>(
        `${baseUrl}/${id}`,
        iaMemoriaDesdeApi,
    );
};

/**
 * Obtener lista de memorias con filtros
 */
export const getIaMemorias: GetIaMemorias = async (criteria) => {
    return await RestAPI.getQuery<IaMemoria, IaMemoriaApi>(
        baseUrl,
        criteria,
        iaMemoriaDesdeApi,
    );
};

/**
 * Crear nueva memoria de texto manual
 */
export const postIaMemoria: PostIaMemoria = async (nuevaIaMemoria) => {
    const respuesta = await RestAPI.post<NuevaIaMemoriaApi>(
        baseUrl,
        nuevaIaMemoriaAApi(nuevaIaMemoria),
        tComun("iaMemoria.errorAlCrearLaMemoriaDel"),
    );
    return respuesta.id;
};

/**
 * Crear nueva memoria a partir de un fichero subido/importado — el backend
 * extrae el texto del fichero y lo persiste en `contenido`.
 */
export const postIaMemoriaDesdeFichero: PostIaMemoriaDesdeFichero = async (nuevaIaMemoria) => {
    const respuesta = await RestAPI.post<NuevaIaMemoriaDesdeFicheroApi>(
        `${baseUrl}/importar`,
        nuevaIaMemoriaDesdeFicheroAApi(nuevaIaMemoria),
        tComun("iaMemoria.errorAlImportarElFicheroPara"),
    );
    return respuesta.id;
};

/**
 * Crear nueva memoria vinculada a un documento de un conector externo (Google
 * Drive...) — el backend importa el contenido en el alta y la mantiene
 * sincronizada después mediante el job periódico (ver origen "externo").
 */
export const postIaMemoriaDesdeConector: PostIaMemoriaDesdeConector = async (nuevaIaMemoria) => {
    const respuesta = await RestAPI.post<NuevaIaMemoriaDesdeConectorApi>(
        `${baseUrl}/importar-conector`,
        nuevaIaMemoriaDesdeConectorAApi(nuevaIaMemoria),
        tComun("iaMemoria.errorAlImportarElDocumentoPara"),
    );
    return respuesta.id;
};

/**
 * Reemplazar el fichero de una memoria existente con origen "fichero" —
 * re-extrae el texto y dispara un nuevo reindexado en el backend.
 */
export const patchIaMemoriaDesdeFichero: PatchIaMemoriaDesdeFichero = async (id, fichero) => {
    await RestAPI.patch<NuevaIaMemoriaDesdeFicheroApi>(
        `${baseUrl}/${id}/importar`,
        nuevaIaMemoriaDesdeFicheroAApi(fichero),
        tComun("iaMemoria.errorAlReemplazarElFicheroDe"),
    );
};

/**
 * URL pública de un solo uso para descargar el fichero original de una
 * memoria con origen "fichero" — el backend genera un token con caducidad
 * (mismo mecanismo que la descarga de documentos generados por el asistente).
 */
export const obtenerUrlDescargaFicheroIaMemoria = async (id: string): Promise<string> => {
    const respuesta = await RestAPI.get<{ url: string }>(
        `${baseUrl}/${id}/fichero`,
        tComun("iaMemoria.errorAlObtenerLaDescargaDel"),
    );
    return respuesta.url;
};

/**
 * Actualizar memoria existente (texto manual)
 */
export const patchIaMemoria: PatchIaMemoria = async (id, cambios) => {
    await RestAPI.patch<CambiosIaMemoriaApi>(
        `${baseUrl}/${id}`,
        cambiosIaMemoriaAApi(cambios),
        tComun("iaMemoria.errorAlGuardarLaMemoriaDel"),
    );
};

/**
 * Eliminar memoria
 */
export const deleteIaMemoria: DeleteIaMemoria = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tComun("iaMemoria.errorAlEliminarLaMemoriaDel"),
    );
};

/**
 * Si la búsqueda semántica (RAG) está disponible en este servidor — false si
 * falta la extensión pgvector (ver MaestroConDetalleIaMemoria.tsx, aviso en pantalla).
 */
export const getEstadoRagIaMemoria: GetEstadoRagIaMemoria = async () => {
    const respuesta = await RestAPI.get<EstadoRagIaMemoriaApi>(
        `${baseUrl}/estado-rag`,
        tComun("iaMemoria.errorAlComprobarElEstadoDe"),
    );
    return estadoRagIaMemoriaDesdeApi(respuesta);
};
