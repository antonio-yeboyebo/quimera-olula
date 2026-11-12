import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { CambiosComparativaVentas, ComparativaVentas } from "../diseño.ts";
import { comparativaVentasVacia, metaComparativaVentas } from "../dominio.ts";
import {
    getComparativaVentas,
    getResultadoComparativaVentas,
    patchComparativaVentas,
} from "../infraestructura.ts";
import {
    ContextoDetalleComparativaVentas,
    EstadoDetalleComparativaVentas,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleComparativaVentas,
    ContextoDetalleComparativaVentas
>;

const pipeComparativa = ejecutarListaProcesos<
    EstadoDetalleComparativaVentas,
    ContextoDetalleComparativaVentas
>;

export const metaDetalleComparativaVentas = metaComparativaVentas<ComparativaVentas>();

export const contextoDetalleComparativaVentasInicial: ContextoDetalleComparativaVentas = {
    estado: "INICIAL",
    comparativa: comparativaVentasVacia(),
    resultado: null,
};

const CAMPOS = [
    "descripcion",
    "anioDesde",
    "anioHasta",
    "intervaloId",
    "fechaDesde",
    "fechaHasta",
    "clienteId",
    "agenteId",
    "busquedaAgente",
    "provinciaId",
    "mostrarObjetivo",
] as const satisfies readonly (keyof CambiosComparativaVentas)[];

export const cambiosDeComparativa = (
    previa: ComparativaVentas,
    actual: ComparativaVentas
): CambiosComparativaVentas => {
    const cambios: CambiosComparativaVentas = {};
    CAMPOS.forEach((campo) => {
        if (actual[campo] !== previa[campo]) {
            (cambios as Record<string, unknown>)[campo] = actual[campo];
        }
    });
    return cambios;
};

export const guardarComparativa = async (
    contexto: ContextoDetalleComparativaVentas,
    comparativa: ComparativaVentas
): Promise<void> => {
    const cambios = cambiosDeComparativa(contexto.comparativa, comparativa);
    if (Object.keys(cambios).length === 0) return;
    await patchComparativaVentas(comparativa.id, cambios);
};

export const refrescarComparativa: ProcesarDetalle = async (contexto) => {
    const comparativa = await getComparativaVentas(contexto.comparativa.id);
    return [
        { ...contexto, comparativa, resultado: null },
        [["comparativa_cambiada", comparativa]],
    ];
};

export const calcularResultado: ProcesarDetalle = async (contexto) => {
    const resultado = await getResultadoComparativaVentas(contexto.comparativa.id);
    return { ...contexto, resultado };
};

export const cargarComparativa: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const comparativa = await getComparativaVentas(id);
        return pipeComparativa(contexto, [
            async (ctx) => ({ ...ctx, comparativa, resultado: null }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarComparativa(id)(contexto);
    }
    return {
        ...contexto,
        estado: "INICIAL",
        comparativa: comparativaVentasVacia(),
        resultado: null,
    };
};
