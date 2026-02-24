import { Criteria, Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.js";

export interface CabeceraArqueoTpv extends Entidad {
    id: string;
    fechahoraApertura: Date;
    idAgenteApertura: string;
    fechahoraCierre: Date | null;
    idAgenteCierre: string | null;
    abierto: boolean;
    pagosEfectivo: number;
    pagosTarjeta: number;
    pagosVale: number;
    recuentoEfectivo: number;
    recuentoTarjeta: number;
    recuentoVales: number;
    recuentoCaja: Record<string, number>;
    movimientoCierre: number;
    efectivoInicial: number;
}

export interface MovimientoArqueoTpv extends Entidad {
    id: string;
    importe: number;
    fecha: Date;
    idAgente: string;
    agente: string;
}

type MovimientoArqueoTpvACrear = {
    importe: number;
    fecha: Date;
    idAgente: string;
}

export interface ArqueoTpv extends CabeceraArqueoTpv {
    movimientos: MovimientoArqueoTpv[];
}

export interface PagoArqueoTpv extends Entidad {
    id: string;
    importe: number;
    formaPago: string;
    fecha: Date;
    codigoVenta: string;
    vale: string | null;
}

export type CierreArqueoTpv = {
    idAgenteCierre: string,
    movimientoCierre: number
}

export type GetArqueoTpv = (id: string) => Promise<ArqueoTpv>;

export type GetArqueosTpv = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<CabeceraArqueoTpv>;

export type GetPagosArqueoTpv = (id: string, criteria: Criteria) => RespuestaLista<PagoArqueoTpv>;

export type PatchArqueo = (anterior: ArqueoTpv, arqueo: ArqueoTpv) => Promise<void>;

export type PatchRecuentoArqueo = (arqueo: ArqueoTpv) => Promise<void>;

export type PatchCerrarArqueo = (id: string, cierre: CierreArqueoTpv) => Promise<void>;

export type PatchReabrirArqueo = (id: string) => Promise<void>;

export type PatchCrearMovimiento = (id: string, movimiento: MovimientoArqueoTpvACrear) => Promise<void>;

export type PatchBorrarMovimiento = (id: string, idMovimiento: string) => Promise<void>;

export type PostArqueoTpv = () => Promise<string>;

export type DeleteArqueoTpv = (id: string) => Promise<void>;