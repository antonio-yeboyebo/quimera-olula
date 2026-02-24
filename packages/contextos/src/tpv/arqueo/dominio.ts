import { formatearMoneda } from "@olula/lib/dominio.js";
import { MovimientoEfectivo } from "./crear_movimiento_efectivo/diseño.ts";
import { ArqueoTpv } from "./diseño.ts";

const idDivisa = 'EUR';

export const moneda = (v: number) => formatearMoneda(v, idDivisa);

export const totalMovimientos = (
    movimientos: MovimientoEfectivo[]
) => movimientos.reduce((total, movimiento) => total + movimiento.importe, 0);

export const totalEfectivo = (
    arqueo: ArqueoTpv
) => arqueo.efectivoInicial + totalMovimientos(arqueo.movimientos) + arqueo.pagosEfectivo;