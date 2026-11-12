import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export const AGENTE_FACTURA = "Agente en factura";
export const AGENTE_CLIENTE = "Agente en ficha de cliente";

export interface ComparativaVentas extends Entidad {
    id: string;
    descripcion: string;
    anioDesde: number;
    anioHasta: number;
    intervaloId: string;
    fechaDesde: string;
    fechaHasta: string;
    clienteId: string;
    nombreCliente: string;
    agenteId: string;
    nombreAgente: string;
    busquedaAgente: string;
    provinciaId: string;
    nombreProvincia: string;
    mostrarObjetivo: boolean;
}

export interface NuevaComparativaVentas extends Modelo {
    descripcion: string;
    anioDesde: number;
    anioHasta: number;
    intervaloId: string;
    fechaDesde: string;
    fechaHasta: string;
    clienteId: string;
    nombreCliente: string;
    agenteId: string;
    nombreAgente: string;
    busquedaAgente: string;
    provinciaId: string;
    nombreProvincia: string;
    mostrarObjetivo: boolean;
}

export type CambiosComparativaVentas = Partial<
    Pick<
        ComparativaVentas,
        | "descripcion"
        | "anioDesde"
        | "anioHasta"
        | "intervaloId"
        | "fechaDesde"
        | "fechaHasta"
        | "clienteId"
        | "agenteId"
        | "busquedaAgente"
        | "provinciaId"
        | "mostrarObjetivo"
    >
>;

export interface FilaComparativaVentas extends Entidad {
    id: string;
    clienteId: string;
    nombre: string;
    ventas: number[];
    incrementos: number[];
    objetivo: number | null;
    porcentajeObjetivo: number | null;
}

export interface ResultadoComparativaVentas {
    anios: number[];
    mostrarObjetivo: boolean;
    filas: FilaComparativaVentas[];
    totales: number[];
    totalObjetivo: number | null;
}

export type GetListaComparativaVentas = (
    criteria: Criteria
) => RespuestaLista<ComparativaVentas>;
export type GetComparativaVentas = (id: string) => Promise<ComparativaVentas>;
export type GetResultadoComparativaVentas = (
    id: string
) => Promise<ResultadoComparativaVentas>;
export type PostComparativaVentas = (
    nueva: NuevaComparativaVentas
) => Promise<string>;
export type PatchComparativaVentas = (
    id: string,
    cambios: CambiosComparativaVentas
) => Promise<void>;
export type DeleteComparativaVentas = (id: string) => Promise<void>;
export type GetReportComparativaVentas = (id: string) => Promise<Blob>;
