import { Accion } from "#/crm/accion/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getAccionesIncidencia } from "../../infraestructura.ts";
import { ContextoAccionesIncidencia, EstadoAccionesIncidencia } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";
import { textoEstadoAccion, textoTipoAccion } from "../../../comun/valores/texto_opcion.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", get cabecera() { return tCrm("incidencia.codigo"); } },
    { id: "fecha", get cabecera() { return tCrm("incidencia.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tCrm("incidencia.descripcion"); } },
    { id: "tipo", get cabecera() { return tCrm("incidencia.tipo"); }, render: (a) => textoTipoAccion(a.tipo) },
    { id: "estado", get cabecera() { return tCrm("incidencia.estado"); }, render: (a) => textoEstadoAccion(a.estado) },
];

type ProcesarAcciones = ProcesarContexto<EstadoAccionesIncidencia, ContextoAccionesIncidencia>;


const conAcciones = (fn: ProcesarListaEntidades<Accion>) => (ctx: ContextoAccionesIncidencia) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const incidenciaId = payload as string;
    const resultado = await getAccionesIncidencia(incidenciaId);

    return Acciones.recargar(contexto, resultado);
}