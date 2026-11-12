import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { MotivoTarea } from "../diseño.ts";
import { getMotivosTarea } from "../infraestructura.ts";
import {
    ContextoMaestroMotivoTarea,
    EstadoMaestroMotivoTarea,
} from "./diseño.ts";

type ProcesarMaestroMotivoTarea = ProcesarContexto<
    EstadoMaestroMotivoTarea,
    ContextoMaestroMotivoTarea
>;

const conMotivosTarea =
    (fn: ProcesarListaActivaEntidades<MotivoTarea>) =>
        (ctx: ContextoMaestroMotivoTarea) => ({
            ...ctx,
            motivosTarea: fn(ctx.motivosTarea),
        });

export const MotivosTarea = accionesListaActivaEntidades(conMotivosTarea);

export const recargarMotivosTarea: ProcesarMaestroMotivoTarea = async (
    contexto,
    payload
) => {
    const criteria = payload as Criteria;
    const resultado = await getMotivosTarea(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );

    return MotivosTarea.recargar(contexto, resultado);
};

export const ampliarMotivosTarea: ProcesarMaestroMotivoTarea = async (
    contexto,
    payload
) => {
    const criteria = payload as Criteria;
    const resultado = await getMotivosTarea(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );

    return MotivosTarea.ampliar(contexto, resultado);
};
