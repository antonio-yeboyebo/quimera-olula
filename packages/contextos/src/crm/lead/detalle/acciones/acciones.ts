import { Accion } from "#/crm/accion/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getAccionesLead } from "../../infraestructura.ts";
import { ContextoAccionesLead, EstadoAccionesLead } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";
import { textoEstadoAccion, textoTipoAccion } from "../../../comun/valores/texto_opcion.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", get cabecera() { return tCrm("lead.codigo"); } },
    { id: "fecha", get cabecera() { return tCrm("lead.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tCrm("lead.descripcion"); } },
    { id: "tipo", get cabecera() { return tCrm("lead.tipo"); }, render: (a) => textoTipoAccion(a.tipo) },
    { id: "estado", get cabecera() { return tCrm("lead.estado"); }, render: (a) => textoEstadoAccion(a.estado) },
];

type ProcesarAcciones = ProcesarContexto<EstadoAccionesLead, ContextoAccionesLead>;


const conAcciones = (fn: ProcesarListaEntidades<Accion>) => (ctx: ContextoAccionesLead) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const leadId = payload as string;
    const resultado = await getAccionesLead(leadId);

    return Acciones.recargar(contexto, resultado);
}