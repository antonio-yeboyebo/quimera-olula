import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Contacto } from "../diseño.ts";
import { getContactos } from "../infraestructura.ts";
import { ContextoMaestroContactos, EstadoMaestroContactos } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaTablaContacto: MetaTabla<Contacto> = [
    { id: "id", get cabecera() { return tCrm("contacto.id"); } },
    { id: "nombre", get cabecera() { return tCrm("contacto.nombre"); } },
    { id: "email", get cabecera() { return tCrm("contacto.email"); } },
    { id: "telefono1", get cabecera() { return tCrm("contacto.telefono"); } },
];

type ProcesarContactos = ProcesarContexto<EstadoMaestroContactos, ContextoMaestroContactos>;

const conContactos =
    (fn: ProcesarListaActivaEntidades<Contacto>) =>
        (ctx: ContextoMaestroContactos) => ({ ...ctx, contactos: fn(ctx.contactos) });

export const Contactos = accionesListaActivaEntidades(conContactos);

export const recargarContactos: ProcesarContactos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getContactos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Contactos.recargar(contexto, resultado);
}

export const ampliarContactos: ProcesarContactos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getContactos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Contactos.ampliar(contexto, resultado);
}