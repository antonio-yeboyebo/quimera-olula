import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { HitlTarea } from "../diseño.js";
import { getHitlTareas } from "../infraestructura.js";
import { ContextoMaestroHitlCola, EstadoMaestroHitlCola } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroHitlCola, ContextoMaestroHitlCola>;

const conTareas = (fn: ProcesarListaActivaEntidades<HitlTarea>) =>
    (ctx: ContextoMaestroHitlCola) => ({ ...ctx, tareas: fn(ctx.tareas) });

export const Tareas = accionesListaActivaEntidades(conTareas);

export const recargarTareas: ProcesarMaestro = async (contexto) => {
    const resultado = await getHitlTareas(contexto.filtroEstado);
    return Tareas.recargar(contexto, resultado);
};

export const cambiarFiltroEstado: ProcesarMaestro = async (contexto, payload) => {
    const filtroEstado = payload as string;
    const resultado = await getHitlTareas(filtroEstado);
    const ctxFiltrado = { ...contexto, filtroEstado };
    return Tareas.recargar(ctxFiltrado, resultado);
};

export const quitarTareaActiva: ProcesarMaestro = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL' as EstadoMaestroHitlCola,
        tareas: { ...contexto.tareas, activo: undefined },
    };
};
