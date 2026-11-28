import { OportunidadVenta } from "#/crm/oportunidadventa/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getOportunidadesVentaCliente } from "../../infraestructura.ts";
import { ContextoOportunidadesCliente, EstadoOportunidadesCliente } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";

export const metaTablaOportunidades: MetaTabla<OportunidadVenta> = [
    { id: "id", get cabecera() { return tCrm("cliente.codigo"); } },
    { id: "descripcion", get cabecera() { return tCrm("cliente.descripcion"); } },
    { id: "nombre_cliente", get cabecera() { return tCrm("cliente.cliente"); } },
    { id: "importe", get cabecera() { return tCrm("cliente.total"); }, tipo: "moneda" },
    { id: "fecha_cierre", get cabecera() { return tCrm("cliente.fechaCierre"); }, tipo: "fecha" },
];

type ProcesarOportunidades = ProcesarContexto<EstadoOportunidadesCliente, ContextoOportunidadesCliente>;

type PayloadRecargaOportunidades = {
    clienteId: string;
    criteria: Criteria;
};

const conOportunidades = (fn: ProcesarListaEntidades<OportunidadVenta>) => (ctx: ContextoOportunidadesCliente) => ({ ...ctx, oportunidades: fn(ctx.oportunidades) });

export const Oportunidades = accionesListaEntidades(conOportunidades);

export const recargarOportunidades: ProcesarOportunidades = async (contexto, payload) => {
    const { clienteId, criteria } = payload as PayloadRecargaOportunidades;
    const resultado = await getOportunidadesVentaCliente(clienteId, criteria);

    return Oportunidades.recargar(contexto, resultado);
}