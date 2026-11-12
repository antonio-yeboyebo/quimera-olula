import { CambioAgente } from "#/ventas/comun/componentes/moleculas/CambiarAgente/diseño.ts";
import { CambioDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/diseño.ts";
import { cambioClienteVentaVacio, clienteVentaVacio, metaVenta, puedeCambiarAlmacen, ventaVacia } from "#/ventas/venta/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaCampo, MetaModelo, modeloEsEditable, publicar } from "@olula/lib/dominio.ts";
import {
    CambioClientePedido,
    LineaPedido,
    Pedido
} from "../diseño.ts";
import { pedidoEsEditable, pedidoPendiente } from "../dominio.ts";
import {
    getLineas,
    getPedido,
    patchCambiarAgente,
    patchCambiarCliente,
    patchCambiarDescuento,
    patchCambiarDivisa,
    patchCantidadLinea,
    patchPedido
} from "../infraestructura.ts";
import { ContextoPedido, EstadoPedido } from "./diseño.ts";


export const pedidoVacio = (): Pedido => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    servido: 'No',
    por_comision: 0,
    fecha_salida: null,
    almacen_id: '',
    nombre_almacen: '',
    lineas: [],
})



export const cambioClientePedidoVacio: CambioClientePedido = cambioClienteVentaVacio;

const camposPedido: Record<string, MetaCampo<Pedido>> = {
    ...metaVenta.campos,
    fecha: { tipo: "fecha", requerido: false },
    fecha_salida: { tipo: "fecha", requerido: false },
    almacen_id: { requerido: true },
    nombre_almacen: { bloqueado: true },
    divisa_id: { requerido: true, bloqueado: true },
    tasa_conversion: { tipo: "numero", requerido: true, bloqueado: true },
    agente_id: { bloqueado: true },
    por_comision: { tipo: "decimal", requerido: false, decimales: 2, positivo: true, maximo: 100, bloqueado: true },
};

/** Campos que el servidor solo deja cambiar si no se ha servido nada. */
const CAMPOS_SOLO_PENDIENTE = ['grupo_iva_negocio_id'];

const campoPedidoEditable = (pedido: Pedido, campo?: string): boolean => {
    if (!pedidoEsEditable(pedido)) return false;
    if (campo && CAMPOS_SOLO_PENDIENTE.includes(campo) && !pedidoPendiente(pedido)) return false;
    return campo === 'almacen_id' ? puedeCambiarAlmacen(pedido) : true;
};

export const metaPedido: MetaModelo<Pedido> = {
    campos: camposPedido,
    editable: campoPedidoEditable,
};

export const getMetaPedido = <T extends Pedido>() => <MetaModelo<T>>({
    campos: {
        ...camposPedido,
    },
    editable: campoPedidoEditable,
});

export const editable = modeloEsEditable<Pedido>(metaPedido);

export const pedidoVacioObjeto: Pedido = pedidoVacio();

export const pedidoVacioContexto = (): Pedido => ({ ...pedidoVacioObjeto });


type ProcesarPedido = ProcesarContexto<EstadoPedido, ContextoPedido<Pedido>>;

const pipePedido = ejecutarListaProcesos<EstadoPedido, ContextoPedido<Pedido>>;

const cargarPedido: (_: string) => ProcesarPedido = (idPedido) =>
    async (contexto) => {
        const pedido = await getPedido(idPedido);
        return {
            ...contexto,
            pedido,
        }
    }

export const refrescarPedido: ProcesarPedido = async (contexto) => {
    const pedido = await getPedido(contexto.pedido.id);
    return [
        {
            ...contexto,
            pedido: {
                ...contexto.pedido,
                ...pedido
            },
        },
        [["pedido_cambiado", pedido]]
    ]
}

export const cancelarCambioPedido: ProcesarPedido = async (contexto) => {
    return {
        ...contexto,
        pedido: contexto.pedidoInicial
    }
}

export const abiertoOServido: ProcesarPedido = async (contexto) => {
    const servido = contexto.pedido.servido?.toUpperCase();
    const esServido = servido === 'SI' || servido === 'SERVIDO' || servido === 'TOTAL';
    return {
        ...contexto,
        estado: esServido ? "SERVIDO" : "ABIERTO"
    }
}

export const refrescarLineas: ProcesarPedido = async (contexto) => {
    const lineas = await getLineas(contexto.pedido.id);
    return {
        ...contexto,
        pedido: {
            ...contexto.pedido,
            lineas: lineas as LineaPedido[]
        }
    }
}

