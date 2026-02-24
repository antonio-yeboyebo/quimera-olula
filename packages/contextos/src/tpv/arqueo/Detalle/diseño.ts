import { MetaModelo } from "@olula/lib/dominio.js";
import { ArqueoTpv } from "../diseño.ts";

export const metaArqueoTpv: MetaModelo<ArqueoTpv> = {
    campos: {
        efectivoInicial: { tipo: 'moneda', requerido: true },
        idAgenteInicial: { requerido: true },
    },
};

export const arqueoTpvVacio: ArqueoTpv = {
    id: "",
    fechahoraApertura: new Date(),
    idAgenteApertura: "",
    fechahoraCierre: null,
    idAgenteCierre: null,
    abierto: false,
    pagosEfectivo: 0,
    pagosTarjeta: 0,
    pagosVale: 0,
    recuentoCaja: {
        b500: 0,
        b200: 0,
        b100: 0,
        b50: 0,
        b20: 0,
        b10: 0,
        b5: 0,
        m2: 0,
        m1: 0,
        m050: 0,
        m020: 0,
        m010: 0,
        m005: 0,
        m002: 0,
        m001: 0
    },
    recuentoEfectivo: 0,
    recuentoTarjeta: 0,
    recuentoVales: 0,
    movimientoCierre: 0,
    efectivoInicial: 0,
    movimientos: []
};

export type EstadoArqueoTpv = (
    'INICIAL' | "ABIERTO" | "CERRADO"
    | "BORRANDO_ARQUEO" | "RECONTANDO" | "CERRANDO"
    | "REABRIENDO"
    | "CREANDO_MOVIMIENTO" | "BORRANDO_MOVIMIENTO"
);


export type ContextoArqueoTpv = {
    estado: EstadoArqueoTpv,
    arqueo: ArqueoTpv;
    // arqueoInicial: ArqueoTpv;
    // pagoActivo: PagoVentaTpv | null;
};


