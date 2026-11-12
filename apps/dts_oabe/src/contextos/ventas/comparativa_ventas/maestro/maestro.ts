import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { ComparativaVentas } from "../diseño.ts";
import {
    getComparativaVentas,
    getListaComparativaVentas,
} from "../infraestructura.ts";
import {
    ContextoMaestroComparativaVentas,
    EstadoMaestroComparativaVentas,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroComparativaVentas,
    ContextoMaestroComparativaVentas
>;

const conComparativas =
    (fn: ProcesarListaActivaEntidades<ComparativaVentas>) =>
    (ctx: ContextoMaestroComparativaVentas) => ({
        ...ctx,
        comparativas: fn(ctx.comparativas),
    });

export const Comparativas = accionesListaActivaEntidades(conComparativas);

export const recargarComparativas: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaComparativaVentas(payload as Criteria);
    return Comparativas.recargar(contexto, resultado);
};

export const ampliarComparativas: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaComparativaVentas(payload as Criteria);
    return Comparativas.ampliar(contexto, resultado);
};

export const incluirComparativaCreadaPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const comparativa = await getComparativaVentas(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        comparativas: {
            ...contexto.comparativas,
            lista: [comparativa, ...contexto.comparativas.lista],
            total: contexto.comparativas.total + 1,
            activo: comparativa.id,
        },
    };
};
