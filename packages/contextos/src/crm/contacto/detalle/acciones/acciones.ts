import { Accion } from "#/crm/accion/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getAccionesContacto } from "../../infraestructura.ts";
import { ContextoAccionesContacto, EstadoAccionesContacto } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";
import { textoEstadoAccion, textoTipoAccion } from "../../../comun/valores/texto_opcion.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", get cabecera() { return tCrm("contacto.codigo"); } },
    { id: "fecha", get cabecera() { return tCrm("contacto.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tCrm("contacto.descripcion"); } },
    { id: "tipo", get cabecera() { return tCrm("contacto.tipo"); }, render: (a) => textoTipoAccion(a.tipo) },
    { id: "estado", get cabecera() { return tCrm("contacto.estado"); }, render: (a) => textoEstadoAccion(a.estado) },
];

type ProcesarAcciones = ProcesarContexto<EstadoAccionesContacto, ContextoAccionesContacto>;

const conAcciones = (fn: ProcesarListaEntidades<Accion>) => (ctx: ContextoAccionesContacto) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const contactoId = payload as string;
    const resultado = await getAccionesContacto(contactoId);

    return Acciones.recargar(contexto, resultado);
}