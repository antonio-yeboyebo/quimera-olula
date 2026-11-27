import { Accion } from "#/crm/accion/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getAccionesCliente } from "../../infraestructura.ts";
import { ContextoAccionesCliente, EstadoAccionesCliente } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";
import { textoEstadoAccion, textoTipoAccion } from "../../../comun/valores/texto_opcion.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", get cabecera() { return tCrm("cliente.codigo"); } },
    { id: "fecha", get cabecera() { return tCrm("cliente.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tCrm("cliente.descripcion"); } },
    { id: "tipo", get cabecera() { return tCrm("cliente.tipo"); }, render: (a) => textoTipoAccion(a.tipo) },
    { id: "estado", get cabecera() { return tCrm("cliente.estado"); }, render: (a) => textoEstadoAccion(a.estado) },
];

type ProcesarAcciones = ProcesarContexto<EstadoAccionesCliente, ContextoAccionesCliente>;


const conAcciones = (fn: ProcesarListaEntidades<Accion>) => (ctx: ContextoAccionesCliente) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const clienteId = payload as string;
    const resultado = await getAccionesCliente(clienteId);

    return Acciones.recargar(contexto, resultado);
}