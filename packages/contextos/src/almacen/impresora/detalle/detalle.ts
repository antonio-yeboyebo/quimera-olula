import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { EstadoImpresora } from "../diseño.ts";
import { impresoraVacia } from "../dominio.ts";
import { getEstadoImpresora, getImpresora, postEtiquetaPruebaImpresora } from "../infraestructura.ts";
import { ContextoDetalleImpresora, EstadoDetalleImpresora } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleImpresora, ContextoDetalleImpresora>;

export const contextoDetalleImpresoraInicial: ContextoDetalleImpresora = {
    estado: "INICIAL",
    impresora: impresoraVacia(),
    estadoImpresora: null,
};

export const refrescarImpresora: ProcesarDetalle = async (contexto) => {
    const impresora = await getImpresora(contexto.impresora.id);
    return [
        { ...contexto, impresora },
        [["impresora_cambiada", impresora]],
    ];
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", impresora: impresoraVacia(), estadoImpresora: null };
    }
    const impresora = await getImpresora(id);
    return { ...contexto, estado: "ABIERTO", impresora, estadoImpresora: null };
};

const comprobarEstado: ProcesarDetalle = async (contexto) => {
    const estadoImpresora = await getEstadoImpresora(contexto.impresora.id);
    return { ...contexto, estadoImpresora };
};

/** Lo que ha contestado la impresora (ver ComprobarEstadoImpresora). */
export const guardarEstado: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    estadoImpresora: payload as EstadoImpresora,
});

/** Tras imprimir, vuelve a preguntar el estado: así se ve si se ha quedado sin papel. */
export const imprimirPrueba: ProcesarDetalle = async (contexto) => {
    await postEtiquetaPruebaImpresora(contexto.impresora.id);
    return comprobarEstado(contexto);
};
