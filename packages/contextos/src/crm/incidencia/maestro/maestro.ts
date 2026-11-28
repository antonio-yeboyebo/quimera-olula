import { MetaTabla } from "@olula/componentes/index.js";
import { ClausulaFiltro, Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";
import { getIncidencias } from "../infraestructura.ts";
import { ContextoMaestroIncidencias, EstadoMaestroIncidencias } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";
import { descripcionEstadoIncidencia } from "../../comun/componentes/EstadoIncidencia.tsx";
import { descripcionPrioridadIncidencia } from "../../comun/valores/prioridad_incidencia.ts";

export const metaTablaIncidencia: MetaTabla<Incidencia> = [
    { id: "id", get cabecera() { return tCrm("incidencia.codigo"); } },
    { id: "descripcion", get cabecera() { return tCrm("incidencia.descripcion2"); } },
    { id: "nombre", get cabecera() { return tCrm("incidencia.nombre"); } },
    { id: "estado", get cabecera() { return tCrm("incidencia.estado"); }, render: (i) => descripcionEstadoIncidencia(i.estado) },
    { id: "prioridad", get cabecera() { return tCrm("incidencia.prioridad"); }, render: (i) => descripcionPrioridadIncidencia(i.prioridad) },
];

export const estadosIncidenciaOcultosPorDefecto = ["rechazada", "cerrada"];

export const crearFiltroEstadoIncidencia = (
    valor: unknown
): ClausulaFiltro | null => {
    const valores = Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : [];

    if (!valores.length) return null;

    return ["estado", "in", valores as unknown as string] as ClausulaFiltro;
};

type ProcesarIncidencias = ProcesarContexto<EstadoMaestroIncidencias, ContextoMaestroIncidencias>;

const conIncidencias =
    (fn: ProcesarListaActivaEntidades<Incidencia>) =>
        (ctx: ContextoMaestroIncidencias) => ({ ...ctx, incidencias: fn(ctx.incidencias) });

export const Incidencias = accionesListaActivaEntidades(conIncidencias);

export const recargarIncidencias: ProcesarIncidencias = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);

    return Incidencias.recargar(contexto, resultado);
}

export const ampliarIncidencias: ProcesarIncidencias = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);

    return Incidencias.ampliar(contexto, resultado);
}
