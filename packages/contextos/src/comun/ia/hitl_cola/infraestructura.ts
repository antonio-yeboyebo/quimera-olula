import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { GetHitlTarea, GetHitlTareas, HitlTarea, PostRechazarHitlTarea, PostResolverHitlTarea } from "./diseño.js";

const BASE_URL = '/comun/hitl-cola';

interface HitlTareaApi {
    id: string;
    estado: string;
    tipo_accion: string;
    ui_hint: string;
    titulo: string;
    datos_payload: Record<string, unknown>;
    datos_resolucion: Record<string, unknown> | null;
    creado_en: string;
    resuelto_en: string | null;
    usuario_id: string;
    resuelto_por: string | null;
}

const hitlTareaDesdeApi = (api: HitlTareaApi): HitlTarea => ({
    id: api.id,
    estado: api.estado as HitlTarea['estado'],
    tipo_accion: api.tipo_accion,
    ui_hint: api.ui_hint,
    titulo: api.titulo,
    datos_payload: api.datos_payload,
    datos_resolucion: api.datos_resolucion,
    creado_en: api.creado_en,
    resuelto_en: api.resuelto_en,
    usuario_id: api.usuario_id,
    resuelto_por: api.resuelto_por,
});

export const getHitlTareas: GetHitlTareas = async (estado) => {
    const criteria = {
        ...criteriaDefecto,
        filtro: estado ? [['estado', '=', estado]] as [[string, string, string]] : [],
        orden: ['creado_en', 'DESC'] as [string, string],
    };
    return await RestAPI.getQuery<HitlTarea, HitlTareaApi>(
        BASE_URL,
        criteria,
        hitlTareaDesdeApi,
        'Error al obtener tareas HITL',
    );
};

export const getHitlTarea: GetHitlTarea = async (id) => {
    return await RestAPI.getItem<HitlTarea, HitlTareaApi>(
        `${BASE_URL}/${id}`,
        hitlTareaDesdeApi,
        'Error al obtener la tarea HITL',
    );
};

export const resolverHitlTarea: PostResolverHitlTarea = async (id, datos_resolucion) => {
    await RestAPI.post<{ datos_resolucion: Record<string, unknown> }>(
        `${BASE_URL}/${id}/resolver`,
        { datos_resolucion },
        'Error al resolver la tarea HITL',
    );
};

export const rechazarHitlTarea: PostRechazarHitlTarea = async (id, motivo) => {
    await RestAPI.post<{ motivo?: string }>(
        `${BASE_URL}/${id}/rechazar`,
        motivo ? { motivo } : {},
        'Error al rechazar la tarea HITL',
    );
};
