import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Impresora } from "../diseño.ts";
import { getImpresora, getImpresoras } from "../infraestructura.ts";
import { ContextoMaestroImpresora, EstadoMaestroImpresora } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroImpresora, ContextoMaestroImpresora>;

const conImpresoras = (fn: ProcesarListaActivaEntidades<Impresora>) =>
    (ctx: ContextoMaestroImpresora) => ({ ...ctx, impresoras: fn(ctx.impresoras) });

export const Impresoras = accionesListaActivaEntidades(conImpresoras);

export const recargarImpresoras: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getImpresoras(criteria);
    return Impresoras.recargar(contexto, resultado);
};

export const ampliarImpresoras: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getImpresoras(criteria);
    return Impresoras.ampliar(contexto, resultado);
};

export const incluirImpresoraCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const impresora = await getImpresora(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroImpresora,
        impresoras: {
            ...contexto.impresoras,
            lista: [impresora, ...contexto.impresoras.lista],
            total: contexto.impresoras.total + 1,
            activo: impresora.id,
        },
    };
};
