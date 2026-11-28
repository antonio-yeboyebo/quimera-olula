import { Filtro, Orden, Paginacion } from "../diseño.js";
import { criteriaQuery } from "../infraestructura.js";
import { RestAPI } from "./rest_api.js";
import { tLib } from "../i18n/textos.ts";

const DOCUMENTAL_BASE_URL = "/documental/documento";

/**
 * Filtro para documentos vinculados a un objeto de negocio.
 * El campo de filtro necesita el sufijo "_id" (p.ej. "incidencia_id"); si vinculoTipo
 * ya lo incluye (p.ej. al filtrar por carpeta padre con "gd_documentos") se usa tal cual.
 */
export const filtroVinculoDocumentos = (vinculoTipo: string, vinculoId: string): Filtro => {
    const campo = vinculoTipo.endsWith("_id") ? vinculoTipo : `${vinculoTipo}_id`;
    return [[campo, vinculoId]];
};

/**
 * Interfaz genérica para documentos
 */
export interface DocumentoGenerico {
    id: string;
    nombre: string;
    fechaSubida: string;
    horaSubida: string;
    versionActualId: string | null;
    [key: string]: unknown;
}

/**
 * Transforma dato del backend, convirtiendo "None" string a null
 */
const transformarDocumento = (doc: unknown): DocumentoGenerico => {
    const data = doc as Record<string, unknown>;
    return {
        id: String(data.id || ""),
        nombre: String(data.nombre || ""),
        fechaSubida: String(data.fechaSubida || data.fecha_creacion || ""),
        horaSubida: String(data.horaSubida || data.hora_creacion || ""),
        versionActualId:
            data.versionActualId === "None" ||
                data.versionActualId === null ||
                data.versionActualId === undefined ||
                data.version_actual_id === "None" ||
                data.version_actual_id === null ||
                data.version_actual_id === undefined
                ? null
                : String(data.versionActualId || data.version_actual_id || ""),
        ...data,
    };
};

/**
 * Origen de un documento dentro del árbol documental
 */
export interface OrigenDocumentoArbol {
    tipo: string;
    origenId: string | null;
}

/**
 * Nodo hoja del árbol documental (un documento)
 */
export interface DocumentoArbol extends DocumentoGenerico {
    codigo: string;
    tipoId: string;
    extension: string | null;
    origen: OrigenDocumentoArbol;
}

/**
 * Nodo de carpeta del árbol documental (contiene subcarpetas y/o documentos)
 */
export interface CarpetaArbol {
    id: string;
    nombre: string;
    contenido: NodoArbol[];
}

export type NodoArbol = DocumentoArbol | CarpetaArbol;

/**
 * Type guard: distingue una carpeta de un documento dentro del árbol
 */
export const esCarpetaArbol = (nodo: NodoArbol): nodo is CarpetaArbol =>
    Array.isArray((nodo as { contenido?: unknown }).contenido);

/**
 * Transforma un nodo del árbol devuelto por el backend (carpeta o documento)
 */
const transformarNodoArbol = (nodo: unknown): NodoArbol => {
    const data = nodo as Record<string, unknown>;

    if (Array.isArray(data.contenido)) {
        return {
            id: String(data.id || ""),
            nombre: String(data.nombre || ""),
            contenido: data.contenido.map(transformarNodoArbol),
        };
    }

    const origen = data.origen as Record<string, unknown> | undefined;
    return {
        ...transformarDocumento(data),
        codigo: String(data.codigo || ""),
        tipoId: String(data.tipo_id || ""),
        extension: (data.extension as string | null) ?? null,
        origen: {
            tipo: String(origen?.tipo || ""),
            origenId: (origen?.origen_id as string | null) ?? null,
        },
    } as DocumentoArbol;
};

/**
 * API para documentos de la API de documentos (genérico para todas las aplicaciones)
 */
export const DocumentosAPI = {
    /**
     * Obtiene documentos relacionados con un objeto específico
     * @param filtro Filtro con pares [campo, valor]
     * @param orden Orden de resultados
     * @param paginacion Configuración de paginación
     */
    async obtener(
        filtro: Filtro,
        orden: Orden = [],
        paginacion: Paginacion = { limite: 50, pagina: 1 }
    ): Promise<{ datos: DocumentoGenerico[]; total: number }> {
        const q = criteriaQuery(filtro, orden, paginacion);

        const respuesta = await RestAPI.get<{ datos: unknown[]; total: number }>(
            DOCUMENTAL_BASE_URL + q
        );
        return {
            datos: respuesta.datos.map(transformarDocumento),
            total: respuesta.total,
        };
    },

    /**
     * Obtiene el árbol de carpetas/subcarpetas y documentos de un objeto
     * @param tipoObjeto Tipo del objeto vinculado (p.ej. "incidencia")
     * @param objetoId Id del objeto vinculado
     */
    async obtenerArbol(tipoObjeto: string, objetoId: string): Promise<NodoArbol[]> {
        const respuesta = await RestAPI.get<{ datos: unknown[] }>(
            `${DOCUMENTAL_BASE_URL}/arbol/${tipoObjeto}/${objetoId}`
        );
        return respuesta.datos.map(transformarNodoArbol);
    },

    /**
     * Sube un nuevo documento
     * @param formData FormData con los campos del documento
     */
    async crear(formData: FormData): Promise<string> {
        const respuesta = await RestAPI.post(
            DOCUMENTAL_BASE_URL,
            formData,
            tLib("gen.api.errorAlGuardarDocumento")
        );
        return (respuesta as { id: string }).id;
    },

    /**
     * Crea una nueva carpeta contenedora
     * @param nombre Nombre de la carpeta
     * @param vinculoTipo Tipo del vínculo: tipo del objeto de negocio, o "gd_documentos" si cuelga de otra carpeta
     * @param vinculoId Id del vínculo: id del objeto de negocio, o id de la carpeta padre
     */
    async crearCarpeta(nombre: string, vinculoTipo: string, vinculoId: string): Promise<string> {
        // console.log('mimensaje_formData', vinculoTipo, vinculoId);
        const respuesta = await RestAPI.post(
            `${DOCUMENTAL_BASE_URL}/carpeta`,
            {
                nombre,
                tipo_documento: "Carpeta",
                vinculo_tipo: vinculoTipo,
                vinculo_id: vinculoId,
            },
            tLib("gen.api.errorAlCrearCarpeta")
        );
        return (respuesta as { id: string }).id;
    },

    /**
     * Descarga un documento
     * @param documentoId ID del documento a descargar
     */
    async descargar(documentoId: string): Promise<Blob> {
        return await RestAPI.blob(`${DOCUMENTAL_BASE_URL}/${documentoId}/descargar`);
    },

    /**
     * Elimina un documento
     * @param documentoId ID del documento a eliminar
     */
    async eliminar(documentoId: string): Promise<void> {
        await RestAPI.delete(`${DOCUMENTAL_BASE_URL}/${documentoId}`, tLib("gen.api.errorAlBorrarDocumento"));
    },
};

/**
 * Descarga un Blob a través del navegador
 */
export const descargarDocumento = async (blob: Blob, nombreArchivo: string): Promise<void> => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Abre un Blob en una nueva pestaña
 */
export const abrirDocumento = async (blob: Blob): Promise<void> => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
};

/**
 * Descarga y abre un Blob directamente
 */
export const descargarYAbrirDocumento = async (blob: Blob, nombreArchivo: string): Promise<void> => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
};
