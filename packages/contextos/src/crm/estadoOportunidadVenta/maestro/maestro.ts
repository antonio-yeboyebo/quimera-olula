import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { EstadoOportunidad } from "../diseño.ts";
import { getEstadosOportunidad } from "../infraestructura.ts";
import { ContextoMaestroEstadosOportunidad, EstadoMaestroEstadosOportunidad } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";
import { textoEstadoBaseOportunidad } from "../../comun/valores/texto_opcion.ts";

export const metaTablaEstadoOportunidad: MetaTabla<EstadoOportunidad> = [
    { id: "id", get cabecera() { return tCrm("estadoOportunidadVenta.codigo"); } },
    { id: "descripcion", get cabecera() { return tCrm("estadoOportunidadVenta.descripcion"); } },
    { id: "estadobase", get cabecera() { return tCrm("estadoOportunidadVenta.estadoBase"); }, render: (e) => textoEstadoBaseOportunidad(e.estadobase) },
    { id: "probabilidad", get cabecera() { return tCrm("estadoOportunidadVenta.probabilidad2"); }, tipo: "numero" },
];

type ProcesarEstadosOportunidad = ProcesarContexto<EstadoMaestroEstadosOportunidad, ContextoMaestroEstadosOportunidad>;

const conEstadosOportunidad =
    (fn: ProcesarListaActivaEntidades<EstadoOportunidad>) =>
        (ctx: ContextoMaestroEstadosOportunidad) => ({ ...ctx, estados_oportunidad: fn(ctx.estados_oportunidad) });

export const EstadosOportunidad = accionesListaActivaEntidades(conEstadosOportunidad);

export const recargarEstadosOportunidad: ProcesarEstadosOportunidad = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEstadosOportunidad(criteria.filtro, criteria.orden, criteria.paginacion);

    return EstadosOportunidad.recargar(contexto, resultado);
}