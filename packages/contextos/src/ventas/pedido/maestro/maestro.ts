import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { EstadoDocumento } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import { pedidoEsEditable } from "#/ventas/pedido/dominio.ts";
import { postAlbaranarPedidos } from "#/ventas/pedido/infraestructura.ts";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Pedido } from "../diseño.ts";
import { getPedidos } from "../infraestructura.ts";
import { ContextoMaestroPedido, EstadoMaestroPedido } from "./diseño.ts";
import { tVentas } from "../../i18n/index.ts";

type ProcesarPedidos = ProcesarContexto<EstadoMaestroPedido, ContextoMaestroPedido>;

const conPedidos = (fn: ProcesarListaActivaEntidades<Pedido>) => (ctx: ContextoMaestroPedido) => ({ ...ctx, pedidos: fn(ctx.pedidos) });

export const Pedidos = accionesListaActivaEntidades(conPedidos);

export const recargarPedidos: ProcesarPedidos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPedidos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Pedidos.recargar(contexto, resultado);
}

export const ampliarPedidos: ProcesarPedidos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPedidos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Pedidos.ampliar(contexto, resultado);
}

export const estadoServidoPedido = (pedido: { servido?: string }): EstadoDocumento => {
    const servido = pedido.servido?.toUpperCase();
    if (servido === 'TOTAL' || servido === 'SERVIDO') return "cerrado";
    if (servido === 'PARCIAL') return "parcial";
    return "pendiente";
};

export const puedeAlbaranarse = (pedido: Pedido): boolean => pedidoEsEditable(pedido);

export const todosPuedenAlbaranarse = (ids: string[], pedidos: Pedido[]): boolean => {
    if (ids.length === 0) return false;
    return ids.every(id => {
        const pedido = pedidos.find(p => p.id === id);
        return pedido !== undefined && puedeAlbaranarse(pedido);
    });
}

export type GrupoAlbaranar = {
    etiqueta: string;
    ids: string[];
};

const etiquetaCliente = (pedido: Pedido): string =>
    pedido.cliente?.nombre_cliente || pedido.cliente?.cliente_id || tVentas("pedido.maestro.sinCliente");

const claveCliente = (pedido: Pedido): string =>
    [
        pedido.cliente?.cliente_id ?? "",
        pedido.cliente?.nombre_cliente ?? "",
        pedido.cliente?.id_fiscal ?? "",
    ].join("|");

export const agruparPorCliente = (ids: string[], pedidos: Pedido[]): GrupoAlbaranar[] => {
    const grupos = new Map<string, GrupoAlbaranar>();

    ids.forEach(id => {
        const pedido = pedidos.find(p => p.id === id);
        if (!pedido) return;
        const clave = claveCliente(pedido);
        const grupo = grupos.get(clave) ?? { etiqueta: etiquetaCliente(pedido), ids: [] };
        grupos.set(clave, { ...grupo, ids: [...grupo.ids, id] });
    });

    return [...grupos.values()];
}

export const albaranarPedidos: ProcesarPedidos = async (contexto) => {
    const grupos = agruparPorCliente(contexto.seleccionados, contexto.pedidos.lista);
    const resultados = await Promise.allSettled(
        grupos.map((grupo) => postAlbaranarPedidos(grupo.ids))
    );

    const { filtro, orden, paginacion } = contexto.pedidos.criteria;
    const lista = await getPedidos(filtro, orden, paginacion);
    const recargado = await Pedidos.recargar(contexto, lista) as ContextoMaestroPedido;

    const albaranesCreados = resultados.flatMap((resultado, indice) =>
        resultado.status === "fulfilled"
            ? [{ ...resultado.value, etiqueta: grupos[indice].etiqueta }]
            : []
    );

    const fallidos = resultados.flatMap((resultado, indice) =>
        resultado.status === "rejected"
            ? [`${grupos[indice].etiqueta}: ${mensajeDeError(resultado.reason)}`]
            : []
    );

    return {
        ...recargado,
        estado: "ALBARANES_CREADOS" as EstadoMaestroPedido,
        seleccionados: [],
        albaranesCreados,
        fallidos,
    };
}

const mensajeDeError = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

const etiquetasServido = (): Record<EstadoDocumento, EstadoEtiqueta> => ({
    pendiente: { texto: tVentas("pedido.estado.pendiente"), tono: "pendiente" },
    parcial: { texto: tVentas("pedido.estado.parcial"), tono: "parcial" },
    cerrado: { texto: tVentas("pedido.estado.servido"), tono: "completado" },
});

export const etiquetaEstadoPedido = (pedido: { servido?: string }): EstadoEtiqueta =>
    etiquetasServido()[estadoServidoPedido(pedido)];
