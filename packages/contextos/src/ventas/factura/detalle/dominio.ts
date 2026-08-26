import { CambioAgente } from "#/ventas/comun/componentes/moleculas/CambiarAgente/diseño.ts";
import { CambioDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/diseño.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, publicar } from "@olula/lib/dominio.ts";
import { CambioClienteFactura, Factura, LineaFactura } from "../diseño.ts";
import { facturaVacia } from "../dominio.ts";
import {
    deleteLinea,
    getFactura,
    getLineas,
    patchCambiarAgente,
    patchCambiarCliente,
    patchCambiarDescuento,
    patchCambiarDivisa,
    patchCantidadLinea,
    patchEmitirFactura,
    patchFactura,
    patchLinea
} from "../infraestructura.ts";
import { ContextoFactura, EstadoFactura } from "./diseño.ts";

type ProcesarFactura = ProcesarContexto<EstadoFactura, ContextoFactura>;

const pipeFactura = ejecutarListaProcesos<EstadoFactura, ContextoFactura>;

const cargarFactura = (idFactura: string): ProcesarFactura =>
    async (contexto) => {
        const factura = await getFactura(idFactura);
        return {
            ...contexto,
            factura,
        };
    };

export const refrescarFactura: ProcesarFactura = async (contexto) => {
    const factura = await getFactura(contexto.factura.id);
    return [
        {
            ...contexto,
            factura: {
                ...contexto.factura,
                ...factura,
            },
        },
        [["factura_cambiada", factura]],
    ];
};

export const cancelarCambioFactura: ProcesarFactura = async (contexto) => {
    return {
        ...contexto,
        factura: contexto.facturaInicial,
    };
};

export const refrescarLineas: ProcesarFactura = async (contexto) => {
    const lineas = await getLineas(contexto.factura.id);
    return {
        ...contexto,
        factura: {
            ...contexto.factura,
            lineas: lineas as LineaFactura[],
        },
    };
};

export const activarLinea: ProcesarFactura = async (contexto, payload) => {
    const lineaActiva = payload as LineaFactura;
    return {
        ...contexto,
        lineaActiva,
    };
};

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoFactura) => {
    const lineas = contexto.factura.lineas as LineaFactura[];
    const lineaActiva = lineas.length > 0
        ? indice >= 0 && indice < lineas.length
            ? lineas[indice]
            : lineas[lineas.length - 1]
        : null;

    return {
        ...contexto,
        lineaActiva,
    };
};

const facturaVaciaObjeto: Factura = facturaVacia();

const facturaVaciaContexto = (): Factura => ({ ...facturaVaciaObjeto });

export const getContextoVacio: ProcesarFactura = async (contexto) => {
    return {
        ...contexto,
        estado: "INICIAL",
        factura: facturaVaciaContexto(),
        lineaActiva: null,
    };
};

export const cargarContexto: ProcesarFactura = async (contexto, payload) => {
    const idFactura = payload as string;
    if (idFactura) {
        return pipeFactura(contexto, [
            cargarFactura(idFactura),
            refrescarLineas,
            abrirFactura,
            activarLineaPorIndice(0),
        ]);
    } else {
        return getContextoVacio(contexto);
    }
};

export const abrirFactura: ProcesarFactura = async (contexto) => ({
    ...contexto,
    estado: "ABIERTO",
});

export const cambiarFactura: ProcesarFactura = async (contexto, payload) => {
    const factura = payload as Factura;
    await patchFactura(contexto.factura.id, factura);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

/** La respuesta solo confirma, así que el nuevo estado llega al recargar. */
export const emitirFactura: ProcesarFactura = async (contexto) => {
    await patchEmitirFactura(contexto.factura.id);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

export const borrarFactura: ProcesarFactura = async (contexto) => {
    return pipeFactura(contexto, [getContextoVacio, publicar("factura_borrada", contexto.factura.id)]);
};

export const cambiarCliente: ProcesarFactura = async (contexto, payload) => {
    const cambio = payload as CambioClienteFactura;
    await patchCambiarCliente(contexto.factura.id, cambio);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

export const cambiarDivisa: ProcesarFactura = async (contexto, payload) => {
    const cambio = payload as CambioDivisa;
    await patchCambiarDivisa(contexto.factura.id, cambio);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

export const cambiarAgente: ProcesarFactura = async (contexto, payload) => {
    const cambio = payload as CambioAgente;
    await patchCambiarAgente(contexto.factura.id, cambio);

    return pipeFactura(contexto, [
        refrescarFactura,
        "ABIERTO",
    ]);
};

export const cambiarDescuento: ProcesarFactura = async (contexto, payload) => {
    const { dto_porcentual } = payload as { dto_porcentual: number };
    await patchCambiarDescuento(contexto.factura.id, dto_porcentual);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

export const crearLinea: ProcesarFactura = async (contexto) => {
    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

export const cambiarLinea: ProcesarFactura = async (contexto, payload) => {
    const linea = payload as LineaFactura;

    await patchLinea(contexto.factura.id, linea);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        "ABIERTO",
    ]);
};

export const cambiarCantidadLinea: ProcesarFactura = async (contexto, payload) => {
    const { lineaId, cantidad } = payload as { lineaId: string; cantidad: number };

    const linea = (contexto.factura.lineas as LineaFactura[]).find((l) => l.id === lineaId);
    if (!linea) return contexto;

    await patchCantidadLinea(contexto.factura.id, linea, cantidad);

    const lineasActualizadas = await getLineas(contexto.factura.id);
    const facturaActualizada = await getFactura(contexto.factura.id);

    return {
        estado: "ABIERTO" as EstadoFactura,
        factura: {
            ...facturaActualizada,
            lineas: lineasActualizadas,
        },
        facturaInicial: contexto.facturaInicial,
        lineaActiva: lineasActualizadas.find((l) => l.id === lineaId) || null,
    };
};

export const borrarLinea: ProcesarFactura = async (contexto, payload) => {
    const idLinea = payload as string;
    const indiceLineaActiva = (contexto.factura.lineas as LineaFactura[]).findIndex((l) => l.id === idLinea);

    await deleteLinea(contexto.factura.id, idLinea);

    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        activarLineaPorIndice(indiceLineaActiva),
        "ABIERTO",
    ]);
};


