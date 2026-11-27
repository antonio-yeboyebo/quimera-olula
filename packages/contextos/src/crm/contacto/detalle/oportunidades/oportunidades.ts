import { OportunidadVenta } from "#/crm/oportunidadventa/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getOportunidadesVentaContacto } from "../../infraestructura.ts";
import { ContextoOportunidadesContacto, EstadoOportunidadesContacto } from "./diseño.ts";
import { tCrm } from "../../../i18n/index.ts";

export const metaTablaOportunidades: MetaTabla<OportunidadVenta> = [
    { id: "id", get cabecera() { return tCrm("contacto.codigo"); } },
    { id: "descripcion", get cabecera() { return tCrm("contacto.descripcion"); } },
    { id: "nombre_cliente", get cabecera() { return tCrm("contacto.cliente"); } },
    { id: "importe", get cabecera() { return tCrm("contacto.total"); }, tipo: "moneda" },
    { id: "fecha_cierre", get cabecera() { return tCrm("contacto.fechaCierre"); }, tipo: "fecha" },
];

type ProcesarOportunidades = ProcesarContexto<EstadoOportunidadesContacto, ContextoOportunidadesContacto>;

type PayloadRecargaOportunidades = {
    contactoId: string;
    criteria: Criteria;
};

const conOportunidades = (fn: ProcesarListaEntidades<OportunidadVenta>) => (ctx: ContextoOportunidadesContacto) => ({ ...ctx, oportunidades: fn(ctx.oportunidades) });

export const Oportunidades = accionesListaEntidades(conOportunidades);

export const recargarOportunidades: ProcesarOportunidades = async (contexto, payload) => {
    const { contactoId, criteria } = payload as PayloadRecargaOportunidades;
    const resultado = await getOportunidadesVentaContacto(contactoId, criteria);

    return Oportunidades.recargar(contexto, resultado);
}