export const activarLinea: ProcesarPedido = async (contexto, payload) => {
    const lineaActiva = payload as LineaPedido;
    return {
        ...contexto,
        lineaActiva
    }
}

const actualizarLineaActiva: ProcesarPedido = async (contexto) => {
    if (!contexto.lineaActiva) return contexto;
    const lineaActiva = (contexto.pedido.lineas as LineaPedido[]).find(
        l => l.id === contexto.lineaActiva?.id
    ) ?? contexto.lineaActiva;
    return { ...contexto, lineaActiva };
}

const activarLineaPorId = (id: string) => async (contexto: ContextoPedido<Pedido>) => {
    const lineas = contexto.pedido.lineas as LineaPedido[];
    const lineaActiva = lineas.find(l => l.id === id) ?? null;
    return { ...contexto, lineaActiva };
}

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoPedido<Pedido>) => {
    const lineas = contexto.pedido.lineas as LineaPedido[];
    const lineaActiva = lineas.length > 0
        ? indice >= 0 && indice < lineas.length
            ? lineas[indice]
            : lineas[lineas.length - 1]
        : null

    return {
        ...contexto,
        lineaActiva
    }
}

export const getContextoVacio: ProcesarPedido = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL',
        pedido: pedidoVacioContexto(),
        lineaActiva: null
    }
}

export const cargarContexto: ProcesarPedido = async (contexto, payload) => {
    const idPedido = payload as string;
    if (idPedido) {
        return pipePedido(
            contexto,
            [
                cargarPedido(idPedido),
                refrescarLineas,
                abiertoOServido,
                activarLineaPorIndice(0),
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}

export const cambiarPedido: ProcesarPedido = async (contexto, payload) => {
    const pedido = payload as Pedido;
    await patchPedido(contexto.pedido.id, pedido);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const borrarPedido: ProcesarPedido = async (contexto) => {
    return pipePedido(contexto, [
        publicar('pedido_borrado', (ctx) => ctx.pedido.id),
        getContextoVacio
    ]);
}

export const cambiarCliente: ProcesarPedido = async (contexto, payload) => {
    const cambio = payload as CambioClientePedido;
    await patchCambiarCliente(contexto.pedido.id, cambio);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarDivisa: ProcesarPedido = async (contexto, payload) => {
    const cambio = payload as CambioDivisa;
    await patchCambiarDivisa(contexto.pedido.id, cambio);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarAgente: ProcesarPedido = async (contexto, payload) => {
    const cambio = payload as CambioAgente;
    await patchCambiarAgente(contexto.pedido.id, cambio);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        actualizarLineaActiva,
        'ABIERTO',
    ]);
}

export const cambiarDescuento: ProcesarPedido = async (contexto, payload) => {
    const { dto_porcentual } = payload as { dto_porcentual: number };
    await patchCambiarDescuento(contexto.pedido.id, dto_porcentual);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const crearLinea: ProcesarPedido = async (contexto, payload) => {
    const { id } = payload as { id: string };
    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        activarLineaPorId(id),
        'ABIERTO',
    ]);
}

export const cambiarLinea: ProcesarPedido = async (contexto) => {
    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        actualizarLineaActiva,
        'ABIERTO',
    ]);
}

export const cambiarCantidadLinea: ProcesarPedido = async (contexto, payload) => {
    const { lineaId, cantidad } = payload as { lineaId: string, cantidad: number };

    const linea = (contexto.pedido.lineas as LineaPedido[]).find((l: LineaPedido) => l.id === lineaId);
    if (!linea) return contexto;

    await patchCantidadLinea(contexto.pedido.id, linea, cantidad);

    const lineasActualizadas = await getLineas(contexto.pedido.id);
    const pedidoActualizado = await getPedido(contexto.pedido.id);

    return {
        estado: "ABIERTO" as EstadoPedido,
        pedido: {
            ...pedidoActualizado,
            lineas: lineasActualizadas
        },
        pedidoInicial: contexto.pedidoInicial,
        lineaActiva: lineasActualizadas.find(l => l.id === lineaId) || null,
    };
}

export const borrarLinea: ProcesarPedido = async (contexto, payload) => {
    const idLinea = payload as string;
    const indiceLineaActiva = (contexto.pedido.lineas as LineaPedido[]).findIndex((l: LineaPedido) => l.id === idLinea);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        activarLineaPorIndice(indiceLineaActiva),
        'ABIERTO',
    ]);
}
