import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemMaquina } from "../../diseño.ts";
import { getMaquinas } from "../../infraestructura.ts";
import { ContextoMaestroMaquina, EstadoMaestroMaquina } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroMaquina, ContextoMaestroMaquina>;

const conMaquinas = (fn: ProcesarListaActivaEntidades<ItemMaquina>) =>
    (ctx: ContextoMaestroMaquina) => ({ ...ctx, maquinas: fn(ctx.maquinas) });

export const Maquinas = accionesListaActivaEntidades(conMaquinas);

export const recargarMaquinas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getMaquinas(criteria);
    return Maquinas.recargar(contexto, resultado);
};

export const ampliarMaquinas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getMaquinas(criteria);
    return Maquinas.ampliar(contexto, resultado);
};
