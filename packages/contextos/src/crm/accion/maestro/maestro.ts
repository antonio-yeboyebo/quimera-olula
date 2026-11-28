import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Accion } from "../diseño.ts";
import { finalizarAccion, getAcciones } from "../infraestructura.ts";
import { ContextoMaestroAcciones, EstadoMaestroAcciones } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";
import { textoEstadoAccion, textoTipoAccion } from "../../comun/valores/texto_opcion.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", get cabecera() { return tCrm("accion.codigo"); } },
    { id: "fecha", get cabecera() { return tCrm("accion.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tCrm("accion.descripcion"); } },
    { id: "tipo", get cabecera() { return tCrm("accion.tipo"); }, render: (a) => textoTipoAccion(a.tipo) },
    { id: "estado", get cabecera() { return tCrm("accion.estado"); }, render: (a) => textoEstadoAccion(a.estado) },
];

type ProcesarAcciones = ProcesarContexto<EstadoMaestroAcciones, ContextoMaestroAcciones>;

const conAcciones =
    (fn: ProcesarListaActivaEntidades<Accion>) =>
        (ctx: ContextoMaestroAcciones) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaActivaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAcciones(criteria.filtro, criteria.orden, criteria.paginacion);

    return Acciones.recargar(contexto, resultado);
}

export const ampliarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAcciones(criteria.filtro, criteria.orden, criteria.paginacion);

    return Acciones.ampliar(contexto, resultado);
}

export const finalizarAccionRapida: ProcesarAcciones = async (contexto, payload) => {
    const accionId = payload as string;
    await finalizarAccion(accionId);

    return Acciones.quitar(contexto, accionId);
}
