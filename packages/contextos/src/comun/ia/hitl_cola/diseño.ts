import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";

export type EstadoHitlTarea = 'pendiente' | 'resuelta' | 'rechazada';

/**
 * Tarea en la cola HITL.
 * `datos_payload` contiene la información extraída por el LLM (p.ej. FacturaLeida).
 * `datos_resolucion` contiene las ediciones del humano al aprobar, o null.
 */
export interface HitlTarea extends Entidad {
    id: string;
    estado: EstadoHitlTarea;
    tipo_accion: string;
    /** Clave que determina qué componente de resolución renderizar */
    ui_hint: string;
    titulo: string;
    datos_payload: Record<string, unknown>;
    datos_resolucion: Record<string, unknown> | null;
    creado_en: string;
    resuelto_en: string | null;
    usuario_id: string;
    resuelto_por: string | null;
}

/** Props que recibe cualquier componente de resolución HITL */
export interface ResolvedorHitlTareaProps {
    tarea: HitlTarea;
    publicar: EmitirEvento;
}

export type GetHitlTareas = (estado?: string) => Promise<{ datos: HitlTarea[]; total: number }>;
export type GetHitlTarea = (id: string) => Promise<HitlTarea>;
export type PostResolverHitlTarea = (id: string, datos_resolucion: Record<string, unknown>) => Promise<void>;
export type PostRechazarHitlTarea = (id: string, motivo?: string) => Promise<void>;
