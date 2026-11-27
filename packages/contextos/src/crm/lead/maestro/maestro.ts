import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { ProcesarListaActivaEntidades, accionesListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Lead } from "../diseño.ts";
import { getLeads } from "../infraestructura.ts";
import { ContextoMaestroLeads, EstadoMaestroLeads } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";
import { textoTipoEntidadLead } from "../../comun/valores/texto_opcion.ts";

export const metaTablaLead: MetaTabla<Lead> = [
    { id: "id", get cabecera() { return tCrm("lead.codigo"); } },
    { id: "nombre", get cabecera() { return tCrm("lead.nombre"); } },
    { id: "tipo", get cabecera() { return tCrm("lead.tipo"); }, render: (l) => textoTipoEntidadLead(l.tipo) },
    { id: "estado_id", get cabecera() { return tCrm("lead.estado"); } },
    { id: "fuente_id", get cabecera() { return tCrm("lead.fuente"); } },
];

type ProcesarLeads = ProcesarContexto<EstadoMaestroLeads, ContextoMaestroLeads>;

const conLeads = (fn: ProcesarListaActivaEntidades<Lead>) => (ctx: ContextoMaestroLeads) => ({ ...ctx, leads: fn(ctx.leads) });

export const Leads = accionesListaActivaEntidades(conLeads);

export const recargarLeads: ProcesarLeads = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getLeads(criteria.filtro, criteria.orden, criteria.paginacion);

    return Leads.recargar(contexto, resultado);
}

export const ampliarLeads: ProcesarLeads = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getLeads(criteria.filtro, criteria.orden, criteria.paginacion);

    return Leads.ampliar(contexto, resultado);
}