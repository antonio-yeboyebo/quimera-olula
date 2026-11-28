import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { EstadoLead } from "../diseño.ts";
import { getEstadosLead } from "../infraestructura.ts";
import { ContextoMaestroEstadosLead, EstadoMaestroEstadosLead } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaTablaEstadoLead: MetaTabla<EstadoLead> = [
    { id: "id", get cabecera() { return tCrm("estadoLead.codigo"); } },
    { id: "descripcion", get cabecera() { return tCrm("estadoLead.descripcion"); } },
];

type ProcesarEstadosLead = ProcesarContexto<EstadoMaestroEstadosLead, ContextoMaestroEstadosLead>;

const conEstadosLead =
    (fn: ProcesarListaActivaEntidades<EstadoLead>) =>
        (ctx: ContextoMaestroEstadosLead) => ({ ...ctx, estados_lead: fn(ctx.estados_lead) });

export const EstadosLead = accionesListaActivaEntidades(conEstadosLead);

export const recargarEstadosLead: ProcesarEstadosLead = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEstadosLead(criteria.filtro, criteria.orden, criteria.paginacion);

    return EstadosLead.recargar(contexto, resultado);
}