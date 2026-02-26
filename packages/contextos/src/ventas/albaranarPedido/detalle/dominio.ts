import { ProcesarContexto } from "@olula/lib/diseño.js";
import { cambiarItem, cargar, listaSeleccionableVacia, seleccionarItem } from "@olula/lib/entidad.ts";
import { pedidoVacioObjeto } from "../../pedido/detalle/dominio.ts";
import { getLineas, getPedido } from "../../pedido/infraestructura.ts";
import { LineaAlbaranarPedido, Tramo } from "../diseño.ts";
import { patchAlbaranarPedido } from "../infraestructura.ts";
import { ContextoAlbaranarPedido, EstadoAlbaranarPedido } from "./diseño.ts";

export const contextoVacio: ContextoAlbaranarPedido = {
    estado: "INICIAL",
    pedido: pedidoVacioObjeto,
    lineas: listaSeleccionableVacia<LineaAlbaranarPedido>(),
};

type ProcesarAlbaranarPedido = ProcesarContexto<EstadoAlbaranarPedido, ContextoAlbaranarPedido>;

export const cargarDatos: ProcesarAlbaranarPedido = async (contexto, pedidoId) => {
    const pedidoIdStr = pedidoId as string;
    const pedido = await getPedido(pedidoIdStr);
    const lineasData = await getLineas(pedidoIdStr);

    return {
        ...contexto,
        pedido,
        lineas: cargar(lineasData)(contexto.lineas),
        estado: "LISTO",
    };
};

export const seleccionarLinea: ProcesarAlbaranarPedido = async (contexto, payload) => {
    const linea = payload as LineaAlbaranarPedido;
    return {
        ...contexto,
        lineas: seleccionarItem(linea)(contexto.lineas),
    };
};

export const cambiarLinea: ProcesarAlbaranarPedido = async (contexto, payload) => {
    const linea = payload as LineaAlbaranarPedido;
    return {
        ...contexto,
        lineas: cambiarItem(linea)(contexto.lineas),
    };
};

export const actualizarTramos: ProcesarAlbaranarPedido = async (contexto, payload) => {
    const { id, tramos } = payload as { id: string; tramos: Tramo[] };
    const lineasActualizadas = contexto.lineas.lista.map((l) => {
        if (String(l.id) !== String(id)) return l;
        const a_enviar = (tramos || []).reduce(
            (acc, t) => acc + (Number(t.cantidad) || 0),
            0
        );
        return {
            ...l,
            tramos,
            a_enviar,
        } as LineaAlbaranarPedido;
    });

    return {
        ...contexto,
        lineas: {
            ...contexto.lineas,
            lista: lineasActualizadas,
        },
    };
};

export const actualizarEstadoCerradoLinea: ProcesarAlbaranarPedido = async (contexto, payload) => {
    const { id, cerrada } = payload as { id: string; cerrada: boolean };
    const lineasActualizadas = contexto.lineas.lista.map((l) => {
        if (String(l.id) !== String(id)) return l;
        return {
            ...l,
            cerrada,
        } as LineaAlbaranarPedido;
    });

    return {
        ...contexto,
        lineas: {
            ...contexto.lineas,
            lista: lineasActualizadas,
        },
    };
};

export const cancelarSeleccion: ProcesarAlbaranarPedido = async (contexto) => {
    return {
        ...contexto,
        lineas: {
            ...contexto.lineas,
            idActivo: null,
        },
    };
};

export const albaranarPedido: ProcesarAlbaranarPedido = async (contexto) => {
    await patchAlbaranarPedido(contexto.pedido.id, contexto.lineas.lista);

    const pedidoActualizado = await getPedido(contexto.pedido.id);
    const lineasActualizadas = await getLineas(contexto.pedido.id);

    return {
        ...contexto,
        pedido: pedidoActualizado,
        lineas: cargar(lineasActualizadas)(contexto.lineas),
    };
};

export const puedeAlbaranar = (datos: {
    pedido: ContextoAlbaranarPedido['pedido'];
    lineas: ContextoAlbaranarPedido['lineas'];
}): boolean => {
    const { pedido, lineas } = datos;
    const hayLineasParaEnviar = lineas.lista.some((linea) => {
        return (
            linea.a_enviar !== undefined &&
            linea.a_enviar !== null &&
            linea.a_enviar > 0
        );
    });

    return hayLineasParaEnviar &&
        (pedido.servido === "PENDIENTE" || pedido.servido === "PARCIAL");
};

export const pedidoEsEditable = (pedido: { servido?: string }): boolean => {
    const servido = pedido.servido?.toUpperCase();
    return servido !== 'TOTAL' && servido !== 'SERVIDO';
};
