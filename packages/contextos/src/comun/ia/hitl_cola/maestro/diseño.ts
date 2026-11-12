import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.ts";
import { HitlTarea } from "../diseño.js";

export type EstadoMaestroHitlCola = 'INICIAL' | 'RESOLVIENDO' | 'RECHAZANDO';

export type ContextoMaestroHitlCola = {
    estado: EstadoMaestroHitlCola;
    tareas: ListaActivaEntidades<HitlTarea>;
    filtroEstado: string;
};
