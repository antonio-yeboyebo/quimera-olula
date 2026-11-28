import { Criteria, Entidad, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Cliente } from "../diseño.ts";
import { getClientes } from "../infraestructura.ts";
import { ContextoMaestroClientes, EstadoMaestroClientes } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaTablaCliente = [
    { id: "id", get cabecera() { return tCrm("cliente.id"); } },
    { id: "nombre", get cabecera() { return tCrm("cliente.nombre"); } },
    {
        id: "id_fiscal",
        get cabecera() { return tCrm("cliente.idFiscal"); },
        render: (entidad: Entidad) =>
            `${entidad.tipo_id_fiscal}: ${entidad.id_fiscal}`,
    },
    { id: "telefono1", get cabecera() { return tCrm("cliente.telefono"); } },
    { id: "email", get cabecera() { return tCrm("cliente.email"); } },
];

type ProcesarClientes = ProcesarContexto<EstadoMaestroClientes, ContextoMaestroClientes>;

const conClientes =
    (fn: ProcesarListaActivaEntidades<Cliente>) =>
        (ctx: ContextoMaestroClientes) => ({ ...ctx, clientes: fn(ctx.clientes) });

export const Clientes = accionesListaActivaEntidades(conClientes);

export const recargarClientes: ProcesarClientes = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClientes(criteria.filtro, criteria.orden, criteria.paginacion);

    return Clientes.recargar(contexto, resultado);
}

export const ampliarClientes: ProcesarClientes = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClientes(criteria.filtro, criteria.orden, criteria.paginacion);

    return Clientes.ampliar(contexto, resultado);
}
