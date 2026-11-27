import { Accion } from "#/crm/accion/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getAccionesOportunidad } from "../../infraestructura.ts";
import { ContextoAccionesOportunidad, EstadoAccionesOportunidad } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";
import { textoEstadoAccion, textoTipoAccion } from "../../../comun/valores/texto_opcion.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", get cabecera() { return tCrm("oportunidadventa.codigo"); } },
    { id: "fecha", get cabecera() { return tCrm("oportunidadventa.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tCrm("oportunidadventa.descripcion"); } },
    { id: "tipo", get cabecera() { return tCrm("oportunidadventa.tipo"); }, render: (a) => textoTipoAccion(a.tipo) },
    { id: "estado", get cabecera() { return tCrm("oportunidadventa.estado"); }, render: (a) => textoEstadoAccion(a.estado) },
];

type ProcesarAcciones = ProcesarContexto<EstadoAccionesOportunidad, ContextoAccionesOportunidad>;

const conAcciones = (fn: ProcesarListaEntidades<Accion>) => (ctx: ContextoAccionesOportunidad) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const oportunidadId = payload as string;
    const resultado = await getAccionesOportunidad(oportunidadId);

    return Acciones.recargar(contexto, resultado);
}