import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { FuenteLead } from "../diseño.ts";
import { getFuentesLead } from "../infraestructura.ts";
import { ContextoMaestroFuentesLead, EstadoMaestroFuentesLead } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaTablaFuenteLead: MetaTabla<FuenteLead> = [
    { id: "id", get cabecera() { return tCrm("fuenteLead.codigo"); } },
    { id: "descripcion", get cabecera() { return tCrm("fuenteLead.descripcion"); } },
];

type ProcesarFuentesLead = ProcesarContexto<EstadoMaestroFuentesLead, ContextoMaestroFuentesLead>;

const conFuentesLead =
    (fn: ProcesarListaActivaEntidades<FuenteLead>) =>
        (ctx: ContextoMaestroFuentesLead) => ({ ...ctx, fuentes_lead: fn(ctx.fuentes_lead) });

export const FuentesLead = accionesListaActivaEntidades(conFuentesLead);

export const recargarFuentesLead: ProcesarFuentesLead = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getFuentesLead(criteria.filtro, criteria.orden, criteria.paginacion);

    return FuentesLead.recargar(contexto, resultado);
}