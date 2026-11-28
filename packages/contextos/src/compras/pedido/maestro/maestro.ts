import { albaranarPedidos } from "#/compras/albaran/infraestructura.ts";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.ts";
import { Pedido } from "../diseño.ts";
import { tCompras } from "#/compras/i18n/index.ts";
import { pedidoAlbaranable } from "../dominio.ts";
import { getPedido, getPedidos } from "../infraestructura.ts";
import { ContextoMaestroPedido, EstadoMaestroPedido } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPedido, ContextoMaestroPedido>;

const conPedidos = (fn: ProcesarListaActivaEntidades<Pedido>) =>
    (ctx: ContextoMaestroPedido) => ({ ...ctx, pedidos: fn(ctx.pedidos) });

export const Pedidos = accionesListaActivaEntidades(conPedidos);

export const recargarPedidos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPedidos(criteria);
    return Pedidos.recargar(contexto, resultado);
};

export const ampliarPedidos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPedidos(criteria);
    return Pedidos.ampliar(contexto, resultado);
};

export const incluirPedidoCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const pedido = await getPedido(id);
    return {
        ...contexto,
        estado: "INICIAL",
        pedidos: {
            ...contexto.pedidos,
            lista: [pedido, ...contexto.pedidos.lista],
            total: contexto.pedidos.total + 1,
            activo: pedido.id,
        },
    };
};

export const seleccionadosCambiados: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    seleccionados: payload as string[],
});

export type GrupoAlbaranar = {
    etiqueta: string;
    ids: string[];
};

const pedidosDe = (ids: string[], pedidos: Pedido[]): Pedido[] =>
    ids.map((id) => pedidos.find((p) => p.id === id)).filter((p): p is Pedido => !!p);

export const agruparPorProveedor = (ids: string[], pedidos: Pedido[]): GrupoAlbaranar[] => {
    const grupos = new Map<string, GrupoAlbaranar>();

    pedidosDe(ids, pedidos).forEach((pedido) => {
        const clave = pedido.proveedorId || pedido.nombreProveedor || "";
        const etiqueta = pedido.nombreProveedor || pedido.proveedorId || tCompras("pedido.albaranar.sinProveedor");
        const grupo = grupos.get(clave) ?? { etiqueta, ids: [] };
        grupos.set(clave, { ...grupo, ids: [...grupo.ids, pedido.id] });
    });

    return [...grupos.values()];
};

export const puedenAlbaranarse = (ids: string[], pedidos: Pedido[]): boolean => {
    const elegidos = pedidosDe(ids, pedidos);
    if (elegidos.length === 0 || elegidos.length !== ids.length) return false;

    return elegidos.every(pedidoAlbaranable);
};

const mensajeDeError = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

export const albaranarSeleccionados: ProcesarMaestro = async (contexto) => {
    const grupos = agruparPorProveedor(contexto.seleccionados, contexto.pedidos.lista);

    const resultados = await Promise.allSettled(
        grupos.map((grupo) => albaranarPedidos(grupo.ids))
    );

    const resultado = await getPedidos(contexto.pedidos.criteria);
    const recargado = (await Pedidos.recargar(contexto, resultado)) as ContextoMaestroPedido;

    const creados = resultados.flatMap((res, indice) =>
        res.status === "fulfilled"
            ? [{ ...res.value, etiqueta: grupos[indice].etiqueta }]
            : []
    );

    const fallidos = resultados.flatMap((res, indice) =>
        res.status === "rejected"
            ? [`${grupos[indice].etiqueta}: ${mensajeDeError(res.reason)}`]
            : []
    );

    return {
        ...recargado,
        estado: "ALBARAN_CREADO",
        seleccionados: [],
        resultado: { creados, fallidos },
    };
};
