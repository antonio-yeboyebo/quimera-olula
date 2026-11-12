import { ComparativaVentas, ResultadoComparativaVentas } from "../diseño.ts";

export type EstadoDetalleComparativaVentas = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleComparativaVentas = {
    estado: EstadoDetalleComparativaVentas;
    comparativa: ComparativaVentas;
    resultado: ResultadoComparativaVentas | null;
};
