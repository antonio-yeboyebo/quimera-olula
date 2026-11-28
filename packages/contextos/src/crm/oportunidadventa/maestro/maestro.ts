import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { OportunidadVenta } from "../diseño.ts";
import { getOportunidadesVenta, patchOportunidadVenta } from "../infraestructura.ts";
import { ContextoMaestroOportunidades, EstadoMaestroOportunidades } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";


export const metaTablaOportunidadVenta: MetaTabla<OportunidadVenta> = [
    { id: "probabilidad", get cabecera() { return tCrm("oportunidadventa.probabilidad2"); }, tipo: "numero" },
    { id: "descripcion", get cabecera() { return tCrm("oportunidadventa.descripcion"); } },
    { id: "nombre_cliente", get cabecera() { return tCrm("oportunidadventa.cliente"); } },
    { id: "importe", get cabecera() { return tCrm("oportunidadventa.total"); }, tipo: "moneda" },
    { id: "fecha_cierre", get cabecera() { return tCrm("oportunidadventa.fechaCierre"); }, tipo: "fecha" },
];

type ProcesarOportunidades = ProcesarContexto<EstadoMaestroOportunidades, ContextoMaestroOportunidades>;

const conOportunidades =
    (fn: ProcesarListaActivaEntidades<OportunidadVenta>) =>
        (ctx: ContextoMaestroOportunidades) => ({ ...ctx, oportunidades: fn(ctx.oportunidades) });

export const Oportunidades = accionesListaActivaEntidades(conOportunidades);

export const recargarOportunidades: ProcesarOportunidades = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getOportunidadesVenta(criteria.filtro, criteria.orden, criteria.paginacion);

    return Oportunidades.recargar(contexto, resultado);
}

export const ampliarOportunidades: ProcesarOportunidades = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getOportunidadesVenta(criteria.filtro, criteria.orden, criteria.paginacion);

    return Oportunidades.ampliar(contexto, resultado);
}

type PayloadCambioEstadoOportunidad = {
    idOportunidad: string;
    nuevoEstado: string;
    descripcionEstado?: string | null;
    probabilidadEstado?: number;
};

export const cambiarEstadoOportunidad: ProcesarOportunidades = async (contexto, payload) => {
    const {
        idOportunidad,
        nuevoEstado,
        descripcionEstado,
        probabilidadEstado,
    } = payload as PayloadCambioEstadoOportunidad;

    const oportunidadActual = contexto.oportunidades.lista.find(
        (oportunidad) => oportunidad.id === idOportunidad
    );

    if (!oportunidadActual) {
        return contexto;
    }

    await patchOportunidadVenta(idOportunidad, {
        ...oportunidadActual,
        estado_id: nuevoEstado,
        descripcion_estado: descripcionEstado ?? oportunidadActual.descripcion_estado,
        probabilidad: probabilidadEstado ?? oportunidadActual.probabilidad,
    });

    const { filtro, orden, paginacion } = contexto.oportunidades.criteria;
    const resultado = await getOportunidadesVenta(filtro, orden, paginacion);

    return Oportunidades.recargar(contexto, resultado);
}